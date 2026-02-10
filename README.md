# Stock & Box Logging

A Next.js app for field engineers to log stock usage from physical boxes (e.g. van stock) via QR codes or links. Admins manage items, create boxes, and view stock levels.

## Features

- **Engineer flow**: Open `/b/[token]` (e.g. from a QR code), enter job number and quantity, submit. Records a USAGE transaction and updates item stock.
- **Admin**: Dashboard with items and low-stock alerts, manage items (name, unit, min stock), create boxes linked to items and get shareable `/b/[token]` links.
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

## Project layout

- `/` — Home (links to admin and explains box links)
- `/admin` — Dashboard (items, low stock)
- `/admin/items` — Add/delete items
- `/admin/boxes` — Create boxes, copy `/b/[token]` links
- `/admin/login` — Admin sign-in
- `/b/[token]` — Engineer form to log usage for that box

## PWA (main app only)

The **engineer-facing** app (home `/` and box links `/b/[token]`) is a PWA: installable on home screen, standalone mode. The **admin** section (`/admin/*`) is a normal web app (no manifest, no install prompt).

- **Manifest**: Served at `/manifest` from `src/app/manifest/route.ts`; linked only in the `(pwa)` layout.
- **Scope**: Routes under `src/app/(pwa)/` get PWA metadata (manifest, theme-color, appleWebApp); admin does not.
- **Icons**: Generated at 32, 192, 512px from `src/app/icon.tsx`.

Serve over **HTTPS** in production for install prompts. For offline caching, add a service worker (e.g. [Serwist](https://serwist.pages.dev/) with Next.js).

## Learn more

- [Next.js docs](https://nextjs.org/docs)
- [Prisma docs](https://www.prisma.io/docs)
