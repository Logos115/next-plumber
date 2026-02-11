import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type Actor = {
  type: "ADMIN" | "ENGINEER";
  adminId?: string;
  email?: string;
  deviceId?: string;
};

type AuditParams = {
  entityType: "Transaction" | "Item" | "Box";
  entityId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  actor: Actor;
  details?: Record<string, unknown>;
};

/** Log an action for audit trail. Pass tx when inside a Prisma transaction. */
export async function logAction(
  params: AuditParams,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx ?? prisma;
  try {
    await db.actionAudit.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        actorType: params.actor.type,
        actorId: params.actor.adminId ?? null,
        actorEmail: params.actor.email ?? null,
        deviceId: params.actor.deviceId ?? null,
        details: params.details ? (params.details as object) : Prisma.DbNull,
      },
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}
