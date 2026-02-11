import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const box = await prisma.box.findUnique({
    where: { token },
    include: {
      boxItems: { include: { item: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!box || !box.active) {
    return NextResponse.json(
      { ok: false, message: "Box not found. Ask the office to check the QR/box setup." },
      { status: 404 }
    );
  }

  const items = box.boxItems.map((bi) => ({
    id: bi.item.id,
    name: bi.item.name,
    unit: bi.item.unit.toLowerCase(),
  }));

  if (items.length === 0) {
    return NextResponse.json(
      { ok: false, message: "Box has no items linked. Ask the office to link items." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    box: { label: box.label, token: box.token },
    items,
    // Backward compat: single "item" when only one item
    item: items.length === 1 ? items[0] : undefined,
  });
}
