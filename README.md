<div align="center">
  <h1>🛡️ Correctover</h1>
  <p><strong>MCP Server Security Audit Platform — IETF CCS 7-Dimension Verification</strong></p>

  <!-- Badges -->
  <a href="https://github.com/DSHCorrectover/correctover-scan/actions"><img src="https://github.com/DSHCorrectover/correctover-scan/workflows/CI/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/correctover-scan"><img src="https://img.shields.io/npm/v/correctover-scan.svg" alt="npm version"></a>
  <a href="https://pypi.org/project/ccs-verifier/"><img src="https://img.shields.io/pypi/v/ccs-verifier" alt="PyPI"></a>
  <a href="https://github.com/DSHCorrectover/correctover/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Proprietary-blue.svg" alt="License"></a>
  <a href="https://correctover-census.pages.dev/rankings"><img src="https://img.shields.io/badge/MCP_Census-42,163_servers-green" alt="MCP Census"></a>

  <br>
  <br>

  <a href="https://correctover-census.pages.dev">Live Census</a> •
  <a href="https://correctover-production.up.railway.app">Platform</a> •
  <a href="mailto:wangguigui@correctover.com">Contact</a>
</div>

---

## Why Correctover?

The first independent security census of the MCP ecosystem:
- **42,163** servers probed via live protocol handshake
- **229,539** tools analyzed with full parameter inspection
- **10.95%** flagged as high-consequence across 5 risk categories

Built on IETF `draft-correctover-ccs-10` — the 7-dimension verification framework for AI agent tool safety.

## Quick Start

### 1. Install the Scanner

```bash
npm install -g correctover-scan
```

### 2. Run Your First Audit

```bash
correctover-scan --server https://your-mcp-server.com
```

### 3. View Results

```
✓ Structure: 92/100
✓ Schema: 88/100
⚠ Security: 65/100 (3 warnings)
```

## CCS 7-Dimension Framework

| Dimension | What It Checks | Risk Level |
|-----------|---------------|------------|
| **Structure** | Tool organization, naming, metadata | Low |
| **Schema** | Input/output validation, type safety | Medium |
| **Latency** | Response time, timeout handling | Low |
| **Cost** | Rate limiting, resource usage | Medium |
| **Identity** | Auth, API keys, OAuth flows | High |
| **Integrity** | Data consistency, idempotency | High |
| **Security** | SSRF, injection, credential exposure | Critical |

## gg: Parameter Risk Categories

| Category | Tools Affected | % of Total |
|----------|---------------|------------|
| `gg:url-endpoint` | 31,880 | 13.89% |
| `gg:command-string` | 23,847 | 10.39% |
| `gg:money-amount` | 15,229 | 6.64% |
| `gg:credential-value` | 14,753 | 6.43% |
| `gg:filesystem-path` | 5,569 | 2.43% |

## Products

### 🔍 correctover-scan (npm)
CLI tool for MCP server security audits. Zero-config, instant results.

```bash
npm install -g correctover-scan
correctover-scan --help
```

### 🛡️ agent-runtime-guard (npm)
Runtime protection for AI agents. Intercepts dangerous tool calls.

```bash
npm install agent-runtime-guard
```

### 📊 ccs-verifier (PyPI)
Python library for CCS conformance testing.

```bash
pip install ccs-verifier
```

### 🌐 SaaS Platform
Full audit management with team collaboration, reporting, and compliance tracking.

→ [Platform Login](https://correctover-production.up.railway.app)

## MCP Security Census

We maintain the largest independent database of MCP server security ratings.

→ [View Rankings](https://correctover-census.pages.dev/rankings)

**Key Findings**:
- 48.80% of servers openly accessible without authentication
- Only 0.67% declare proper open-source licenses
- 5 high-consequence risk categories affect 10.95% of all tools

## For Enterprise

| Plan | Price | Features |
|------|-------|----------|
| **Founding Member** | ¥35,000 | One-time audit + lifetime 50% discount |
| **Standard** | ¥50,000 | Full audit + API access |
| **Enterprise** | ¥100,000/year | Unlimited audits + SLA |
| **API Starter** | ¥199/month | 100 audits/month |

**Payment Methods**: Stripe, Alipay, USDC (Base), Wire Transfer

## Documentation

- [CCS Specification (IETF Draft)](https://datatracker.ietf.org/doc/draft-correctover-ccs/)
- [gg: Parameter Risk Standard](https://datatracker.ietf.org/doc/draft-correctover-gg-mcp-parameter-risk/)
- [API Reference](https://docs.correctover.com)
- [Integration Guide](https://docs.correctover.com/integrations)

## Contributing

We welcome security researchers and MCP developers:
- Report vulnerabilities: security@correctover.com
- Submit census data: census@correctover.com
- Feature requests: GitHub Issues

## License

Proprietary © Correctover 2026

---

<div align="center">

**Built with 🛡️ for the MCP ecosystem**

[Anthropic](https://anthropic.com) • [Cloudflare](https://cloudflare.com) • [Vercel](https://vercel.com) — *We've shared our findings with these platform builders*

</div>
