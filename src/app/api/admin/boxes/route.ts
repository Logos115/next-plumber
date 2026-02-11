import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";
import crypto from "crypto";

function generateToken() {
  return crypto.randomBytes(6).toString("base64url");
}

export async function GET() {
  const boxes = await prisma.box.findMany({
    include: {
      boxItems: { include: { item: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { label: "asc" },
  });

  // Shape for UI: { id, label, token, items: Item[] }
  const shaped = boxes.map((b) => ({
    id: b.id,
    label: b.label,
    token: b.token,
    active: b.active,
    items: b.boxItems.map((bi) => bi.item),
  }));

  return NextResponse.json(shaped);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  const body = (await req.json()) as { label?: string; itemIds?: string[] };

  if (!body.label || typeof body.label !== "string" || !body.label.trim()) {
    return NextResponse.json("Missing or invalid label", { status: 400 });
  }

  const itemIds = Array.isArray(body.itemIds)
    ? (body.itemIds as string[]).filter((id) => typeof id === "string" && id.length > 0)
    : [];

  if (itemIds.length === 0) {
    return NextResponse.json("At least one item is required", { status: 400 });
  }

  const token = generateToken();

  const box = await prisma.box.create({
    data: {
      label: body.label.trim(),
      token,
      boxItems: {
        create: itemIds.map((itemId) => ({ itemId })),
      },
    },
    include: {
      boxItems: { include: { item: true }, orderBy: { createdAt: "asc" } },
    },
  });

  await logAction({
    entityType: "Box",
    entityId: box.id,
    action: "CREATE",
    actor: {
      type: "ADMIN",
      adminId: session.user?.id,
      email: session.user?.email ?? undefined,
    },
    details: { label: box.label, token: box.token },
  });

  return NextResponse.json(
    {
      id: box.id,
      label: box.label,
      token: box.token,
      active: box.active,
      items: box.boxItems.map((bi) => bi.item),
    },
    { status: 201 }
  );
}
