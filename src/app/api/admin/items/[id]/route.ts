import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const item = await prisma.item.update({
    where: { id },
    data: {
      name: body.name,
      unit: body.unit,
      minStock: body.minStock,
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.item.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
