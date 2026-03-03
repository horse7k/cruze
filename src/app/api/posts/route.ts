import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isCreator: true },
  });

  if (!user?.isCreator) {
    return NextResponse.json({ error: "Only creators can post" }, { status: 403 });
  }

  const { type, mediaUrl, caption, isPublic } = await req.json();

  if (!type || !mediaUrl) {
    return NextResponse.json({ error: "Type and media URL are required" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      userId,
      type,
      mediaUrl,
      caption: caption || null,
      isPublic: isPublic ?? false,
    },
  });

  return NextResponse.json(post, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  // Get creators the user is subscribed to
  const subscriptions = await prisma.subscription.findMany({
    where: { subscriberId: userId, status: "ACTIVE" },
    select: { creatorId: true },
  });

  const creatorIds = subscriptions.map((s) => s.creatorId);

  // Get posts from subscribed creators (all posts) + public posts from others
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { userId: { in: creatorIds } },
        { isPublic: true },
        { userId },
      ],
    },
    include: {
      user: {
        select: {
          nickname: true,
          displayName: true,
          profileImage: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(posts);
}
