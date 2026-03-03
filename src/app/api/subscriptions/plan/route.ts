import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { monthlyPrice, quarterlyPrice, semiAnnualPrice } = await req.json();

  if (!monthlyPrice || !quarterlyPrice || !semiAnnualPrice) {
    return NextResponse.json({ error: "All prices are required" }, { status: 400 });
  }

  // Make sure user is a creator
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isCreator: true },
  });

  if (!user?.isCreator) {
    return NextResponse.json({ error: "You must enable creator mode first" }, { status: 403 });
  }

  const plan = await prisma.subscriptionPlan.upsert({
    where: { userId },
    create: {
      userId,
      monthlyPrice: parseFloat(monthlyPrice),
      quarterlyPrice: parseFloat(quarterlyPrice),
      semiAnnualPrice: parseFloat(semiAnnualPrice),
    },
    update: {
      monthlyPrice: parseFloat(monthlyPrice),
      quarterlyPrice: parseFloat(quarterlyPrice),
      semiAnnualPrice: parseFloat(semiAnnualPrice),
    },
  });

  return NextResponse.json(plan);
}
