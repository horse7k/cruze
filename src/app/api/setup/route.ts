import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const adminExists = await prisma.user.findUnique({
      where: { email: "admin@cruzefans.com" },
    });

    if (adminExists) {
      return NextResponse.json({ message: "Setup already completed" });
    }

    const password = await bcrypt.hash("admin123", 12);
    const userPassword = await bcrypt.hash("test123", 12);

    // 1. Create Admin
    const admin = await prisma.user.create({
      data: {
        email: "admin@cruzefans.com",
        password,
        nickname: "admin",
        displayName: "CruzeFans Admin",
        role: "ADMIN",
        bio: "Platform administrator",
      },
    });

    // 2. Create Content Creator
    const creator = await prisma.user.create({
      data: {
        email: "creator@cruzefans.com",
        password: userPassword,
        nickname: "starlight",
        displayName: "Luna Starlight",
        bio: "Digital artist & photographer. Sharing my exclusive work here! Subscribe to see behind the scenes content.",
        isCreator: true,
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=luna&backgroundColor=00AFF0",
        bannerImage: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=300&fit=crop",
      },
    });

    // Create subscription plan for creator
    await prisma.subscriptionPlan.create({
      data: {
        userId: creator.id,
        monthlyPrice: 9.99,
        quarterlyPrice: 24.99,
        semiAnnualPrice: 44.99,
      },
    });

    // Create some posts for the creator
    await prisma.post.createMany({
      data: [
        {
          userId: creator.id,
          type: "PHOTO",
          mediaUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop",
          caption: "New artwork for my collection! What do you think?",
          isPublic: true,
        },
        {
          userId: creator.id,
          type: "PHOTO",
          mediaUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&h=600&fit=crop",
          caption: "Behind the scenes of my latest project",
          isPublic: false,
        },
        {
          userId: creator.id,
          type: "PHOTO",
          mediaUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop",
          caption: "Exclusive preview for my subscribers!",
          isPublic: false,
        },
        {
          userId: creator.id,
          type: "PHOTO",
          mediaUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&h=600&fit=crop",
          caption: "Free preview of my latest work",
          isPublic: true,
        },
      ],
    });

    // Create a story
    const storyExpires = new Date();
    storyExpires.setHours(storyExpires.getHours() + 20);
    await prisma.story.create({
      data: {
        userId: creator.id,
        type: "PHOTO",
        mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=700&fit=crop",
        expiresAt: storyExpires,
      },
    });

    // 3. Create Regular Test User
    const testUser = await prisma.user.create({
      data: {
        email: "user@cruzefans.com",
        password: userPassword,
        nickname: "testuser",
        displayName: "Test User",
        bio: "Just a fan checking out content!",
      },
    });

    // 4. Create Subscriber User (subscribed to the creator)
    const subscriber1 = await prisma.user.create({
      data: {
        email: "fan1@cruzefans.com",
        password: userPassword,
        nickname: "superfan1",
        displayName: "Super Fan",
        bio: "Biggest supporter!",
      },
    });

    const subscriber2 = await prisma.user.create({
      data: {
        email: "fan2@cruzefans.com",
        password: userPassword,
        nickname: "artlover",
        displayName: "Art Lover",
        bio: "I love digital art!",
      },
    });

    // Create subscriptions
    const endDate1 = new Date();
    endDate1.setMonth(endDate1.getMonth() + 1);
    const endDate2 = new Date();
    endDate2.setMonth(endDate2.getMonth() + 3);

    await prisma.subscription.createMany({
      data: [
        {
          subscriberId: subscriber1.id,
          creatorId: creator.id,
          planType: "MONTHLY",
          endDate: endDate1,
          amount: 9.99,
          status: "ACTIVE",
        },
        {
          subscriberId: subscriber2.id,
          creatorId: creator.id,
          planType: "QUARTERLY",
          endDate: endDate2,
          amount: 24.99,
          status: "ACTIVE",
        },
      ],
    });

    return NextResponse.json({
      message: "Setup completed successfully!",
      accounts: {
        admin: { email: "admin@cruzefans.com", password: "admin123" },
        creator: { email: "creator@cruzefans.com", password: "test123", nickname: "starlight" },
        user: { email: "user@cruzefans.com", password: "test123", nickname: "testuser" },
        subscriber1: { email: "fan1@cruzefans.com", password: "test123", nickname: "superfan1" },
        subscriber2: { email: "fan2@cruzefans.com", password: "test123", nickname: "artlover" },
      },
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Setup failed", details: String(error) }, { status: 500 });
  }
}
