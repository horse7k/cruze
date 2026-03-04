import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      subscriptionPlan: true,
      _count: {
        select: {
          posts: true,
          subscriptionsIn: { where: { status: "ACTIVE" } },
          subscriptionsOut: { where: { status: "ACTIVE" } },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    displayName: user.displayName,
    bio: user.bio,
    profileImage: user.profileImage,
    bannerImage: user.bannerImage,
    role: user.role,
    isCreator: user.isCreator,
    subscriptionPlan: user.subscriptionPlan,
    postsCount: user._count.posts,
    subscribersCount: user._count.subscriptionsIn,
    subscriptionsCount: user._count.subscriptionsOut,
    createdAt: user.createdAt,
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { displayName, bio, profileImage, bannerImage, isCreator } = body;

    const user = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(profileImage !== undefined && { profileImage }),
        ...(bannerImage !== undefined && { bannerImage }),
        ...(isCreator !== undefined && { isCreator }),
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
