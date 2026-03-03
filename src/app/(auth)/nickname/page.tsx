"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { isValidNickname } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
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
        <Loader2 size={32} className="animate-spin" style={{ color: "#00AFF0" }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative"
      style={{ background: "#0A0A0A" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,175,240,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <Image src="/cruze.png" alt="CruzeFans" width={36} height={36} />
            <span className="text-2xl font-bold">
              Cruze<span style={{ color: "#00AFF0" }}>Fans</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">
            {t("auth", "nickname_title")}
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            {t("auth", "nickname_subtitle")}
          </p>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "rgba(20,20,20,0.8)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(12px)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Username
              </label>
              <div className="relative">
                <AtSign
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className="input-field !pl-11 !pr-11"
                  placeholder={t("auth", "nickname_placeholder")}
                  maxLength={20}
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {checking && (
                    <Loader2 size={16} className="animate-spin" style={{ color: "rgba(255,255,255,0.3)" }} />
                  )}
                  {!checking && available === true && (
                    <Check size={16} style={{ color: "#22C55E" }} />
                  )}
                  {!checking && available === false && (
                    <X size={16} style={{ color: "#EF4444" }} />
                  )}
                </div>
              </div>

              {/* Preview URL */}
              {nickname.length >= 3 && (
                <p
                  className="text-xs mt-2"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  cruzefans.com/<span style={{ color: "#00AFF0" }}>{nickname}</span>
                </p>
              )}

              {/* Status */}
              {available === true && (
                <p className="text-xs mt-1.5" style={{ color: "#22C55E" }}>
                  {t("auth", "nickname_available")}
                </p>
              )}
              {available === false && (
                <p className="text-xs mt-1.5" style={{ color: "#EF4444" }}>
                  {t("auth", "nickname_taken")}
                </p>
              )}

              <p
                className="text-xs mt-2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {t("auth", "nickname_rules")}
              </p>
            </div>

            {error && (
              <p className="text-sm" style={{ color: "#EF4444" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !available || !isValidNickname(nickname)}
              className="btn-primary w-full flex items-center justify-center gap-2 !py-3"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {t("auth", "nickname_button")}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
