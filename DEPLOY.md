# Deploying to Ubuntu

This guide covers deploying the Next.js app to an Ubuntu server using either **PM2 + Nginx** (recommended) or **Docker**.

## Prerequisites

- Ubuntu 22.04 LTS (or 20.04)
- Domain pointing to your server (for HTTPS)
- Root or sudo access

---

## Option A: PM2 + Nginx (recommended)

### 1. Install Node.js, PostgreSQL, Nginx

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Nginx
sudo apt install -y nginx
```

### 2. Create PostgreSQL database and user

```bash
sudo -u postgres psql -c "CREATE USER stocktrack WITH PASSWORD 'your-secure-password';"
sudo -u postgres psql -c "CREATE DATABASE stocktrack OWNER stocktrack;"
```

### 3. Deploy the app

```bash
# Clone or upload your code
cd /var/www
sudo mkdir -p next-plumber
sudo chown $USER:$USER next-plumber
# (clone your repo into next-plumber, or rsync/scp from your dev machine)

cd next-plumber
cp .env.example .env   # if you have one, or create .env manually
```

### 4. Environment variables

Create `.env`:

```env
DATABASE_URL="postgresql://stocktrack:your-secure-password@localhost:5432/stocktrack"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://yourdomain.com"

# Optional
EDIT_WINDOW_MINUTES=10
# RESEND_API_KEY=re_xxxx
# ALERT_FROM_EMAIL=alerts@yourdomain.com
```

Generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 5. Build and run migrations

```bash
cd /var/www/next-plumber
npm ci --omit=dev
npx prisma migrate deploy
npx prisma db seed   # optional: creates seed admin user
npm run build
```

### 6. Install PM2 and run the app

```bash
sudo npm install -g pm2
pm2 start npm --name "next-plumber" -- start
pm2 save
pm2 startup   # follow the printed command to enable boot
```

### 7. Configure Nginx (reverse proxy + HTTPS)

```bash
sudo nano /etc/nginx/sites-available/next-plumber
```

Paste (replace `yourdomain.com`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and get HTTPS:

```bash
sudo ln -s /etc/nginx/sites-available/next-plumber /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# HTTPS with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will modify your Nginx config to add HTTPS. After that, `NEXTAUTH_URL` must be `https://yourdomain.com`.

### 8. Update after code changes

```bash
cd /var/www/next-plumber
git pull   # or rsync your built app
npm ci --omit=dev
npx prisma migrate deploy
npm run build
pm2 restart next-plumber
```

---

## Option B: Docker

### 1. Build and run

```bash
cd /path/to/next-plumber
```

Create `.env` (docker-compose uses defaults for local Postgres; override for production):

```env
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret"
# Optional: override DATABASE_URL if not using docker-compose Postgres
# DATABASE_URL="postgresql://stocktrack:stocktrack@postgres:5432/stocktrack"
```

```bash
# Run PostgreSQL + app
docker compose up -d

# Run migrations (first time and after schema changes)
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed   # optional
```

The app listens on port 3000. Put Nginx (or Caddy) in front for HTTPS.

### 2. Docker alone (existing PostgreSQL)

If PostgreSQL runs on the host:

```bash
docker build -t next-plumber .
docker run -d --name next-plumber \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host.docker.internal:5432/db" \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  -e NEXTAUTH_SECRET="your-secret" \
  next-plumber
```

Use `host.docker.internal` (Linux Docker 20.10+) or your host IP for `DATABASE_URL`.

---

## Checklist

- [ ] PostgreSQL created and accessible
- [ ] `.env` with `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (HTTPS in prod)
- [ ] `npx prisma migrate deploy` run
- [ ] App built (`npm run build`)
- [ ] HTTPS enabled (PWA and NextAuth need it)
- [ ] `NEXTAUTH_URL` matches your public URL

---

## Troubleshooting

**502 Bad Gateway**: App not running. Check `pm2 status` or `docker compose ps`.

**Database connection failed**: Verify `DATABASE_URL`, PostgreSQL is running, and firewall allows `localhost:5432`.

**NextAuth redirect issues**: Ensure `NEXTAUTH_URL` is exactly your public URL (e.g. `https://stock.yourdomain.com`).

**Admin login works locally but fails remotely**:
- Ensure `NEXTAUTH_URL` is set to your production URL (e.g. `https://yourdomain.com`) — not `http://localhost:3000`
- Ensure `NEXTAUTH_SECRET` is set in production env vars
- Run `npx prisma db seed` on the remote DB to create the admin user (admin@example.com / ChangeMe123!)
- Verify the remote DB has the AdminUser table and data: `npx prisma migrate deploy` first, then seed
