import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** GET: return current low-stock items (for dashboard or cron). */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  const items = await prisma.item.findMany({
    select: { id: true, name: true, unit: true, currentStock: true, minStock: true },
    orderBy: { name: "asc" },
  });

  const lowStock = items.filter(
    (i) =>
      (i.minStock !== null && i.currentStock <= i.minStock) ||
      i.currentStock < 0
  );

  return NextResponse.json({ lowStock, total: lowStock.length });
}

/** POST: check low stock and optionally send email alert (e.g. from cron). */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  const config = await prisma.appConfig.findUnique({
    where: { id: "default" },
    select: { lowStockAlertsEnabled: true, lowStockAlertEmail: true },
  });

  const items = await prisma.item.findMany({
    select: { id: true, name: true, unit: true, currentStock: true, minStock: true },
    orderBy: { name: "asc" },
  });

  const lowStock = items.filter(
    (i) =>
      (i.minStock !== null && i.currentStock <= i.minStock) ||
      i.currentStock < 0
  );

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ALERT_FROM_EMAIL ?? "alerts@resend.dev";
  const shouldSend =
    config?.lowStockAlertsEnabled &&
    config?.lowStockAlertEmail?.trim() &&
    apiKey &&
    lowStock.length > 0;

  if (shouldSend) {
    const to = config!.lowStockAlertEmail!.trim();
    const subject = `Low stock alert: ${lowStock.length} item(s) need attention`;
    const rows = lowStock
      .map(
        (i) =>
          `  • ${i.name}: ${i.currentStock} ${String(i.unit).toLowerCase()}${i.minStock !== null ? ` (min ${i.minStock})` : ""}`
      )
      .join("\n");
    const origin =
      process.env.NEXTAUTH_URL ??
      (req.headers.get("x-forwarded-host")
        ? `https://${req.headers.get("x-forwarded-host")}`
        : "");
    const dashboardUrl = origin ? `${origin}/admin` : "/admin";
    const html = `<p>The following items are at or below their minimum stock level:</p><pre>${rows}</pre><p>View the <a href="${dashboardUrl}">Dashboard</a> to restock.</p>`;
    const text = `Low stock:\n${rows}\n\nView the Dashboard to restock.`;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
          text,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json(
          { lowStock, total: lowStock.length, emailSent: false, error: err },
          { status: 200 }
        );
      }
      return NextResponse.json({
        lowStock,
        total: lowStock.length,
        emailSent: true,
      });
    } catch (e) {
      return NextResponse.json(
        {
          lowStock,
          total: lowStock.length,
          emailSent: false,
          error: e instanceof Error ? e.message : "Send failed",
        },
        { status: 200 }
      );
    }
  }

  return NextResponse.json({
    lowStock,
    total: lowStock.length,
    emailSent: false,
  });
}
