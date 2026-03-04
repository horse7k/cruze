import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const comments = await prisma.comment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: {
        select: {
          nickname: true,
          displayName: true,
          profileImage: true,
        },
      },
    },
  });

  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { content } = await req.json();

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }

  if (content.length > 500) {
    return NextResponse.json({ error: "Comment too long (max 500 chars)" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: {
      postId: id,
      userId: (session.user as any).id,
      content: content.trim(),
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
  });

  return NextResponse.json(comment, { status: 201 });
}
