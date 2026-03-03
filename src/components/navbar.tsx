"use client";

import { useSession, signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "./language-switcher";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Menu,
  X,
  Home,
  Compass,
  PlusSquare,
  Settings,
  LogOut,
  Shield,
  User,
} from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = session?.user as any;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(10, 10, 10, 0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 relative">
              <Image
                src="/cruze.png"
                alt="CruzeFans"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ color: "#FFFFFF" }}
            >
              Cruze
              <span style={{ color: "#00AFF0" }}>Fans</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {session ? (
              <>
                <NavLink href="/feed" icon={<Home size={18} />}>
                  {t("nav", "home")}
                </NavLink>
                <NavLink href="/explore" icon={<Compass size={18} />}>
                  {t("nav", "explore")}
                </NavLink>
                {user?.isCreator && (
                  <NavLink href="/create" icon={<PlusSquare size={18} />}>
                    {t("nav", "create")}
                  </NavLink>
                )}
              </>
            ) : null}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            {session ? (
              <div className="flex items-center gap-2">
                {user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{ color: "#F59E0B" }}
                  >
                    <Shield size={16} />
                    <span className="font-medium">{t("nav", "admin")}</span>
                  </Link>
                )}
                <Link
                  href="/settings"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#FFFFFF";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Settings size={16} />
                </Link>
                <Link
                  href={user?.nickname ? `/${user.nickname}` : "/nickname"}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                >
                  {user?.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt=""
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                      style={{ width: 28, height: 28 }}
                    />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "#00AFF0" }}
                    >
                      {user?.nickname?.[0]?.toUpperCase() || <User size={14} />}
                    </div>
                  )}
                  <span className="text-sm font-medium text-white">
                    {user?.nickname || "Set username"}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#EF4444";
                    e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="btn-outline text-sm !py-2 !px-4"
                >
                  {t("nav", "login")}
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary text-sm !py-2 !px-4"
                >
                  {t("nav", "signup")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            background: "#0F0F0F",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="px-4 py-4 space-y-1">
            {session ? (
              <>
                <MobileLink href="/feed" onClick={() => setMobileOpen(false)}>
                  <Home size={18} />
                  {t("nav", "home")}
                </MobileLink>
                <MobileLink href="/explore" onClick={() => setMobileOpen(false)}>
                  <Compass size={18} />
                  {t("nav", "explore")}
                </MobileLink>
                {user?.isCreator && (
                  <MobileLink href="/create" onClick={() => setMobileOpen(false)}>
                    <PlusSquare size={18} />
                    {t("nav", "create")}
                  </MobileLink>
                )}
                <MobileLink href="/settings" onClick={() => setMobileOpen(false)}>
                  <Settings size={18} />
                  {t("nav", "settings")}
                </MobileLink>
                {user?.role === "ADMIN" && (
                  <MobileLink href="/admin" onClick={() => setMobileOpen(false)}>
                    <Shield size={18} />
                    {t("nav", "admin")}
                  </MobileLink>
                )}
                <MobileLink
                  href={user?.nickname ? `/${user.nickname}` : "/nickname"}
                  onClick={() => setMobileOpen(false)}
                >
                  <User size={18} />
                  {t("nav", "profile")}
                </MobileLink>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm transition-colors"
                  style={{ color: "#EF4444" }}
                >
                  <LogOut size={18} />
                  {t("nav", "logout")}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/login"
                  className="btn-outline text-center text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("nav", "login")}
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary text-center text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("nav", "signup")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
      style={{ color: "rgba(255,255,255,0.7)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#FFFFFF";
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(255,255,255,0.7)";
        e.currentTarget.style.background = "transparent";
      }}
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors"
      style={{ color: "rgba(255,255,255,0.8)" }}
    >
      {children}
    </Link>
  );
}
