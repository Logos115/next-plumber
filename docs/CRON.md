# Scheduled Low-Stock Alerts (Cron)

To receive low-stock emails on a schedule (e.g. daily), call the cron endpoint from a cron job or scheduler. No admin session is required.

## Setup

1. **Environment**: Add `CRON_SECRET` to `.env`:

   ```env
   CRON_SECRET=your-secret-here
   ```

   Generate a secret:

   ```bash
   openssl rand -base64 32
   ```

2. **Settings**: In Admin → Settings, enable low-stock email alerts and set the recipient email.

3. **Resend**: Ensure `RESEND_API_KEY` and `ALERT_FROM_EMAIL` are set for email delivery.

## Endpoint

- **URL**: `POST /api/cron/low-stock`
- **Auth**: Send the secret in one of:
  - `Authorization: Bearer <CRON_SECRET>`
  - `x-cron-secret: <CRON_SECRET>`

## Examples

### Linux crontab (daily at 8:00)

```bash
0 8 * * * curl -s -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://stockpod.co.uk/api/cron/low-stock
```

### Windows Task Scheduler

Use `curl` or PowerShell:

```powershell
Invoke-RestMethod -Uri "https://yourdomain.com/api/cron/low-stock" -Method POST -Headers @{ "Authorization" = "Bearer YOUR_CRON_SECRET" }
```

### Vercel Cron

Add `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/low-stock",
      "schedule": "0 8 * * *"
    }
  ]
}
```

Then in the route, verify the `CRON_SECRET` header that Vercel sends (see [Vercel Cron docs](https://vercel.com/docs/cron-jobs)).

## Response

- **200**: `{ lowStock, total, emailSent, error? }`
- **401**: Invalid or missing secret
- **500**: `CRON_SECRET` not configured

If `emailSent` is `true`, the alert was sent. If `total === 0`, there are no low-stock items, so no email is sent.
