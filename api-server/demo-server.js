import Fastify from "fastify"
import cors from "@fastify/cors"
import helmet from "@fastify/helmet"
import { randomUUID } from "crypto"

const fastify = Fastify({
  logger: true,
})

// In-memory storage for demo
const audits = new Map()
const payments = new Map()

// Security plugins
await fastify.register(helmet)
await fastify.register(cors, {
  origin: "*",
  credentials: true,
})

// Health check
fastify.get("/health", async () => {
  return { 
    status: "ok", 
    timestamp: new Date().toISOString(),
    service: "Correctover API Server",
    version: "1.0.0"
  }
})

// Submit audit request
fastify.post("/api/audit/submit", async (request, reply) => {
  const { serverUrl, serverName, plan = "standard" } = request.body
  
  if (!serverUrl || !serverUrl.startsWith("http")) {
    return reply.code(400).send({ error: "Invalid server URL" })
  }
  
  const prices = {
    founding: 3500000,
    standard: 5000000,
    enterprise: 10000000,
  }
  
  const auditId = randomUUID()
  const audit = {
    id: auditId,
    serverUrl,
    serverName,
    plan,
    status: "pending",
    price: prices[plan] || prices.standard,
    createdAt: new Date().toISOString(),
    estimatedTime: "5-10 minutes",
  }
  
  audits.set(auditId, audit)
  
  console.log(`✓ Audit submitted: ${auditId}`)
  
  // Simulate audit processing
  setTimeout(() => {
    audit.status = "processing"
    console.log(`⚙ Processing audit: ${auditId}`)
    
    setTimeout(() => {
      audit.status = "completed"
      audit.overallGrade = "A"
      audit.overallScore = 92
      audit.dimensions = [
        { dimension: "Structure", score: 95, grade: "A" },
        { dimension: "Schema", score: 88, grade: "B" },
        { dimension: "Latency", score: 90, grade: "A" },
        { dimension: "Cost", score: 85, grade: "B" },
        { dimension: "Identity", score: 92, grade: "A" },
        { dimension: "Integrity", score: 94, grade: "A" },
        { dimension: "Security", score: 96, grade: "A" },
      ]
      audit.completedAt = new Date().toISOString()
      console.log(`✓ Audit completed: ${auditId}`)
    }, 5000)
  }, 2000)
  
  return {
    auditId,
    status: "pending",
    estimatedTime: "5-10 minutes",
    price: audit.price,
    message: "Audit submitted successfully",
  }
})

// Get audit status
fastify.get("/api/audit/:id", async (request, reply) => {
  const { id } = request.params
  
  const audit = audits.get(id)
  
  if (!audit) {
    return reply.code(404).send({ error: "Audit not found" })
  }
  
  return audit
})

// Create payment intent
fastify.post("/api/payment/create", async (request, reply) => {
  const { auditId, method = "stripe" } = request.body
  
  const audit = audits.get(auditId)
  
  if (!audit) {
    return reply.code(404).send({ error: "Audit not found" })
  }
  
  const paymentId = randomUUID()
  const payment = {
    id: paymentId,
    auditId,
    amount: audit.price,
    method,
    status: "pending",
    createdAt: new Date().toISOString(),
  }
  
  payments.set(paymentId, payment)
  
  let paymentResponse
  
  if (method === "stripe") {
    paymentResponse = {
      clientSecret: `pi_${paymentId}_secret_abc123`,
      paymentIntentId: `pi_${paymentId}`,
      method: "stripe",
    }
  } else if (method === "alipay") {
    paymentResponse = {
      paymentUrl: `https://openapi.alipay.com/gateway.do?trade_no=AUDIT_${auditId}`,
      tradeNo: `AUDIT_${auditId}`,
      method: "alipay",
    }
  } else if (method === "usdc") {
    paymentResponse = {
      contractAddress: "0xfF5EB80DF3Bf4506cd2d0CCC3c8303e1ee267459",
      amount: Math.round(audit.price / 100 / 7.2 * 1000000).toString(),
      network: "base",
      qrCode: `ethereum:0xfF5EB80DF3Bf4506cd2d0CCC3c8303e1ee267459@8453`,
      method: "usdc",
    }
  }
  
  return {
    ...paymentResponse,
    paymentId,
    amount: audit.price,
  }
})

// List all audits (for admin)
fastify.get("/api/admin/audits", async () => {
  return {
    total: audits.size,
    audits: Array.from(audits.values()),
  }
})

// Start server
const port = parseInt(process.env.API_PORT || "4000")
const host = "0.0.0.0"

try {
  await fastify.listen({ port, host })
  console.log(`\n========================================`)
  console.log(`Correctover API Server Running`)
  console.log(`========================================`)
  console.log(`Listening on http://${host}:${port}`)
  console.log(`Health check: http://${host}:${port}/health`)
  console.log(`API docs: http://${host}:${port}/api/audit/submit`)
  console.log(`========================================\n`)
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
