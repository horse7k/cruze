import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ nickname: string }> }
) {
  const { nickname } = await params;
  const session = await auth();
  const currentUserId = (session?.user as any)?.id;

  const user = await prisma.user.findUnique({
    where: { nickname },
    include: {
      subscriptionPlan: true,
      _count: {
        select: {
          posts: true,
          subscriptionsIn: { where: { status: "ACTIVE" } },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if current user is subscribed to this creator
  let isSubscribed = false;
  if (currentUserId && currentUserId !== user.id) {
    const subscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_creatorId: {
          subscriberId: currentUserId,
          creatorId: user.id,
        },
      },
    });
    isSubscribed = subscription?.status === "ACTIVE";
  }

  // Get posts (public ones + exclusive if subscribed or own profile)
  const isOwner = currentUserId === user.id;
  const posts = await prisma.post.findMany({
    where: {
      userId: user.id,
      ...((!isOwner && !isSubscribed) ? { isPublic: true } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  // Get active stories
  const stories = await prisma.story.findMany({
    where: {
      userId: user.id,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    id: user.id,
    nickname: user.nickname,
    displayName: user.displayName,
    bio: user.bio,
    profileImage: user.profileImage,
    bannerImage: user.bannerImage,
    isCreator: user.isCreator,
    subscriptionPlan: user.subscriptionPlan,
    postsCount: user._count.posts,
    subscribersCount: user._count.subscriptionsIn,
    isSubscribed,
    isOwner,
    posts,
    stories,
    createdAt: user.createdAt,
  });
}
