import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  const { id } = await params;
  const body = (await req.json()) as { label?: string; itemIds?: string[]; active?: boolean };

  const box = await prisma.box.findUnique({
    where: { id },
    include: { boxItems: true },
  });

  if (!box) {
    return NextResponse.json("Box not found", { status: 404 });
  }

  const updates: {
    label?: string;
    active?: boolean;
    boxItems?: { deleteMany: {}; create: { itemId: string }[] };
  } = {};

  if (body.label !== undefined && typeof body.label === "string" && body.label.trim()) {
    updates.label = body.label.trim();
  }
  if (typeof body.active === "boolean") {
    updates.active = body.active;
  }

  if (Array.isArray(body.itemIds)) {
    const itemIds = (body.itemIds as string[]).filter((id) => typeof id === "string" && id.length > 0);
    if (itemIds.length > 0) {
      updates.boxItems = {
        deleteMany: {},
        create: itemIds.map((itemId) => ({ itemId })),
      };
    }
  }

  const updated = await prisma.box.update({
    where: { id },
    data: updates,
    include: {
      boxItems: { include: { item: true }, orderBy: { createdAt: "asc" } },
    },
  });

  await logAction({
    entityType: "Box",
    entityId: id,
    action: "UPDATE",
    actor: {
      type: "ADMIN",
      adminId: session.user?.id,
      email: session.user?.email ?? undefined,
    },
    details: updates,
  });

  return NextResponse.json({
    id: updated.id,
    label: updated.label,
    token: updated.token,
    active: updated.active,
    items: updated.boxItems.map((bi) => bi.item),
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  const { id } = await params;

  const box = await prisma.box.findUnique({ where: { id } });
  if (!box) {
    return NextResponse.json("Box not found", { status: 404 });
  }

  await prisma.box.delete({ where: { id } });

  await logAction({
    entityType: "Box",
    entityId: id,
    action: "DELETE",
    actor: {
      type: "ADMIN",
      adminId: session.user?.id,
      email: session.user?.email ?? undefined,
    },
    details: { label: box.label },
  });

  return new NextResponse(null, { status: 204 });
}
