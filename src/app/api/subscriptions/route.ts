import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriberId = (session.user as any).id;
  const { creatorId, planType } = await req.json();

  if (!creatorId || !planType) {
    return NextResponse.json({ error: "Creator ID and plan type are required" }, { status: 400 });
  }

  if (subscriberId === creatorId) {
    return NextResponse.json({ error: "Cannot subscribe to yourself" }, { status: 400 });
  }

  const creator = await prisma.user.findUnique({
    where: { id: creatorId },
    include: { subscriptionPlan: true },
  });

  if (!creator?.isCreator || !creator.subscriptionPlan) {
    return NextResponse.json({ error: "Creator not found or has no plan" }, { status: 404 });
  }

  // Check existing subscription
  const existing = await prisma.subscription.findUnique({
    where: { subscriberId_creatorId: { subscriberId, creatorId } },
  });

  if (existing?.status === "ACTIVE") {
    return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
  }

  // Calculate end date and amount
  const plan = creator.subscriptionPlan;
  let endDate = new Date();
  let amount = 0;

  switch (planType) {
    case "MONTHLY":
      endDate.setMonth(endDate.getMonth() + 1);
      amount = plan.monthlyPrice;
      break;
    case "QUARTERLY":
      endDate.setMonth(endDate.getMonth() + 3);
      amount = plan.quarterlyPrice;
      break;
    case "SEMI_ANNUAL":
      endDate.setMonth(endDate.getMonth() + 6);
      amount = plan.semiAnnualPrice;
      break;
    default:
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
  }

  const subscription = existing
    ? await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planType,
          startDate: new Date(),
          endDate,
          status: "ACTIVE",
          amount,
        },
      })
    : await prisma.subscription.create({
        data: {
          subscriberId,
          creatorId,
          planType,
          endDate,
          amount,
          status: "ACTIVE",
        },
      });

  return NextResponse.json(subscription, { status: 201 });
}
