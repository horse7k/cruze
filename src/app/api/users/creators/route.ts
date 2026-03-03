import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const creators = await prisma.user.findMany({
    where: { isCreator: true, nickname: { not: null } },
    select: {
      id: true,
      nickname: true,
      displayName: true,
      bio: true,
      profileImage: true,
      bannerImage: true,
      createdAt: true,
      subscriptionPlan: true,
      _count: {
        select: {
          posts: true,
          subscriptionsIn: { where: { status: "ACTIVE" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    creators.map((c) => ({
      ...c,
      postsCount: c._count.posts,
      subscribersCount: c._count.subscriptionsIn,
    }))
  );
}
