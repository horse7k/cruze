"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import {
  Home,
  Compass,
  PlusSquare,
  Settings,
  User,
  LogOut,
  Shield,
  BarChart2,
} from "lucide-react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { t } = useI18n();
  const user = session?.user as any;

  const navLinks = [
    { href: "/feed", label: t("nav", "home"), icon: <Home size={20} /> },
    { href: "/explore", label: t("nav", "explore"), icon: <Compass size={20} /> },
    ...(user?.isCreator
      ? [
          { href: "/dashboard", label: "Dashboard", icon: <BarChart2 size={20} /> },
          { href: "/create", label: t("nav", "create"), icon: <PlusSquare size={20} /> },
        ]
      : []),
    { href: "/settings", label: t("nav", "settings"), icon: <Settings size={20} /> },
    {
      href: user?.nickname ? `/${user.nickname}` : "/nickname",
      label: t("nav", "profile"),
      icon: <User size={20} />,
    },
    ...(user?.role === "ADMIN"
      ? [{ href: "/admin", label: t("nav", "admin"), icon: <Shield size={20} /> }]
      : []),
  ];

  const isActive = (href: string) => {
    if (href === "/feed") return pathname === "/feed" || pathname === "/";
    return pathname.startsWith(href);
  };

  const isLoggedIn = !!session;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen" style={{ background: "#000" }}>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#000" }}>
      {/* ---- SIDEBAR (desktop only) ---- */}
      <aside
        className="hidden md:flex flex-col shrink-0"
        style={{
          width: 240,
          minHeight: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          background: "#0d0d1a",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div className="px-5 py-6">
          <Link href="/feed" className="flex items-center gap-2.5">
            <img src="/cruze.png" alt="CruzeFans" width={30} height={30} />
            <span className="text-[17px] font-bold tracking-tight text-white">
              Cruze<span style={{ color: "#FF10F0" }}>Fans</span>
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link${isActive(link.href) ? " active" : ""}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="sidebar-link w-full text-left"
            style={{ color: "#5f6b7a" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#e74c3c";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(231,76,60,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#5f6b7a";
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <LogOut size={20} />
            <span>{t("nav", "logout")}</span>
          </button>
        </div>
      </aside>

      {/* ---- MAIN CONTENT ---- */}
      <div className="flex-1 flex flex-col md:ml-[240px] min-h-screen">
        <main className="flex-1 pb-[56px] md:pb-0">
          <div className="max-w-[600px] mx-auto px-3 md:px-4">
            {children}
          </div>
        </main>
      </div>

      {/* ---- BOTTOM NAV (mobile only) ---- */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex items-center"
        style={{
          height: 56,
          background: "#0d0d1a",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          zIndex: 50,
        }}
      >
        <Link
          href="/feed"
          className={`bottom-nav-item${isActive("/feed") ? " active" : ""}`}
        >
          <Home size={22} />
          <span>{t("nav", "home")}</span>
        </Link>

        <Link
          href="/explore"
          className={`bottom-nav-item${isActive("/explore") ? " active" : ""}`}
        >
          <Compass size={22} />
          <span>{t("nav", "explore")}</span>
        </Link>

        {user?.isCreator && (
          <>
            <Link
              href="/dashboard"
              className={`bottom-nav-item${isActive("/dashboard") ? " active" : ""}`}
            >
              <BarChart2 size={22} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/create"
              className="bottom-nav-item flex-1"
              style={{ color: "#FF10F0" }}
            >
              <PlusSquare size={22} />
              <span>{t("nav", "create")}</span>
            </Link>
          </>
        )}

        <Link
          href="/settings"
          className={`bottom-nav-item${isActive("/settings") ? " active" : ""}`}
        >
          <Settings size={22} />
          <span>{t("nav", "settings")}</span>
        </Link>

        <Link
          href={user?.nickname ? `/${user.nickname}` : "/nickname"}
          className={`bottom-nav-item${
            user?.nickname && pathname.startsWith(`/${user.nickname}`) ? " active" : ""
          }`}
        >
          <User size={22} />
          <span>{t("nav", "profile")}</span>
        </Link>
      </nav>
    </div>
  );
}
