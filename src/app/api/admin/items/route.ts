import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.item.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.name || !body.unit) {
    return NextResponse.json("Missing fields", { status: 400 });
  }

  try {
    const item = await prisma.item.create({
      data: {
        name: body.name.trim(),
        unit: body.unit,
        minStock: body.minStock ?? null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json("Item name must be unique", { status: 400 });
  }
}
