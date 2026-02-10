import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function generateToken() {
  return crypto.randomBytes(6).toString("base64url");
}

export async function GET() {
  const boxes = await prisma.box.findMany({
    include: { item: true },
    orderBy: { label: "asc" },
  });

  return NextResponse.json(boxes);
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.label || !body.itemId) {
    return NextResponse.json("Missing fields", { status: 400 });
  }

  const box = await prisma.box.create({
    data: {
      label: body.label,
      token: generateToken(),
      itemId: body.itemId,
    },
  });

  return NextResponse.json(box, { status: 201 });
}
