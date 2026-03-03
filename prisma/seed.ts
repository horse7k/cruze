import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Seeding database...");

  const password = await bcrypt.hash("admin123", 12);
  const userPassword = await bcrypt.hash("test123", 12);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@cruzefans.com" },
    update: {},
    create: {
      email: "admin@cruzefans.com",
      password,
      nickname: "admin",
      displayName: "CruzeFans Admin",
      role: "ADMIN",
      bio: "Platform administrator",
    },
  });
  console.log("Admin created:", admin.email);

  // Creator
  const creator = await prisma.user.upsert({
    where: { email: "creator@cruzefans.com" },
    update: {},
    create: {
      email: "creator@cruzefans.com",
      password: userPassword,
      nickname: "starlight",
      displayName: "Luna Starlight",
      bio: "Digital artist & photographer. Sharing exclusive work here!",
      isCreator: true,
    },
  });
  console.log("Creator created:", creator.email);

  await prisma.subscriptionPlan.upsert({
    where: { userId: creator.id },
    update: {},
    create: {
      userId: creator.id,
      monthlyPrice: 9.99,
      quarterlyPrice: 24.99,
      semiAnnualPrice: 44.99,
    },
  });

  // Test user
  const testUser = await prisma.user.upsert({
    where: { email: "user@cruzefans.com" },
    update: {},
    create: {
      email: "user@cruzefans.com",
      password: userPassword,
      nickname: "testuser",
      displayName: "Test User",
      bio: "Just a fan!",
    },
  });
  console.log("Test user created:", testUser.email);

  // Subscribers
  const fan1 = await prisma.user.upsert({
    where: { email: "fan1@cruzefans.com" },
    update: {},
    create: {
      email: "fan1@cruzefans.com",
      password: userPassword,
      nickname: "superfan1",
      displayName: "Super Fan",
    },
  });

  const fan2 = await prisma.user.upsert({
    where: { email: "fan2@cruzefans.com" },
    update: {},
    create: {
      email: "fan2@cruzefans.com",
      password: userPassword,
      nickname: "artlover",
      displayName: "Art Lover",
    },
  });

  const endDate1 = new Date();
  endDate1.setMonth(endDate1.getMonth() + 1);
  const endDate2 = new Date();
  endDate2.setMonth(endDate2.getMonth() + 3);

  await prisma.subscription.upsert({
    where: { subscriberId_creatorId: { subscriberId: fan1.id, creatorId: creator.id } },
    update: {},
    create: {
      subscriberId: fan1.id,
      creatorId: creator.id,
      planType: "MONTHLY",
      endDate: endDate1,
      amount: 9.99,
      status: "ACTIVE",
    },
  });

  await prisma.subscription.upsert({
    where: { subscriberId_creatorId: { subscriberId: fan2.id, creatorId: creator.id } },
    update: {},
    create: {
      subscriberId: fan2.id,
      creatorId: creator.id,
      planType: "QUARTERLY",
      endDate: endDate2,
      amount: 24.99,
      status: "ACTIVE",
    },
  });

  console.log("Subscribers created with active subscriptions");
  console.log("\nSeed complete!");
  console.log("Accounts:");
  console.log("  Admin: admin@cruzefans.com / admin123");
  console.log("  Creator: creator@cruzefans.com / test123 (@starlight)");
  console.log("  User: user@cruzefans.com / test123 (@testuser)");
  console.log("  Fan 1: fan1@cruzefans.com / test123 (@superfan1)");
  console.log("  Fan 2: fan2@cruzefans.com / test123 (@artlover)");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
