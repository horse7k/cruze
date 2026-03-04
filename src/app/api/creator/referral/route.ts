import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.isCreator) {
    return NextResponse.json({ error: "Creator access required" }, { status: 403 });
  }

  // Return existing code if already generated
  if (user.referralCode) {
    return NextResponse.json({ referralCode: user.referralCode });
  }

  // Generate unique referral code: NICKNAME_XXXX
  const base = (user.nickname || "user").toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const referralCode = `${base}_${suffix}`;

  await prisma.user.update({
    where: { id: userId },
    data: { referralCode },
  });

  return NextResponse.json({ referralCode });
}
