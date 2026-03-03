"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Wallet, Loader2 } from "lucide-react";

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
        router.push("/feed");
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
        className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all"
        style={{
          background: "rgba(123,97,255,0.1)",
          border: "1px solid rgba(123,97,255,0.25)",
          color: "#A78BFA",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(123,97,255,0.15)";
          e.currentTarget.style.borderColor = "rgba(123,97,255,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(123,97,255,0.1)";
          e.currentTarget.style.borderColor = "rgba(123,97,255,0.25)";
        }}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <Wallet size={18} />
            {t("auth", "connect_wallet")}
          </>
        )}
      </button>
      {error && (
        <p className="text-sm mt-2" style={{ color: "#EF4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}
