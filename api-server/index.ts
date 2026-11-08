import Fastify from "fastify"
import cors from "@fastify/cors"
import helmet from "@fastify/helmet"
import { PrismaClient } from "@prisma/client"
import Stripe from "stripe"
import AlipaySdk from "alipay-sdk"
import { ethers } from "ethers"

const fastify = Fastify({
  logger: true,
})

const prisma = new PrismaClient()

// Initialize payment providers
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" })
  : null

const alipay = process.env.ALIPAY_APP_ID && process.env.ALIPAY_PRIVATE_KEY
  ? new AlipaySdk({
      appId: process.env.ALIPAY_APP_ID,
      privateKey: process.env.ALIPAY_PRIVATE_KEY,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
      gateway: process.env.ALIPAY_GATEWAY || "https://openapi.alipay.com/gateway.do",
    })
  : null

// Security plugins
await fastify.register(helmet)
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
})

// Health check
fastify.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() }
})

// Submit audit request
fastify.post<{
  Body: { serverUrl: string; serverName?: string; plan?: string }
}>("/api/audit/submit", async (request, reply) => {
  const { serverUrl, serverName, plan = "standard" } = request.body
  
  // Validate input
  if (!serverUrl || !serverUrl.startsWith("http")) {
    return reply.code(400).send({ error: "Invalid server URL" })
  }
  
  try {
    // Create audit record
    const audit = await prisma.audit.create({
      data: {
        userId: "temp-user-id", // TODO: Get from auth token
        serverUrl,
        serverName,
        status: "pending",
        price: calculateAuditPrice(plan),
      },
    })
    
    // Trigger audit pipeline
    triggerAuditPipeline(audit.id)
    
    return {
      auditId: audit.id,
      status: "pending",
      estimatedTime: "5-10 minutes",
      price: audit.price,
    }
  } catch (error) {
    fastify.log.error(error)
    return reply.code(500).send({ error: "Failed to submit audit" })
  }
})

// Get audit status
fastify.get<{ Params: { id: string } }>("/api/audit/:id", async (request, reply) => {
  const { id } = request.params
  
  try {
    const audit = await prisma.audit.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    })
    
    if (!audit) {
      return reply.code(404).send({ error: "Audit not found" })
    }
    
    return audit
  } catch (error) {
    fastify.log.error(error)
    return reply.code(500).send({ error: "Failed to fetch audit" })
  }
})

// Create payment intent
fastify.post<{
  Body: { auditId: string; method: "stripe" | "alipay" | "usdc" }
}>("/api/payment/create", async (request, reply) => {
  const { auditId, method } = request.body
  
  try {
    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: { user: true },
    })
    
    if (!audit) {
      return reply.code(404).send({ error: "Audit not found" })
    }
    
    if (audit.paymentStatus === "paid") {
      return reply.code(400).send({ error: "Audit already paid" })
    }
    
    let paymentIntent
    
    switch (method) {
      case "stripe":
        paymentIntent = await createStripePayment(audit)
        break
      case "alipay":
        paymentIntent = await createAlipayPayment(audit)
        break
      case "usdc":
        paymentIntent = await createUSDCPayment(audit)
        break
      default:
        return reply.code(400).send({ error: "Unsupported payment method" })
    }
    
    // Record payment intent
    await prisma.paymentIntent.create({
      data: {
        userId: audit.userId,
        auditId: audit.id,
        amount: audit.price || 0,
        currency: "CNY",
        method,
        transactionId: paymentIntent.transactionId,
        status: "pending",
      },
    })
    
    return paymentIntent
  } catch (error) {
    fastify.log.error(error)
    return reply.code(500).send({ error: "Failed to create payment" })
  }
})

// Stripe webhook handler
fastify.post("/api/webhook/stripe", async (request, reply) => {
  const sig = request.headers["stripe-signature"]
  
  try {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return reply.code(500).send({ error: "Stripe not configured" })
    }
    
    const event = stripe.webhooks.constructEvent(
      request.body as any,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object
        await handlePaymentSuccess(paymentIntent.id, "stripe")
        break
      case "payment_intent.payment_failed":
        const failedIntent = event.data.object
        await handlePaymentFailure(failedIntent.id, "stripe")
        break
    }
    
    return { received: true }
  } catch (error) {
    fastify.log.error(error)
    return reply.code(400).send({ error: "Webhook signature verification failed" })
  }
})

// Helper functions
function calculateAuditPrice(plan: string): number {
  const prices = {
    founding: 3500000, // ¥35,000 in cents
    standard: 5000000, // ¥50,000 in cents
    enterprise: 10000000, // ¥100,000 in cents
  }
  return prices[plan as keyof typeof prices] || prices.standard
}

async function triggerAuditPipeline(auditId: string) {
  // TODO: Implement CCS 7-dimension audit pipeline
  // This will spawn 7 parallel workers for each dimension
  console.log(`Triggering audit pipeline for ${auditId}`)
}

async function createStripePayment(audit: any) {
  if (!stripe) throw new Error("Stripe not configured")
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: audit.price,
    currency: "cny",
    metadata: {
      auditId: audit.id,
      userId: audit.userId,
    },
  })
  
  return {
    clientSecret: paymentIntent.client_secret,
    transactionId: paymentIntent.id,
    method: "stripe",
  }
}

async function createAlipayPayment(audit: any) {
  if (!alipay) throw new Error("Alipay not configured")
  
  const result = await alipay.exec("alipay.trade.page.pay", {
    bizContent: {
      out_trade_no: `AUDIT_${audit.id}`,
      total_amount: (audit.price / 100).toFixed(2), // Convert cents to yuan
      subject: `CCS Audit - ${audit.serverName || audit.serverUrl}`,
      product_code: "FAST_INSTANT_TRADE_PAY",
    },
  })
  
  return {
    paymentUrl: result,
    transactionId: `AUDIT_${audit.id}`,
    method: "alipay",
  }
}

async function createUSDCPayment(audit: any) {
  // USDC on Base chain
  const usdcAmount = Math.round(audit.price / 100 / 7.2 * 1000000) // CNY to USDC (approx 7.2 CNY/USD)
  
  return {
    contractAddress: process.env.USDC_CONTRACT_ADDRESS,
    amount: usdcAmount.toString(),
    decimals: 6,
    network: "base",
    method: "usdc",
    qrCode: `ethereum:${process.env.USDC_CONTRACT_ADDRESS}@8453/transfer?address=${process.env.USDC_CONTRACT_ADDRESS}&uint256=${usdcAmount}`,
  }
}

async function handlePaymentSuccess(transactionId: string, method: string) {
  await prisma.paymentIntent.updateMany({
    where: { transactionId, method },
    data: { status: "succeeded" },
  })
  
  // Update audit payment status
  const paymentIntent = await prisma.paymentIntent.findFirst({
    where: { transactionId, method },
    include: { audit: true },
  })
  
  if (paymentIntent?.auditId) {
    await prisma.audit.update({
      where: { id: paymentIntent.auditId },
      data: {
        paymentStatus: "paid",
        paymentMethod: method,
        paymentId: transactionId,
      },
    })
  }
}

async function handlePaymentFailure(transactionId: string, method: string) {
  await prisma.paymentIntent.updateMany({
    where: { transactionId, method },
    data: { status: "failed" },
  })
}

// Start server
const port = parseInt(process.env.API_PORT || "4000")
const host = "0.0.0.0"

try {
  await fastify.listen({ port, host })
  console.log(`API server listening on http://${host}:${port}`)
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
