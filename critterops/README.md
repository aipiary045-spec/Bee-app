# CritterOps

Field-service software for **The Wildlife Pros** (Dawson, Oklahoma NWCO). Jobber-style operations plus trap inventory, species logs, and state compliance.

This app lives in `critterops/` and is a **separate product** from the Bee-app at the repository root. Do not merge this into the apiary product.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Prisma + SQLite for local (swap `provider` to `postgresql` for production)
- Cookie session auth

## Setup

```bash
cd critterops
npm install
npm run setup
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

Demo login: `dawson@thewildlifepros.com` / `DawsonField1`  
Client Hub: [http://localhost:3001/p/portal-helen-marlow](http://localhost:3001/p/portal-helen-marlow)

## Brand

Drop the official Wildlife Pros logo over `public/brand/logo.svg` (PNG is fine — update `BrandMark` if you switch formats).

## Jobber-style flow

Request → Quote → Job (visits) → Invoice → Payment, plus Client Hub.

Wildlife-specific: traps (24-hour check), captures/disposition, NWCO forms (3-year retention), EPA chemical records, tagged photos.

Route optimization: `POST /api/schedule/optimize` runs nearest-neighbor + 2-opt on visit lat/lng and rewrites the day's stop order.
