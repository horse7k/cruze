import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, refCode } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Track referral if refCode provided
    if (refCode && typeof refCode === "string") {
      const referrer = await prisma.user.findUnique({ where: { referralCode: refCode } });
      if (referrer) {
        await prisma.referral.create({
          data: { referrerId: referrer.id, referredId: user.id },
        }).catch(() => {}); // ignore if already exists
      }
    }

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
