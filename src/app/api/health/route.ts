import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const count = await prisma.user.count();
    return NextResponse.json({
      status: "ok",
      database: "connected",
      userCount: count,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        database: "failed",
        error: error.message,
        env: {
          hasDbUrl: !!process.env.DATABASE_URL,
          hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
          hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        },
      },
      { status: 500 }
    );
  }
}
