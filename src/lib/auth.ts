import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName || user.nickname,
          image: user.profileImage,
        };
      },
    }),
    Credentials({
      id: "wallet",
      name: "Solana Wallet",
      credentials: {
        walletAddress: { label: "Wallet Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.walletAddress) {
            console.error("[wallet-auth] No walletAddress provided");
            return null;
          }

          const walletAddress = credentials.walletAddress as string;
          console.log("[wallet-auth] Attempting auth for:", walletAddress);

          let user = await prisma.user.findUnique({
            where: { walletAddress },
          });

          if (!user) {
            console.log("[wallet-auth] Creating new user for wallet:", walletAddress);
            user = await prisma.user.create({
              data: { walletAddress },
            });
          }

          console.log("[wallet-auth] Success, user id:", user.id);
          return {
            id: user.id,
            email: user.email,
            name: user.displayName || user.nickname,
            image: user.profileImage,
          };
        } catch (error) {
          console.error("[wallet-auth] Error:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/nickname",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            email: true,
            nickname: true,
            displayName: true,
            profileImage: true,
            role: true,
            isCreator: true,
          },
        });
        if (dbUser) {
          (session.user as any).id = dbUser.id;
          (session.user as any).nickname = dbUser.nickname;
          (session.user as any).displayName = dbUser.displayName;
          (session.user as any).role = dbUser.role;
          (session.user as any).isCreator = dbUser.isCreator;
          (session.user as any).profileImage = dbUser.profileImage;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "cruzefans-super-secret-key-change-in-production",
});
