"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
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
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#000000" }}
    >
      {/* Language switcher */}
      <div className="fixed top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <img
              src="/cruze.png"
              alt="CruzeFans"
              width={34}
              height={34}
            />
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: "#e8e8e8" }}
            >
              Cruze<span style={{ color: "#FF10F0" }}>Fans</span>
            </span>
          </Link>

          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: "#e8e8e8" }}
          >
            {t("auth", "login_title")}
          </h1>
          <p
            className="text-sm"
            style={{ color: "#8a96a3" }}
          >
            {t("auth", "login_subtitle")}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "#1a1a2e",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Wallet connect */}
          <div className="mb-5">
            <WalletLoginButton />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
            <span
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: "#5f6b7a" }}
            >
              {t("auth", "or")}
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: "#5f6b7a" }}
              >
                {t("auth", "email")}
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#5f6b7a" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field !pl-10"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: "#5f6b7a" }}
              >
                {t("auth", "password")}
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#5f6b7a" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-10 !pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#5f6b7a" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#8a96a3";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#5f6b7a";
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                role="alert"
                style={{
                  background: "rgba(231,76,60,0.08)",
                  border: "1px solid rgba(231,76,60,0.2)",
                  color: "#e74c3c",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {t("auth", "login_button")}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <p
          className="text-center text-sm mt-6"
          style={{ color: "#8a96a3" }}
        >
          {t("auth", "no_account")}{" "}
          <Link
            href="/signup"
            className="font-semibold transition-colors"
            style={{ color: "#FF10F0" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ff40f3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#FF10F0";
            }}
          >
            {t("nav", "signup")}
          </Link>
        </p>
      </div>
    </div>
  );
}
