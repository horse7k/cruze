"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { isValidNickname } from "@/lib/utils";
import Link from "next/link";
import { AtSign, Check, X, Loader2, ArrowRight } from "lucide-react";

export default function NicknamePage() {
  const { t } = useI18n();
  const { data: session, status, update } = useSession();
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

      // Force session refresh so /feed sees the new nickname
      await update();
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
        style={{ background: "#000000" }}
      >
        <Loader2 size={28} className="animate-spin" style={{ color: "#FF10F0" }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#000000" }}
    >
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
            {t("auth", "nickname_title")}
          </h1>
          <p
            className="text-sm"
            style={{ color: "#8a96a3" }}
          >
            {t("auth", "nickname_subtitle")}
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: "#5f6b7a" }}
              >
                {t("auth", "nickname_label") || "Username"}
              </label>

              {/* Input with @ prefix icon and status indicator */}
              <div className="relative">
                <AtSign
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#5f6b7a" }}
                />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) =>
                    setNickname(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                    )
                  }
                  className="input-field !pl-10 !pr-10"
                  placeholder={t("auth", "nickname_placeholder")}
                  maxLength={20}
                  required
                  autoComplete="username"
                  style={{
                    borderColor:
                      available === true
                        ? "rgba(29,185,84,0.5)"
                        : available === false
                        ? "rgba(231,76,60,0.5)"
                        : undefined,
                  }}
                />

                {/* Status indicator */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {checking && (
                    <Loader2
                      size={14}
                      className="animate-spin"
                      style={{ color: "#5f6b7a" }}
                    />
                  )}
                  {!checking && available === true && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(29,185,84,0.15)" }}
                    >
                      <Check size={11} style={{ color: "#1db954" }} />
                    </div>
                  )}
                  {!checking && available === false && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(231,76,60,0.15)" }}
                    >
                      <X size={11} style={{ color: "#e74c3c" }} />
                    </div>
                  )}
                </div>
              </div>

              {/* URL preview */}
              {nickname.length >= 3 && (
                <p
                  className="text-xs mt-2"
                  style={{ color: "#5f6b7a" }}
                >
                  cruzefans.com/
                  <span style={{ color: "#FF10F0", fontWeight: 600 }}>
                    {nickname}
                  </span>
                </p>
              )}

              {/* Availability messages */}
              {available === true && (
                <p
                  className="text-xs mt-1 font-medium"
                  style={{ color: "#1db954" }}
                >
                  {t("auth", "nickname_available")}
                </p>
              )}
              {available === false && (
                <p
                  className="text-xs mt-1 font-medium"
                  style={{ color: "#e74c3c" }}
                >
                  {t("auth", "nickname_taken")}
                </p>
              )}

              {/* Rules hint */}
              <p
                className="text-xs mt-2"
                style={{ color: "#5f6b7a" }}
              >
                {t("auth", "nickname_rules")}
              </p>
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
              disabled={loading || !available || !isValidNickname(nickname)}
              className="btn-primary w-full !py-3"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {t("auth", "nickname_button")}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
