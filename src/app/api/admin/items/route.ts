import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";

export async function GET() {
  const items = await prisma.item.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

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

    await logAction({
      entityType: "Item",
      entityId: item.id,
      action: "CREATE",
      actor: {
        type: "ADMIN",
        adminId: session.user?.id,
        email: session.user?.email ?? undefined,
      },
      details: { name: item.name, unit: item.unit },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json("Item name must be unique", { status: 400 });
  }
}
