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
    return NextResponse.json({ error: "Only creators can post stories" }, { status: 403 });
  }

  const { type, mediaUrl } = await req.json();

  if (!type || !mediaUrl) {
    return NextResponse.json({ error: "Type and media URL are required" }, { status: 400 });
  }

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const story = await prisma.story.create({
    data: {
      userId,
      type,
      mediaUrl,
      expiresAt,
    },
  });

  return NextResponse.json(story, { status: 201 });
}
