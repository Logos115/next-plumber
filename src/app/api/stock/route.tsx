import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.item.findMany({
    select: { id: true, name: true, unit: true, currentStock: true, minStock: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ ok: true, items });
}
