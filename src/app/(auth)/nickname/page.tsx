"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { isValidNickname } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { AtSign, Check, X, Loader2, ArrowRight } from "lucide-react";

export default function NicknamePage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Check if user already has a nickname
  useEffect(() => {
    const user = session?.user as any;
    if (user?.nickname) {
      router.push("/feed");
    }
  }, [session, router]);

  const checkAvailability = useCallback(async (value: string) => {
    if (!isValidNickname(value)) {
      setAvailable(null);
      return;
    }

    setChecking(true);
    try {
      const res = await fetch(`/api/users/check-nickname?nickname=${value}`);
      const data = await res.json();
      setAvailable(data.available);
    } catch {
      setAvailable(null);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (nickname.length >= 3) {
        checkAvailability(nickname);
      } else {
        setAvailable(null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [nickname, checkAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNickname(nickname) || !available) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users/set-nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to set username");
        setLoading(false);
        return;
      }

      router.push("/feed");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0A0A0A" }}
      >
        <Loader2 size={30} className="animate-spin" style={{ color: "#00AFF0" }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "#0A0A0A" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,175,240,0.1) 0%, transparent 55%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          mask: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)",
          WebkitMask: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)",
        }}
      />

      <motion.div
        className="relative w-full max-w-[420px]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-9">
          <Link href="/" className="inline-flex items-center gap-3 mb-7">
            <img
              src="/cruze.png"
              alt="CruzeFans"
              width={36}
              height={36}
              style={{ filter: "drop-shadow(0 0 8px rgba(0,175,240,0.45))" }}
            />
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              Cruze<span style={{ color: "#00AFF0" }}>Fans</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">
            {t("auth", "nickname_title")}
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            {t("auth", "nickname_subtitle")}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7"
          style={{
            background: "linear-gradient(145deg, rgba(17,17,17,0.98), rgba(13,13,13,0.96))",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.5), 0 0 40px rgba(0,175,240,0.04)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Username
              </label>
              <div className="relative">
                <AtSign
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className="input-field !pl-11 !pr-11"
                  placeholder={t("auth", "nickname_placeholder")}
                  maxLength={20}
                  required
                  style={{
                    borderColor: available === true
                      ? "rgba(34,197,94,0.4)"
                      : available === false
                      ? "rgba(239,68,68,0.4)"
                      : undefined,
                  }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {checking && (
                    <Loader2 size={15} className="animate-spin" style={{ color: "rgba(255,255,255,0.3)" }} />
                  )}
                  {!checking && available === true && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(34,197,94,0.15)" }}
                    >
                      <Check size={11} style={{ color: "#22C55E" }} />
                    </div>
                  )}
                  {!checking && available === false && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(239,68,68,0.15)" }}
                    >
                      <X size={11} style={{ color: "#EF4444" }} />
                    </div>
                  )}
                </div>
              </div>

              {/* URL preview */}
              {nickname.length >= 3 && (
                <p className="text-xs mt-2.5" style={{ color: "rgba(255,255,255,0.28)" }}>
                  cruzefans.com/
                  <span style={{ color: "#00AFF0", fontWeight: 600 }}>{nickname}</span>
                </p>
              )}

              {/* Status messages */}
              {available === true && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: "#22C55E" }}>
                  {t("auth", "nickname_available")}
                </p>
              )}
              {available === false && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: "#EF4444" }}>
                  {t("auth", "nickname_taken")}
                </p>
              )}

              <p className="text-xs mt-2.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                {t("auth", "nickname_rules")}
              </p>
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#FC8181",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !available || !isValidNickname(nickname)}
              className="btn-primary w-full flex items-center justify-center gap-2 !py-3"
            >
              {loading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <>
                  {t("auth", "nickname_button")}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
