# CritterOps — Cursor project prompt

Build and extend **CritterOps**, a Jobber-class field-service app for **The Wildlife Pros** (Dawson, Oklahoma NWCO, 405-363-4433). This is a new product. Do not copy or replace the Bee-app.

## Product

As close to Jobber as possible:

- Clients with multiple properties
- Requests inbox
- Quotes customers can approve in Client Hub
- Jobs with scheduled visits
- Drag-style dispatch calendar
- Route optimization for a tech's day
- Invoices generated from jobs, payments, balances
- Client Hub: upcoming visits, approve quotes, pay invoices

Wildlife / pest additions:

- Trap & exclusion inventory (`Trap #14 · Active · Raccoon in Attic`)
- 24-hour trap check (Oklahoma NWCO)
- Species + disposition logs (relocate / euthanize / release)
- Entry points and exclusion materials
- NWCO complaint forms retained 3 years; annual summary due Jan 30
- Pesticide records: product, EPA number, target pest, rate, amount, site
- Before/after photos tagged to entry points

## Stack

Next.js App Router, Prisma, SQLite locally / PostgreSQL in production, Tailwind. Money in integer cents.

## Key routes

| Area | Path |
| --- | --- |
| Home / action center | `/` |
| Schedule + optimize | `/schedule` |
| Requests | `/requests` |
| Quotes | `/quotes`, `/quotes/[id]` |
| Jobs | `/jobs`, `/jobs/[id]` |
| Invoices | `/invoices`, `/invoices/[id]` |
| Clients / properties | `/clients`, `/clients/[id]`, `/properties/[id]` |
| Traps / captures / compliance / photos | `/traps`, `/captures`, `/compliance`, `/photos` |
| Client Hub | `/p/[token]` |

## API

- `POST /api/auth/login` `POST /api/auth/logout`
- `PATCH /api/visits/[id]` (reschedule / assign)
- `POST /api/schedule/optimize` `{ technicianId, date }`
- `POST /api/quotes/[id]/approve`
- `POST /api/jobs/[id]/invoice`
- `POST /api/invoices/[id]/payments`
- `POST /api/traps/[id]/events`

## Domain rules

- Authorized NWCO species only unless ODWC director written approval
- Relocation: outside city limits, not more than one county away, landowner permission
- Traps labeled with operator name + permit; check every 24 hours
- Chemical applications need EPA registration number

## UI

Jobber-like: white chrome, green accent, left nav. Company logo is `public/brand/logo.svg` — replace with the official Wildlife Pros artwork when available.
