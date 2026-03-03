import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isValidNickname } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { nickname } = await req.json();

  if (!nickname || !isValidNickname(nickname)) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { nickname },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { nickname },
  });

  return NextResponse.json({ nickname });
}
