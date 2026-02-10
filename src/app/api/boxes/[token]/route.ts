import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const box = await prisma.box.findUnique({
    where: { token },
    include: { item: true },
  });

  if (!box || !box.active) {
    return NextResponse.json(
      { ok: false, message: "Box not found. Ask the office to check the QR/box setup." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    box: { label: box.label, token: box.token },
    item: { name: box.item.name, unit: box.item.unit.toLowerCase() },
  });
}
