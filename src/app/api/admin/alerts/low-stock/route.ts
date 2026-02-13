import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLowStockItems, sendLowStockAlert } from "@/lib/low-stock-alert";

/** GET: return current low-stock items (for dashboard). */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  const lowStock = await getLowStockItems();
  return NextResponse.json({ lowStock, total: lowStock.length });
}

/** POST: check low stock and optionally send email alert (Settings → Send test alert). */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  const origin =
    process.env.NEXTAUTH_URL ??
    (req.headers.get("x-forwarded-host")
      ? `https://${req.headers.get("x-forwarded-host")}`
      : undefined);

  const result = await sendLowStockAlert(origin);
  return NextResponse.json(result);
}
