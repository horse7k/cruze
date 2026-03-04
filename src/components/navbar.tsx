"use client";

import { useSession, signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "./language-switcher";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Home, Compass, PlusSquare, Settings, User, LogOut, Shield } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = session?.user as any;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        height: 60,
        background: "#000",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/cruze.png" alt="CruzeFans" width={28} height={28} />
          <span className="text-[16px] font-bold tracking-tight text-white">
            Cruze<span style={{ color: "#FF10F0" }}>Fans</span>
          </span>
        </Link>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />

          {session ? (
            <div className="flex items-center gap-1">
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{
                    color: "#f39c12",
                    background: "rgba(243,156,18,0.08)",
                    border: "1px solid rgba(243,156,18,0.15)",
                  }}
                >
                  <Shield size={14} />
                  <span>{t("nav", "admin")}</span>
                </Link>
              )}

              <Link
                href="/feed"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: "#8a96a3" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#e8e8e8";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#8a96a3";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <Home size={15} />
                <span>{t("nav", "home")}</span>
              </Link>

              <Link
                href="/explore"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: "#8a96a3" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#e8e8e8";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#8a96a3";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <Compass size={15} />
                <span>{t("nav", "explore")}</span>
              </Link>

              <Link
                href={user?.nickname ? `/${user.nickname}` : "/nickname"}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg ml-1 transition-colors"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt=""
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                    style={{ width: 24, height: 24 }}
                  />
                ) : (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                    style={{ background: "#FF10F0", color: "#fff" }}
                  >
                    {user?.nickname?.[0]?.toUpperCase() || <User size={11} />}
                  </div>
                )}
                <span className="text-sm font-medium text-white">
                  {user?.nickname || "Set username"}
                </span>
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 rounded-lg transition-colors ml-0.5"
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
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-outline text-sm !py-2 !px-4">
                {t("nav", "login")}
              </Link>
              <Link href="/signup" className="btn-primary text-sm !py-2 !px-4">
                {t("nav", "signup")}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg"
            style={{ color: "#8a96a3" }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] as const }}
            className="md:hidden overflow-hidden"
            style={{
              background: "#0d0d1a",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="px-4 py-3 space-y-0.5">
              {session ? (
                <>
                  <MobileLink href="/feed" onClick={() => setMobileOpen(false)}>
                    <Home size={17} /> {t("nav", "home")}
                  </MobileLink>
                  <MobileLink href="/explore" onClick={() => setMobileOpen(false)}>
                    <Compass size={17} /> {t("nav", "explore")}
                  </MobileLink>
                  {user?.isCreator && (
                    <MobileLink href="/create" onClick={() => setMobileOpen(false)}>
                      <PlusSquare size={17} /> {t("nav", "create")}
                    </MobileLink>
                  )}
                  <MobileLink href="/settings" onClick={() => setMobileOpen(false)}>
                    <Settings size={17} /> {t("nav", "settings")}
                  </MobileLink>
                  {user?.role === "ADMIN" && (
                    <MobileLink href="/admin" onClick={() => setMobileOpen(false)}>
                      <Shield size={17} /> {t("nav", "admin")}
                    </MobileLink>
                  )}
                  <MobileLink
                    href={user?.nickname ? `/${user.nickname}` : "/nickname"}
                    onClick={() => setMobileOpen(false)}
                  >
                    <User size={17} /> {t("nav", "profile")}
                  </MobileLink>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: "#e74c3c" }}
                  >
                    <LogOut size={17} />
                    {t("nav", "logout")}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 py-2">
                  <Link
                    href="/login"
                    className="btn-outline text-center text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("nav", "login")}
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-primary text-center text-sm justify-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("nav", "signup")}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
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
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
      style={{ color: "#8a96a3" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#e8e8e8";
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#8a96a3";
        e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </Link>
  );
}
