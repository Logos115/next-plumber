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
  let body: { name?: string; unit?: string; minStock?: number | null | string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json("Invalid JSON", { status: 400 });
  }

  const data: { name?: string; unit?: "EACH" | "METRE" | "BOX"; minStock?: number | null } = {};
  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.unit !== undefined && (body.unit === "EACH" || body.unit === "METRE" || body.unit === "BOX"))
    data.unit = body.unit;
  if (body.minStock !== undefined)
    data.minStock =
      body.minStock === null || body.minStock === ""
        ? null
        : Math.max(0, Number(body.minStock));

  const item = await prisma.item.update({
    where: { id },
    data,
  });

  await logAction({
    entityType: "Item",
    entityId: id,
    action: "UPDATE",
    actor: {
      type: "ADMIN",
      adminId: session.user?.id,
      email: session.user?.email ?? undefined,
    },
    details: data,
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  const { id } = await params;
  const item = await prisma.item.findUnique({ where: { id }, select: { name: true } });

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  try {
    await prisma.item.delete({ where: { id } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database constraint prevented deletion";
    return NextResponse.json(
      { error: msg.includes("foreign key") ? "Item is in use. Run database migrations (npx prisma migrate deploy) to enable deletion of items with transactions." : msg },
      { status: 409 }
    );
  }

  await logAction({
    entityType: "Item",
    entityId: id,
    action: "DELETE",
    actor: {
      type: "ADMIN",
      adminId: session.user?.id,
      email: session.user?.email ?? undefined,
    },
    details: { name: item.name },
  });

  return NextResponse.json({ ok: true });
}
