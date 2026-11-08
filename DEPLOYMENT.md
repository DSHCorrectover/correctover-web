# Correctover SaaS Platform - Deployment Guide

## Overview

This guide covers deploying the Correctover SaaS platform to production using Cloudflare Pages + Workers.

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure all required environment variables are configured:

**Critical (Must Configure):**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random 32+ character string
- `STRIPE_SECRET_KEY` - Your Stripe live secret key
- `ALIPAY_PRIVATE_KEY` - Alipay RSA private key
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Pages/Workers permissions

**Email Configuration:**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

**Optional (Add as needed):**
- OAuth provider credentials (GitHub, Google)
- Analytics keys (PostHog, Sentry)
- AWS S3 credentials for report storage

### 2. Database Setup

**Option A: External PostgreSQL (Recommended)**
```bash
# Use a managed PostgreSQL service (Supabase, Railway, Neon, etc.)
# Update DATABASE_URL in .env
DATABASE_URL="postgresql://user:pass@host:5432/correctover_saas"
```

**Option B: Cloudflare D1 (Serverless)**
```bash
# Create D1 database
wrangler d1 create correctover_saas

# Update wrangler.toml with database_id
# Migrate schema (requires Prisma adapter for D1)
```

**Run Migrations:**
```bash
npx prisma db push
npx prisma generate
```

### 3. Payment Provider Setup

**Stripe:**
1. Create Stripe account at https://dashboard.stripe.com
2. Get API keys from Developers → API keys
3. Configure webhook endpoint: `https://saas.correctover.com/api/webhook/stripe`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

**Alipay:**
1. Register at https://open.alipay.com
2. Create application and get AppID
3. Generate RSA key pair
4. Upload public key to Alipay dashboard
5. Configure private key in `ALIPAY_PRIVATE_KEY`

**USDC on Base:**
1. Set up wallet with ETH on Base network
2. Store private key securely in `ETH_PRIVATE_KEY`
3. Monitor transactions via Base RPC

### 4. Custom Domain Configuration

**Cloudflare Pages:**
```bash
# Add custom domain in Cloudflare dashboard
# Or use Wrangler CLI:
wrangler pages project add-domain correctover-saas --domain=saas.correctover.com
```

**DNS Records:**
- CNAME: `saas.correctover.com` → `<project>.pages.dev`

## Deployment Steps

### Step 1: Build Frontend

```bash
cd /data/correctover-web

# Install dependencies
npm install

# Build Next.js app for static export
npm run build
```

### Step 2: Deploy to Cloudflare Pages

```bash
# Install Wrangler CLI globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy frontend
wrangler pages deploy out --project-name=correctover-saas

# Set environment variables in Cloudflare dashboard
# Or use Wrangler secrets:
wrangler pages secret put DATABASE_URL
wrangler pages secret put NEXTAUTH_SECRET
wrangler pages secret put STRIPE_SECRET_KEY
# ... (set all required secrets)
```

### Step 3: Deploy Backend API (Cloudflare Workers)

```bash
# Build API server for Workers compatibility
npx esbuild api-server/index.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --outfile=dist/worker.js \
  --external:@prisma/client

# Deploy worker
wrangler deploy dist/worker.js --name=correctover-api
```

### Step 4: Configure Custom Domain

1. Go to Cloudflare Dashboard → Pages → correctover-saas
2. Navigate to "Custom Domains"
3. Add `saas.correctover.com`
4. Verify DNS configuration
5. Wait for SSL certificate provisioning (~5 minutes)

### Step 5: Test Deployment

```bash
# Test frontend
curl https://saas.correctover.com

# Test API health endpoint
curl https://api.correctover.com/health

# Test audit submission
curl -X POST https://api.correctover.com/api/audit/submit \
  -H "Content-Type: application/json" \
  -d '{"serverUrl":"https://example.com","plan":"standard"}'
```

## Post-Deployment Tasks

### 1. Configure Webhooks

**Stripe Webhook:**
```bash
# In Stripe Dashboard → Developers → Webhooks
# Add endpoint: https://api.correctover.com/api/webhook/stripe
# Select events: payment_intent.succeeded, payment_intent.payment_failed
```

**GitHub OAuth (if enabled):**
```bash
# In GitHub Settings → Developer settings → OAuth Apps
# Set callback URL: https://saas.correctover.com/api/auth/callback/github
```

### 2. Set Up Monitoring

**Sentry (Error Tracking):**
```bash
# Add to .env
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Initialize Sentry in api-server/index.ts
import * as Sentry from "@sentry/node"
Sentry.init({ dsn: process.env.SENTRY_DSN })
```

**PostHog (Analytics):**
```bash
# Add to .env
POSTHOG_API_KEY=phc_your_project_key

# Track events in frontend
import posthog from 'posthog-js'
posthog.capture('audit_submitted', { plan: selectedPlan })
```

### 3. Email Notifications

Configure SMTP for transactional emails:
- Welcome email (new user registration)
- Audit completion notification
- Payment confirmation
- Report delivery

Test email delivery:
```bash
node scripts/test-email.js
```

### 4. Backup Strategy

**Database Backups:**
```bash
# Daily automated backups (configure in your DB provider)
# Example for PostgreSQL:
pg_dump -U user -h host correctover_saas > backup_$(date +%Y%m%d).sql
```

**Report Storage:**
- Configure AWS S3 or Cloudflare R2 for audit report storage
- Set lifecycle policies for automatic deletion after 90 days

## Troubleshooting

### Common Issues

**1. Database Connection Fails**
```
Error: connect ECONNREFUSED
```
- Verify DATABASE_URL is correct
- Check firewall rules allow Cloudflare IPs
- Ensure database is accepting connections

**2. Payment Integration Errors**
```
Error: Invalid API key provided
```
- Verify you're using live keys (not test keys)
- Check webhook endpoint is publicly accessible
- Ensure webhook secret matches Stripe configuration

**3. Email Not Sending**
```
Error: Authentication failed
```
- Use authorization code, not login password (for 163.com)
- Verify SMTP credentials in .env
- Check spam folder for test emails

**4. CORS Errors**
```
Access to fetch blocked by CORS policy
```
- Update CORS_ORIGIN in .env to match your domain
- Ensure backend allows requests from frontend domain

### Performance Optimization

**Frontend:**
- Enable Next.js Image Optimization
- Implement lazy loading for components
- Use Cloudflare CDN caching headers

**Backend:**
- Implement Redis caching for frequent queries
- Use connection pooling for database
- Enable compression for API responses

**Database:**
- Add indexes on frequently queried fields
- Implement query result caching
- Monitor slow queries with pg_stat_statements

## Scaling Considerations

### Horizontal Scaling

**Frontend (Cloudflare Pages):**
- Automatically scales with Cloudflare's global CDN
- No additional configuration needed

**Backend (Cloudflare Workers):**
- Auto-scales based on request volume
- Configure concurrency limits in wrangler.toml

**Database:**
- Upgrade to larger instance size
- Implement read replicas for heavy read loads
- Use connection pooling (PgBouncer)

### Cost Optimization

**Estimated Monthly Costs:**
- Cloudflare Pages: Free tier (up to 500 builds/month)
- Cloudflare Workers: $5/month (up to 10M requests)
- PostgreSQL (managed): $10-50/month depending on size
- Email (SMTP): Free (using existing 163.com/Sina accounts)
- Stripe fees: 2.9% + ¥1.5 per transaction

**Total Estimated Cost:** ¥200-500/month for small-scale operation

## Security Best Practices

1. **Secrets Management:**
   - Never commit .env files to Git
   - Use Cloudflare Secrets for production
   - Rotate API keys quarterly

2. **Rate Limiting:**
   - Implement rate limiting on API endpoints
   - Use Cloudflare WAF for DDoS protection

3. **Input Validation:**
   - Validate all user inputs
   - Sanitize HTML to prevent XSS
   - Use parameterized queries to prevent SQL injection

4. **HTTPS Everywhere:**
   - Enforce HTTPS on all routes
   - Enable HSTS headers
   - Use secure cookies with HttpOnly flag

## Support & Maintenance

**Regular Maintenance Tasks:**
- Weekly: Review error logs and fix critical issues
- Monthly: Update dependencies (`npm audit fix`)
- Quarterly: Rotate API keys and secrets
- Annually: Renew domain and SSL certificates

**Monitoring Alerts:**
- Set up alerts for high error rates
- Monitor API response times
- Track payment conversion rates
- Watch for unusual traffic patterns

---

For questions or issues, contact: wangguigui@correctover.com
