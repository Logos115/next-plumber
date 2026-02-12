# Stock & Box Logging

A Next.js app for field engineers to log stock usage from physical boxes (e.g. van stock) via QR codes or links. Admins manage items, create boxes, and view stock levels.

## Features

- **Engineer flow**: Open `/b/[token]` (e.g. from a QR code), enter job number and quantity, submit. Records a USAGE transaction and updates item stock.
- **Edit last submission**: Engineers can edit their last submission within a configurable time window; edits are recorded in audit logs. Configure via Admin → Settings or `EDIT_WINDOW_MINUTES` env.
- **Admin**: Dashboard with low-stock list and optional email alerts; set minimum stock threshold per item (Items), enable alerts and recipient in Settings; create boxes linked to items and get shareable `/b/[token]` links; **Stock In** to log deliveries; **Returns** to log unused materials returned—both increase stock; **Audit trail** logs all create/edit/delete with user + timestamp; view change history per transaction; **Usage by Job** filters usage by job number, date range, item, engineer; displays total quantities per job for Tradify costing.
- **Auth**: Admin area protected by email/password (NextAuth with bcrypt).

## Tech

- Next.js 16 (App Router), React 19, TypeScript
- Prisma 7 + PostgreSQL
- NextAuth 4 (credentials, JWT)
- Tailwind CSS
- **PWA** (main app only) — home and `/b/[token]` are installable; admin is a normal web app

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Create `.env` (or `.env.local`) with:

   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   NEXTAUTH_SECRET="your-secret-for-jwt"
   NEXTAUTH_URL="http://localhost:3000"
   # Optional: minutes within which engineer can edit last submission (default: 10)
   EDIT_WINDOW_MINUTES=10
   # Optional: for low-stock email alerts (Settings → enable + recipient). Uses Resend.
   # RESEND_API_KEY=re_xxxx
   # ALERT_FROM_EMAIL=alerts@yourdomain.com   # must be a verified domain in Resend
   ```

3. **Database**

   ```bash
   npx prisma migrate deploy
   npx prisma db seed    # optional: creates a seed admin user
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Use **Admin** for the dashboard; engineers use links like `http://localhost:3000/b/<box-token>`.

## Documentation

- **[Admin How-to Guide](docs/ADMIN-HOW-TO.md)** — Step-by-step usage of each admin page.

## Project layout

- `/` — Home (links to admin and explains box links)
- `/admin` — Dashboard (items, low stock)
- `/admin/items` — Add/delete items
- `/admin/boxes` — Create boxes, copy `/b/[token]` links
- `/admin/stock-in` — Log deliveries (box, item, quantity, optional supplier/delivery reference); stock increases
- `/admin/returns` — Log returns to stock (box, item, quantity, optional job number); stock increases
- `/admin/transactions` — List transactions; click to view change history (who created/edited, when)
- `/admin/usage` — View usage by job; filter by job number, date range, item, engineer (device); totals for Tradify; CSV export for Tradify import
- `/admin/settings` — Edit window for engineer submissions; low-stock email alerts (enable + recipient, optional Resend)
- `/admin/login` — Admin sign-in
- `/b/[token]` — Engineer form to log usage for that box

## PWA (main app only)

The **engineer-facing** app (home `/` and box links `/b/[token]`) is a PWA: installable on home screen, standalone mode. The **admin** section (`/admin/*`) is a normal web app (no manifest, no install prompt).

- **Manifest**: Served at `/manifest` from `src/app/manifest/route.ts`; linked only in the `(pwa)` layout.
- **Scope**: Routes under `src/app/(pwa)/` get PWA metadata (manifest, theme-color, appleWebApp); admin does not.
- **Icons**: Generated at 32, 192, 512px from `src/app/icon.tsx`.

Serve over **HTTPS** in production for install prompts. For offline caching, add a service worker (e.g. [Serwist](https://serwist.pages.dev/) with Next.js).

## Deployment

See **[DEPLOY.md](./DEPLOY.md)** for Ubuntu deployment (PM2 + Nginx or Docker).

## Learn more

- [Next.js docs](https://nextjs.org/docs)
- [Prisma docs](https://www.prisma.io/docs)
