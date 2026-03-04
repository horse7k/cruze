import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Providers from "@/providers/providers";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" className={dmSans.variable}>
      <body className="bg-bg text-text-primary font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
