import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const jobNumber = searchParams.get("jobNumber")?.trim() || undefined;
  const dateFrom = searchParams.get("dateFrom")?.trim() || undefined;
  const dateTo = searchParams.get("dateTo")?.trim() || undefined;
  const itemId = searchParams.get("itemId")?.trim() || undefined;
  const deviceId = searchParams.get("deviceId")?.trim() || undefined;
  const format = searchParams.get("format")?.toLowerCase();

  const where: {
    type: "USAGE";
    jobNumber?: { contains?: string; mode?: "insensitive" };
    createdAt?: { gte?: Date; lte?: Date };
    itemId?: string;
    deviceId?: string | null;
  } = { type: "USAGE" };

  if (jobNumber) {
    where.jobNumber = { contains: jobNumber, mode: "insensitive" };
  }
  if (itemId) {
    where.itemId = itemId;
  }
  if (deviceId) {
    where.deviceId = deviceId;
  }
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      const d = new Date(dateFrom);
      d.setHours(0, 0, 0, 0);
      where.createdAt.gte = d;
    }
    if (dateTo) {
      const d = new Date(dateTo);
      d.setHours(23, 59, 59, 999);
      where.createdAt.lte = d;
    }
  }

  const txns = await prisma.transaction.findMany({
    where,
    select: {
      id: true,
      jobNumber: true,
      quantity: true,
      deviceId: true,
      createdAt: true,
      item: { select: { id: true, name: true, unit: true } },
    },
    orderBy: [{ jobNumber: "asc" }, { createdAt: "asc" }],
  });

  // Group by job number, then by item. Sum quantities.
  const byJob = new Map<
    string,
    {
      jobNumber: string;
      items: Array<{ itemId: string; itemName: string; unit: string; totalQty: number }>;
      deviceIds: Set<string>;
      transactions: Array<{
        id: string;
        quantity: number;
        deviceId: string | null;
        createdAt: Date;
        itemName: string;
        unit: string;
      }>;
    }
  >();

  for (const t of txns) {
    const job = t.jobNumber ?? "(no job)";
    if (!byJob.has(job)) {
      byJob.set(job, {
        jobNumber: job,
        items: [],
        deviceIds: new Set(),
        transactions: [],
      });
    }
    const rec = byJob.get(job)!;
    rec.transactions.push({
      id: t.id,
      quantity: t.quantity,
      deviceId: t.deviceId,
      createdAt: t.createdAt,
      itemName: t.item.name,
      unit: t.item.unit,
    });
    if (t.deviceId) rec.deviceIds.add(t.deviceId);

    const existing = rec.items.find((i) => i.itemId === t.item.id);
    if (existing) {
      existing.totalQty += t.quantity;
    } else {
      rec.items.push({
        itemId: t.item.id,
        itemName: t.item.name,
        unit: t.item.unit,
        totalQty: t.quantity,
      });
    }
  }

  const jobs = Array.from(byJob.values()).map((j) => ({
    jobNumber: j.jobNumber,
    items: j.items.sort((a, b) => a.itemName.localeCompare(b.itemName)),
    deviceIds: Array.from(j.deviceIds),
    transactions: j.transactions,
    totalTransactions: j.transactions.length,
  }));

  if (format === "csv") {
    const escape = (s: string) => {
      const str = String(s ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n"))
        return `"${str.replace(/"/g, '""')}"`;
      return str;
    };
    const dateStr = (d: Date) =>
      d.toISOString().slice(0, 10);
    const rows = [
      ["Job Number", "Item Name", "Quantity", "Unit", "Date", "Engineer"].join(","),
      ...txns.map((t) =>
        [
          escape(t.jobNumber ?? ""),
          escape(t.item.name),
          t.quantity,
          escape(String(t.item.unit).toLowerCase()),
          dateStr(t.createdAt),
          escape(t.deviceId ?? ""),
        ].join(",")
      ),
    ];
    const csv = rows.join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="usage-export-${dateStr(new Date())}.csv"`,
      },
    });
  }

  return NextResponse.json({
    jobs,
    transactionCount: txns.length,
  });
}
