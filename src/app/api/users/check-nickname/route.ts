import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const nickname = req.nextUrl.searchParams.get("nickname");

  if (!nickname || nickname.length < 3) {
    return NextResponse.json({ available: false });
  }

  const existing = await prisma.user.findUnique({
    where: { nickname },
    select: { id: true },
  });

  return NextResponse.json({ available: !existing });
}
