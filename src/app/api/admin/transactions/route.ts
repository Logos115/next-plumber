import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
  const cursor = searchParams.get("cursor") ?? undefined;

  const txns = await prisma.transaction.findMany({
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      item: { select: { name: true, unit: true } },
      box: { select: { label: true, token: true } },
    },
  });

  const hasMore = txns.length > limit;
  const list = hasMore ? txns.slice(0, limit) : txns;
  const nextCursor = hasMore ? list[list.length - 1]?.id : null;

  return NextResponse.json({
    transactions: list,
    nextCursor,
  });
}
