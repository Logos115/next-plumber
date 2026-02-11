import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  const config = await prisma.appConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      editWindowMinutes: 10,
      lowStockAlertsEnabled: false,
    },
    update: {},
    select: {
      editWindowMinutes: true,
      lowStockAlertsEnabled: true,
      lowStockAlertEmail: true,
    },
  });

  return NextResponse.json({
    editWindowMinutes: config.editWindowMinutes,
    lowStockAlertsEnabled: config.lowStockAlertsEnabled,
    lowStockAlertEmail: config.lowStockAlertEmail ?? "",
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  let body: {
    editWindowMinutes?: number;
    lowStockAlertsEnabled?: boolean;
    lowStockAlertEmail?: string | null;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json("Invalid JSON body", { status: 400 });
  }

  const minutes = body.editWindowMinutes;
  if (minutes !== undefined) {
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 1440) {
      return NextResponse.json(
        "editWindowMinutes must be between 1 and 1440 (24 hours)",
        { status: 400 }
      );
    }
  }

  const updateData: {
    editWindowMinutes?: number;
    lowStockAlertsEnabled?: boolean;
    lowStockAlertEmail?: string | null;
  } = {};
  if (minutes !== undefined) updateData.editWindowMinutes = Math.floor(minutes);
  if (body.lowStockAlertsEnabled !== undefined)
    updateData.lowStockAlertsEnabled = Boolean(body.lowStockAlertsEnabled);
  if (body.lowStockAlertEmail !== undefined)
    updateData.lowStockAlertEmail =
      body.lowStockAlertEmail === "" || body.lowStockAlertEmail === null
        ? null
        : String(body.lowStockAlertEmail).trim() || null;

  const config = await prisma.appConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      editWindowMinutes: updateData.editWindowMinutes ?? 10,
      lowStockAlertsEnabled: updateData.lowStockAlertsEnabled ?? false,
      lowStockAlertEmail: updateData.lowStockAlertEmail ?? undefined,
    },
    update: updateData,
    select: {
      editWindowMinutes: true,
      lowStockAlertsEnabled: true,
      lowStockAlertEmail: true,
    },
  });

  return NextResponse.json({
    editWindowMinutes: config.editWindowMinutes,
    lowStockAlertsEnabled: config.lowStockAlertsEnabled,
    lowStockAlertEmail: config.lowStockAlertEmail ?? "",
  });
}
