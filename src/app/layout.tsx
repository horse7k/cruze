import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/providers/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CruzeFans - Your Content, Your Rules",
  description: "Share exclusive content with your fans. Set your own prices, grow your community, and earn on your terms.",
  icons: { icon: "/cruze.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-bg text-text-primary font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
