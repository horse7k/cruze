"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/navbar";
import { Loader2, ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "#00AFF0" }} />
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#0A0A0A" }}>
        <ShieldAlert size={48} style={{ color: "#EF4444" }} />
        <p className="text-lg font-semibold">Access Denied</p>
        <p style={{ color: "rgba(255,255,255,0.45)" }}>
          You don&apos;t have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
    </div>
  );
}
