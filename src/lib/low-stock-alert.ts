import { prisma } from "@/lib/prisma";

export type LowStockItem = {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number | null;
};

/** Get items at or below their minimum stock, or with negative stock. */
export async function getLowStockItems(): Promise<LowStockItem[]> {
  const items = await prisma.item.findMany({
    select: {
      id: true,
      name: true,
      unit: true,
      currentStock: true,
      minStock: true,
    },
    orderBy: { name: "asc" },
  });

  return items.filter(
    (i) =>
      (i.minStock !== null && i.currentStock <= i.minStock) ||
      i.currentStock < 0
  );
}

export type SendAlertResult = {
  lowStock: LowStockItem[];
  total: number;
  emailSent: boolean;
  error?: string;
};

/** Check low stock and optionally send email alert. */
export async function sendLowStockAlert(
  origin?: string
): Promise<SendAlertResult> {
  const config = await prisma.appConfig.findUnique({
    where: { id: "default" },
    select: { lowStockAlertsEnabled: true, lowStockAlertEmail: true },
  });

  const lowStock = await getLowStockItems();
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ALERT_FROM_EMAIL ?? "alerts@resend.dev";
  const shouldSend =
    config?.lowStockAlertsEnabled &&
    config?.lowStockAlertEmail?.trim() &&
    apiKey &&
    lowStock.length > 0;

  if (!shouldSend) {
    return {
      lowStock,
      total: lowStock.length,
      emailSent: false,
    };
  }

  const to = config!.lowStockAlertEmail!.trim();
  const subject = `Low stock alert: ${lowStock.length} item(s) need attention`;
  const rows = lowStock
    .map(
      (i) =>
        `  • ${i.name}: ${i.currentStock} ${String(i.unit).toLowerCase()}${i.minStock !== null ? ` (min ${i.minStock})` : ""}`
    )
    .join("\n");
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
      return {
        lowStock,
        total: lowStock.length,
        emailSent: false,
        error: err,
      };
    }

    return {
      lowStock,
      total: lowStock.length,
      emailSent: true,
    };
  } catch (e) {
    return {
      lowStock,
      total: lowStock.length,
      emailSent: false,
      error: e instanceof Error ? e.message : "Send failed",
    };
  }
}
