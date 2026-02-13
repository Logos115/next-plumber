import { NextResponse } from "next/server";
import { sendLowStockAlert } from "@/lib/low-stock-alert";

/**
 * Cron-safe endpoint for low-stock email alerts.
 * Call via cron (e.g. daily) — no admin session required.
 *
 * Auth: Set CRON_SECRET in env, then send:
 *   Authorization: Bearer <CRON_SECRET>
 *   or
 *   x-cron-secret: <CRON_SECRET>
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret?.trim()) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  const headerSecret = req.headers.get("x-cron-secret");
  const provided = bearer ?? headerSecret;

  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin =
    process.env.NEXTAUTH_URL ??
    (req.headers.get("x-forwarded-host")
      ? `https://${req.headers.get("x-forwarded-host")}`
      : undefined);

  const result = await sendLowStockAlert(origin);

  return NextResponse.json(result);
}
