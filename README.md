# SME Statement Generator

SME declaration letter generator for government procurement scenarios.
Generate standardized letters for goods, construction, or service projects and export Word documents.
No database is required; data is handled at runtime.

## Features
- Industry classification based on SME standards (15 industries).
- Supports goods, construction, and service declaration types.
- Word document export (.docx).
- Run locally or deploy to Vercel.

## Quick Start
```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

## Build and Run
```bash
pnpm build
pnpm start
```

## Configuration
Copy `.env.example` to `.env` (optional) and adjust:
- `NODE_ENV` (default: production)
- `PORT` (default: 3000)

## Deployment
- Quick guide: `README_DEPLOY.md`
- Full guide: `DEPLOYMENT.md`
