"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Loader2 } from "lucide-react";

export default function WalletLoginButton() {
  const { t } = useI18n();
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasTriggeredLogin = useRef(false);

  const handleWalletAuth = useCallback(async () => {
    if (!publicKey || hasTriggeredLogin.current) return;
    hasTriggeredLogin.current = true;
    setLoading(true);
    setError("");

    try {
      const walletAddress = publicKey.toBase58();

      const result = await signIn("wallet", {
        walletAddress,
        signature: "auto",
        message: "Sign in to CruzeFans",
        redirect: false,
      });

      if (result?.error) {
        setError("Wallet authentication failed");
        setLoading(false);
        hasTriggeredLogin.current = false;
        disconnect();
      } else {
        // Always go to /nickname first — it will redirect to /feed if nickname already set
        router.push("/nickname");
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
      hasTriggeredLogin.current = false;
      disconnect();
    }
  }, [publicKey, disconnect, router]);

  useEffect(() => {
    if (connected && publicKey) {
      handleWalletAuth();
    }
  }, [connected, publicKey, handleWalletAuth]);

  const handleClick = () => {
    hasTriggeredLogin.current = false;
    setError("");
    setVisible(true);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl text-sm font-semibold transition-colors"
        style={{
          background: "#1a1a2e",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#e8e8e8",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#222240";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#1a1a2e";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        }}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" style={{ color: "#FF10F0" }} />
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 128 128" fill="none">
              <circle cx="64" cy="64" r="64" fill="#AB9FF2" />
              <path
                d="M110.584 64.914H99.142C99.142 44.058 82.208 27.124 61.352 27.124C41.168 27.124 24.658 43.01 23.734 62.952C22.766 83.978 40.534 101.876 61.564 101.876H65.926C86.074 101.876 110.584 82.33 110.584 64.914Z"
                fill="url(#phantom_g)"
              />
              <path
                d="M47.014 64.914C47.014 68.292 44.276 71.03 40.898 71.03C37.52 71.03 34.782 68.292 34.782 64.914C34.782 61.536 37.52 58.798 40.898 58.798C44.276 58.798 47.014 61.536 47.014 64.914Z"
                fill="#fff"
              />
              <path
                d="M69.014 64.914C69.014 68.292 66.276 71.03 62.898 71.03C59.52 71.03 56.782 68.292 56.782 64.914C56.782 61.536 59.52 58.798 62.898 58.798C66.276 58.798 69.014 61.536 69.014 64.914Z"
                fill="#fff"
              />
              <defs>
                <linearGradient id="phantom_g" x1="23.704" y1="64.5" x2="110.584" y2="64.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#534BB1" />
                  <stop offset="1" stopColor="#551BF9" />
                </linearGradient>
              </defs>
            </svg>
            {t("auth", "connect_wallet")}
          </>
        )}
      </button>
      {error && (
        <p
          className="text-xs mt-2 text-center"
          style={{ color: "#e74c3c" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
