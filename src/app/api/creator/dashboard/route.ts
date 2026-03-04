import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.isCreator) {
    return NextResponse.json({ error: "Creator access required" }, { status: 403 });
  }

  // Active subscriptions to this creator
  const activeSubs = await prisma.subscription.findMany({
    where: { creatorId: userId, status: "ACTIVE" },
    include: {
      subscriber: {
        select: { nickname: true, displayName: true, profileImage: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalEarnings = activeSubs.reduce((sum, s) => sum + s.amount, 0);
  const subscriberCount = activeSubs.length;

  const postsCount = await prisma.post.count({ where: { userId } });

  // Referral stats
  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
  });
  const referralCount = referrals.length;

  // Referral earnings: 1% of referred users' active subscription totals
  let referralEarnings = 0;
  if (referralCount > 0) {
    const referredIds = referrals.map((r) => r.referredId);
    const referredSubs = await prisma.subscription.findMany({
      where: { subscriberId: { in: referredIds }, status: "ACTIVE" },
    });
    referralEarnings = referredSubs.reduce((sum, s) => sum + s.amount * 0.01, 0);
  }

  // Recent 10 subscribers
  const recentSubscribers = activeSubs.slice(0, 10).map((s) => ({
    nickname: s.subscriber.nickname,
    displayName: s.subscriber.displayName,
    profileImage: s.subscriber.profileImage,
    planType: s.planType,
    amount: s.amount,
    endDate: s.endDate,
  }));

  return NextResponse.json({
    totalEarnings,
    subscriberCount,
    postsCount,
    referralCount,
    referralEarnings,
    referralCode: user.referralCode,
    recentSubscribers,
  });
}
