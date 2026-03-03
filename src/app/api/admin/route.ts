import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, totalCreators, totalSubscriptions, users, revenueResult] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isCreator: true } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          nickname: true,
          displayName: true,
          profileImage: true,
          role: true,
          isCreator: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              subscriptionsIn: { where: { status: "ACTIVE" } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.subscription.aggregate({
        where: { status: "ACTIVE" },
        _sum: { amount: true },
      }),
    ]);

  return NextResponse.json({
    stats: {
      totalUsers,
      totalCreators,
      totalSubscriptions,
      totalRevenue: revenueResult._sum.amount || 0,
    },
    users: users.map((u) => ({
      ...u,
      postsCount: u._count.posts,
      subscribersCount: u._count.subscriptionsIn,
    })),
  });
}
