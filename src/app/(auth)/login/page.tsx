"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import Image from "next/image";
import LanguageSwitcher from "@/components/language-switcher";
import WalletLoginButton from "@/components/wallet-login-button";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/feed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative"
      style={{ background: "#0A0A0A" }}
    >
      {/* Background effects */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,175,240,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Language switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <Image src="/cruze.png" alt="CruzeFans" width={36} height={36} />
            <span className="text-2xl font-bold">
              Cruze<span style={{ color: "#00AFF0" }}>Fans</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">
            {t("auth", "login_title")}
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            {t("auth", "login_subtitle")}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "rgba(20,20,20,0.8)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Wallet Button */}
          <div className="mb-6">
            <WalletLoginButton />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
              {t("auth", "or")}
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                {t("auth", "email")}
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field !pl-11"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                {t("auth", "password")}
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-11 !pr-11"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm" style={{ color: "#EF4444" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 !py-3"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {t("auth", "login_button")}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <p
          className="text-center text-sm mt-6"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          {t("auth", "no_account")}{" "}
          <Link
            href="/signup"
            className="font-semibold transition-colors"
            style={{ color: "#00AFF0" }}
          >
            {t("nav", "signup")}
          </Link>
        </p>
      </div>
    </div>
  );
}
