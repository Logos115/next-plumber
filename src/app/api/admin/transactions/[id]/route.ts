import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  const { id } = await params;

  const txn = await prisma.transaction.findUnique({
    where: { id },
    include: {
      item: { select: { name: true, unit: true } },
      box: { select: { label: true, token: true } },
      editAudits: { orderBy: { editedAt: "desc" } },
    },
  });

  if (!txn) {
    return NextResponse.json("Transaction not found", { status: 404 });
  }

  const actionAudits = await prisma.actionAudit.findMany({
    where: { entityType: "Transaction", entityId: id },
    orderBy: { createdAt: "asc" },
  });

  const history = [
    ...actionAudits.map((a) => ({
      type: "action" as const,
      action: a.action,
      actorType: a.actorType,
      actorEmail: a.actorEmail,
      actorDeviceId: a.deviceId,
      timestamp: a.createdAt,
      details: a.details,
    })),
    ...txn.editAudits.map((e) => ({
      type: "edit" as const,
      action: "UPDATE" as const,
      actorEmail: e.actorEmail,
      actorDeviceId: e.actorDeviceId,
      timestamp: e.editedAt,
      oldQuantity: e.oldQuantity,
      newQuantity: e.newQuantity,
      oldJobNumber: e.oldJobNumber,
      newJobNumber: e.newJobNumber,
    })),
  ].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return NextResponse.json({
    transaction: txn,
    history,
  });
}
