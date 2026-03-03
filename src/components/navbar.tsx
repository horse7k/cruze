"use client";

import { useSession, signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "./language-switcher";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
        background: "rgba(10, 10, 10, 0.88)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[60px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 relative flex items-center justify-center">
              <img
                src="/cruze.png"
                alt="CruzeFans"
                width={32}
                height={32}
                style={{ filter: "drop-shadow(0 0 6px rgba(0,175,240,0.4))" }}
              />
            </div>
            <span
              className="text-[17px] font-bold tracking-tight"
              style={{
                background: "linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0.85) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Cruze<span style={{ WebkitTextFillColor: "#00AFF0", background: "none" }}>Fans</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-0.5">
            {session ? (
              <>
                <NavLink href="/feed" icon={<Home size={16} />}>
                  {t("nav", "home")}
                </NavLink>
                <NavLink href="/explore" icon={<Compass size={16} />}>
                  {t("nav", "explore")}
                </NavLink>
                {user?.isCreator && (
                  <NavLink href="/create" icon={<PlusSquare size={16} />}>
                    {t("nav", "create")}
                  </NavLink>
                )}
              </>
            ) : null}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-1.5">
            <LanguageSwitcher />
            {session ? (
              <div className="flex items-center gap-1.5">
                {user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{ color: "#F59E0B", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}
                  >
                    <Shield size={14} />
                    <span>{t("nav", "admin")}</span>
                  </Link>
                )}
                <Link
                  href="/settings"
                  className="p-2 rounded-lg transition-all"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#FFFFFF";
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Settings size={16} />
                </Link>
                <Link
                  href={user?.nickname ? `/${user.nickname}` : "/nickname"}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.09)";
                    e.currentTarget.style.borderColor = "rgba(0,175,240,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }}
                >
                  {user?.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt=""
                      width={26}
                      height={26}
                      className="rounded-full object-cover"
                      style={{ width: 26, height: 26 }}
                    />
                  ) : (
                    <div
                      className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-bold"
                      style={{ background: "linear-gradient(135deg, #00AFF0, #7B61FF)" }}
                    >
                      {user?.nickname?.[0]?.toUpperCase() || <User size={12} />}
                    </div>
                  )}
                  <span className="text-sm font-medium text-white">
                    {user?.nickname || "Set username"}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2 rounded-lg transition-all"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#EF4444";
                    e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                    e.currentTarget.style.background = "transparent";
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
              className="p-2 rounded-lg transition-all"
              style={{ color: "rgba(255,255,255,0.7)", background: mobileOpen ? "rgba(255,255,255,0.07)" : "transparent" }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden overflow-hidden"
            style={{
              background: "#0D0D0D",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div className="px-4 py-4 space-y-0.5">
              {session ? (
                <>
                  <MobileLink href="/feed" onClick={() => setMobileOpen(false)}>
                    <Home size={17} />
                    {t("nav", "home")}
                  </MobileLink>
                  <MobileLink href="/explore" onClick={() => setMobileOpen(false)}>
                    <Compass size={17} />
                    {t("nav", "explore")}
                  </MobileLink>
                  {user?.isCreator && (
                    <MobileLink href="/create" onClick={() => setMobileOpen(false)}>
                      <PlusSquare size={17} />
                      {t("nav", "create")}
                    </MobileLink>
                  )}
                  <MobileLink href="/settings" onClick={() => setMobileOpen(false)}>
                    <Settings size={17} />
                    {t("nav", "settings")}
                  </MobileLink>
                  {user?.role === "ADMIN" && (
                    <MobileLink href="/admin" onClick={() => setMobileOpen(false)}>
                      <Shield size={17} />
                      {t("nav", "admin")}
                    </MobileLink>
                  )}
                  <MobileLink
                    href={user?.nickname ? `/${user.nickname}` : "/nickname"}
                    onClick={() => setMobileOpen(false)}
                  >
                    <User size={17} />
                    {t("nav", "profile")}
                  </MobileLink>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{ color: "#EF4444" }}
                  >
                    <LogOut size={17} />
                    {t("nav", "logout")}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1 pb-2">
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
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
      style={{ color: "rgba(255,255,255,0.6)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#FFFFFF";
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
        e.currentTarget.style.background = "transparent";
      }}
    >
      {icon}
      <span>{children}</span>
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
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
      style={{ color: "rgba(255,255,255,0.75)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#FFFFFF";
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(255,255,255,0.75)";
        e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </Link>
  );
}
