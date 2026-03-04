"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import {
  Lock,
  Users,
  Calendar,
  Settings,
  Heart,
  Loader2,
  X,
  ImageIcon,
  Check,
  MessageCircle,
  DollarSign,
  Bookmark,
  Send,
  Wallet,
  QrCode,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const TREASURY_WALLET = new PublicKey(
  process.env.NEXT_PUBLIC_TREASURY_WALLET || "HpWM72DxnWDMTcRB7rUpvA4XkjFLJ4VjqV2nYjvngSXr"
);

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  user: {
    nickname: string;
    displayName: string | null;
    profileImage: string | null;
  };
}

interface ProfileData {
  id: string;
  nickname: string;
  displayName: string | null;
  bio: string | null;
  profileImage: string | null;
  bannerImage: string | null;
  isCreator: boolean;
  subscriptionPlan: {
    monthlyPrice: number;
    quarterlyPrice: number;
    semiAnnualPrice: number;
  } | null;
  postsCount: number;
  subscribersCount: number;
  isSubscribed: boolean;
  isOwner: boolean;
  posts: Array<{
    id: string;
    type: string;
    mediaUrl: string;
    caption: string | null;
    isPublic: boolean;
    createdAt: string;
  }>;
  stories: Array<{
    id: string;
    mediaUrl: string;
    type: string;
    expiresAt: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export default function ProfilePage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const wallet = useWallet();
  const { connection } = useConnection();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [storyViewer, setStoryViewer] = useState<number | null>(null);

  // Payment flow state
  const [selectedPlan, setSelectedPlan] = useState<{ type: string; amount: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"select" | "usdc" | "pix" | null>(null);
  const [paymentError, setPaymentError] = useState("");
  const [showPixMessage, setShowPixMessage] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${params.nickname}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.nickname]);

  const closePlanModal = () => {
    setShowPlanModal(false);
    setSelectedPlan(null);
    setPaymentMethod(null);
    setPaymentError("");
    setShowPixMessage(false);
  };

  const selectPlan = (type: string, amount: number) => {
    setSelectedPlan({ type, amount });
    setPaymentMethod("select");
    setPaymentError("");
  };

  const activateSubscription = useCallback(async (planType: string) => {
    if (!profile) return;
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorId: profile.id, planType }),
    });
    if (res.ok) {
      setProfile({ ...profile, isSubscribed: true });
      closePlanModal();
    }
  }, [profile]);

  const handleUsdcPayment = async () => {
    if (!selectedPlan || !wallet.publicKey || !wallet.signTransaction) {
      setPaymentError("Please connect your Solana wallet first");
      return;
    }

    setSubscribing(true);
    setPaymentError("");

    try {
      const amount = Math.round(selectedPlan.amount * 1_000_000); // USDC has 6 decimals

      const senderAta = await getAssociatedTokenAddress(USDC_MINT, wallet.publicKey);
      const recipientAta = await getAssociatedTokenAddress(USDC_MINT, TREASURY_WALLET);

      const tx = new Transaction();

      // Check if recipient ATA exists, create if not
      try {
        await getAccount(connection, recipientAta);
      } catch {
        tx.add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            recipientAta,
            TREASURY_WALLET,
            USDC_MINT,
          )
        );
      }

      tx.add(
        createTransferInstruction(
          senderAta,
          recipientAta,
          wallet.publicKey,
          amount,
        )
      );

      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet.publicKey;

      const signedTx = await wallet.signTransaction(tx);
      const txSig = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txSig, "confirmed");

      // Payment confirmed — activate subscription
      await activateSubscription(selectedPlan.type);
    } catch (err: any) {
      const msg = err?.message || "Transaction failed";
      if (msg.includes("User rejected")) {
        setPaymentError("Transaction cancelled");
      } else if (msg.includes("insufficient")) {
        setPaymentError("Insufficient USDC balance");
      } else {
        setPaymentError(msg.length > 80 ? "Transaction failed. Please try again." : msg);
      }
    }
    setSubscribing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin" style={{ color: "#FF10F0" }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-24">
        <p className="text-base font-medium" style={{ color: "#5f6b7a" }}>
          User not found
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Banner */}
      <div
        className="relative overflow-hidden profile-banner-responsive"
        style={{ background: "#1a1a2e" }}
      >
        {profile.bannerImage && (
          <Image src={profile.bannerImage} alt="" fill className="object-cover" />
        )}
      </div>

      {/* Profile section */}
      <div className="px-4 sm:px-6">
        {/* Avatar row */}
        <div className="flex items-end justify-between relative" style={{ marginTop: -40, zIndex: 2 }}>
          <div className="shrink-0">
            {profile.stories.length > 0 ? (
              <button onClick={() => setStoryViewer(0)} className="block">
                <div className="story-ring">
                  <div className="story-ring-inner">
                    <div
                      className="rounded-full overflow-hidden"
                      style={{ width: 84, height: 84 }}
                    >
                      {profile.profileImage ? (
                        <Image
                          src={profile.profileImage}
                          alt=""
                          width={84}
                          height={84}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-2xl font-bold"
                          style={{ background: "#1a1a2e", color: "#FF10F0" }}
                        >
                          {profile.nickname?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ) : (
              <div
                className="rounded-full overflow-hidden"
                style={{
                  width: 84,
                  height: 84,
                  border: "4px solid #000",
                  background: "#1a1a2e",
                }}
              >
                {profile.profileImage ? (
                  <Image
                    src={profile.profileImage}
                    alt=""
                    width={84}
                    height={84}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-2xl font-bold"
                    style={{ color: "#FF10F0" }}
                  >
                    {profile.nickname?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pb-2">
            {profile.isOwner ? (
              <Link href="/settings" className="btn-outline flex items-center gap-2 text-sm">
                <Settings size={14} />
                {t("profile", "edit_profile")}
              </Link>
            ) : profile.isCreator && !profile.isSubscribed ? (
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    router.push(`/login?redirect=/${params.nickname}`);
                  } else {
                    setShowPlanModal(true);
                  }
                }}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Heart size={14} />
                {t("profile", "subscribe")}
              </button>
            ) : profile.isSubscribed ? (
              <div
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: "rgba(29,185,84,0.1)",
                  border: "1px solid rgba(29,185,84,0.2)",
                  color: "#1db954",
                }}
              >
                <Check size={14} />
                {t("profile", "subscribed")}
              </div>
            ) : null}
          </div>
        </div>

        {/* Name, bio, stats */}
        <div className="mt-4 mb-6">
          <h1 className="text-lg font-bold text-white leading-tight">
            {profile.displayName || profile.nickname}
          </h1>
          <p className="text-sm mt-0.5 mb-3" style={{ color: "#FF10F0" }}>
            @{profile.nickname}
          </p>

          {profile.bio && (
            <p className="text-sm leading-relaxed max-w-xl mb-4" style={{ color: "#8a96a3" }}>
              {profile.bio}
            </p>
          )}

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">{profile.postsCount}</span>
              <span className="text-xs" style={{ color: "#5f6b7a" }}>
                {t("profile", "posts")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">{profile.subscribersCount}</span>
              <span className="text-xs" style={{ color: "#5f6b7a" }}>
                {t("profile", "subscribers")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={13} style={{ color: "#5f6b7a" }} />
              <span className="text-xs" style={{ color: "#5f6b7a" }}>
                {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Stories strip — logged in only */}
        {isLoggedIn && profile.stories.length > 0 && (
          <div className="mb-6">
            <p
              className="text-[11px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#5f6b7a" }}
            >
              {t("profile", "stories")}
            </p>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {profile.stories.map((story, idx) => (
                <button
                  key={story.id}
                  onClick={() => setStoryViewer(idx)}
                  className="shrink-0"
                >
                  <div className="story-ring">
                    <div className="story-ring-inner">
                      <div className="rounded-full overflow-hidden" style={{ width: 52, height: 52 }}>
                        <Image
                          src={story.mediaUrl}
                          alt=""
                          width={52}
                          height={52}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content section */}
        {!isLoggedIn ? (
          /* ---- UNAUTHENTICATED: locked content CTA ---- */
          <div
            className="pb-10"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div
              className="mt-6 p-8 rounded-xl text-center"
              style={{
                background: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.06)",
                maxWidth: 580,
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(255,16,240,0.1)", color: "#FF10F0" }}
              >
                <Lock size={22} />
              </div>
              <p className="text-base font-semibold text-white mb-2">
                Subscribe to see content
              </p>
              <p className="text-sm mb-5" style={{ color: "#8a96a3" }}>
                {profile.subscriptionPlan
                  ? `Starting at ${formatCurrency(profile.subscriptionPlan.monthlyPrice)}/month`
                  : "Log in to subscribe and unlock exclusive posts"}
              </p>
              <button
                onClick={() => router.push(`/login?redirect=/${params.nickname}`)}
                className="btn-primary flex items-center gap-2 mx-auto text-sm"
              >
                <Heart size={14} />
                Log in to subscribe
              </button>
            </div>
          </div>
        ) : (
          /* ---- AUTHENTICATED: posts feed ---- */
          <div
            className="pb-10"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-widest py-5"
              style={{ color: "#5f6b7a" }}
            >
              {t("profile", "posts")}
            </p>

            {profile.posts.length === 0 ? (
              <div className="text-center py-16">
                <ImageIcon size={24} className="mx-auto mb-3" style={{ color: "#5f6b7a" }} />
                <p className="text-sm" style={{ color: "#5f6b7a" }}>
                  {t("profile", "no_posts")}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 580 }}>
                {profile.posts.map((post) => (
                  <ProfilePostCard
                    key={post.id}
                    post={post}
                    profile={profile}
                    onSubscribeClick={() => setShowPlanModal(true)}
                  />
                ))}
              </div>
            )}

            {/* Exclusive content CTA */}
            {profile.isCreator && !profile.isSubscribed && !profile.isOwner && (
              <div
                className="mt-6 p-6 rounded-xl text-center"
                style={{
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.06)",
                  maxWidth: 580,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "rgba(255,16,240,0.1)", color: "#FF10F0" }}
                >
                  <Lock size={18} />
                </div>
                <p className="text-base font-semibold text-white mb-1">
                  {t("profile", "exclusive_content")}
                </p>
                {profile.subscriptionPlan && (
                  <p className="text-sm mb-4" style={{ color: "#8a96a3" }}>
                    Starting at {formatCurrency(profile.subscriptionPlan.monthlyPrice)}/month
                  </p>
                )}
                <button
                  onClick={() => setShowPlanModal(true)}
                  className="btn-primary flex items-center gap-2 mx-auto text-sm"
                >
                  <Heart size={14} />
                  {t("profile", "subscribe")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subscription Modal */}
      <AnimatePresence>
        {showPlanModal && profile.subscriptionPlan && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.8)" }}
            onClick={closePlanModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className="w-full max-w-md rounded-xl p-6"
              style={{
                background: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  {paymentMethod && (
                    <button
                      onClick={() => {
                        if (showPixMessage) { setShowPixMessage(false); return; }
                        if (paymentMethod === "select") { setSelectedPlan(null); setPaymentMethod(null); }
                        else { setPaymentMethod("select"); }
                        setPaymentError("");
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: "rgba(255,255,255,0.06)", color: "#8a96a3" }}
                    >
                      <ArrowLeft size={14} />
                    </button>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {!selectedPlan
                        ? t("profile", "choose_plan")
                        : paymentMethod === "select"
                        ? "Choose payment"
                        : showPixMessage
                        ? "PIX Payment"
                        : "Pay with USDC"}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "#5f6b7a" }}>
                      {!selectedPlan
                        ? "Subscribe to unlock exclusive content"
                        : `${formatCurrency(selectedPlan.amount)} — ${selectedPlan.type.replace("_", " ").toLowerCase()}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closePlanModal}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#8a96a3" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Step 1: Choose plan */}
              {!selectedPlan && (
                <div className="space-y-2">
                  <PlanOption
                    label={t("profile", "monthly")}
                    price={profile.subscriptionPlan.monthlyPrice}
                    period="/mo"
                    onClick={() => selectPlan("MONTHLY", profile.subscriptionPlan!.monthlyPrice)}
                    loading={false}
                  />
                  <PlanOption
                    label={t("profile", "quarterly")}
                    price={profile.subscriptionPlan.quarterlyPrice}
                    period="/3mo"
                    onClick={() => selectPlan("QUARTERLY", profile.subscriptionPlan!.quarterlyPrice)}
                    loading={false}
                    badge="Save 15%"
                  />
                  <PlanOption
                    label={t("profile", "semi_annual")}
                    price={profile.subscriptionPlan.semiAnnualPrice}
                    period="/6mo"
                    onClick={() => selectPlan("SEMI_ANNUAL", profile.subscriptionPlan!.semiAnnualPrice)}
                    loading={false}
                    badge="Best Value"
                    highlight
                  />
                </div>
              )}

              {/* Step 2: Choose payment method */}
              {selectedPlan && paymentMethod === "select" && !showPixMessage && (
                <div className="space-y-2">
                  <button
                    onClick={() => setPaymentMethod("usdc")}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-colors"
                    style={{ background: "rgba(255,16,240,0.06)", border: "1px solid rgba(255,16,240,0.15)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,16,240,0.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,16,240,0.06)"; }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,16,240,0.12)", color: "#FF10F0" }}
                    >
                      <Wallet size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">USDC (Solana)</p>
                      <p className="text-xs" style={{ color: "#5f6b7a" }}>Pay with your Solana wallet</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowPixMessage(true)}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-colors"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(29,185,84,0.12)", color: "#1db954" }}
                    >
                      <QrCode size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">PIX</p>
                      <p className="text-xs" style={{ color: "#5f6b7a" }}>Brazilian instant payment</p>
                    </div>
                  </button>
                </div>
              )}

              {/* PIX message */}
              {showPixMessage && (
                <div className="text-center py-6">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgba(243,156,18,0.1)", color: "#f39c12" }}
                  >
                    <AlertCircle size={24} />
                  </div>
                  <p className="text-base font-semibold text-white mb-2">
                    Report to adm
                  </p>
                  <p className="text-sm" style={{ color: "#8a96a3" }}>
                    To pay via PIX, please contact the administrator to complete your subscription.
                  </p>
                </div>
              )}

              {/* USDC payment */}
              {selectedPlan && paymentMethod === "usdc" && !showPixMessage && (
                <div className="space-y-4">
                  <div
                    className="rounded-xl p-4 text-center"
                    style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-2xl font-bold text-white mb-1">
                      {selectedPlan.amount.toFixed(2)} USDC
                    </p>
                    <p className="text-xs" style={{ color: "#5f6b7a" }}>
                      on Solana network
                    </p>
                  </div>

                  {!wallet.connected ? (
                    <button
                      onClick={() => wallet.select && wallet.select(null as any)}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                      style={{ paddingTop: 12, paddingBottom: 12 }}
                    >
                      <Wallet size={16} />
                      Connect wallet
                    </button>
                  ) : (
                    <button
                      onClick={handleUsdcPayment}
                      disabled={subscribing}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                      style={{ paddingTop: 12, paddingBottom: 12 }}
                    >
                      {subscribing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          Pay {selectedPlan.amount.toFixed(2)} USDC
                        </>
                      )}
                    </button>
                  )}

                  {wallet.connected && (
                    <p className="text-[11px] text-center truncate" style={{ color: "#5f6b7a" }}>
                      Wallet: {wallet.publicKey?.toBase58().slice(0, 8)}...{wallet.publicKey?.toBase58().slice(-4)}
                    </p>
                  )}

                  {paymentError && (
                    <div
                      className="px-4 py-3 rounded-xl text-sm text-center"
                      style={{
                        background: "rgba(231,76,60,0.08)",
                        border: "1px solid rgba(231,76,60,0.2)",
                        color: "#e74c3c",
                      }}
                    >
                      {paymentError}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Viewer */}
      <AnimatePresence>
        {storyViewer !== null && profile.stories[storyViewer] && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.96)" }}
            onClick={() => setStoryViewer(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
              onClick={() => setStoryViewer(null)}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
            >
              <X size={16} />
            </button>

            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 flex gap-1 p-3">
              {profile.stories.map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-full overflow-hidden"
                  style={{ height: 2, background: "rgba(255,255,255,0.15)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: idx < storyViewer ? "100%" : idx === storyViewer ? "50%" : "0%",
                      background: "#FFFFFF",
                    }}
                  />
                </div>
              ))}
            </div>

            <motion.div
              className="relative"
              style={{ maxWidth: 400, width: "100%", aspectRatio: "9/16" }}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={profile.stories[storyViewer].mediaUrl}
                alt=""
                fill
                className="object-contain"
              />
            </motion.div>

            {storyViewer > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}
                onClick={(e) => { e.stopPropagation(); setStoryViewer(storyViewer - 1); }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              >
                &larr;
              </button>
            )}
            {storyViewer < profile.stories.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}
                onClick={(e) => { e.stopPropagation(); setStoryViewer(storyViewer + 1); }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              >
                &rarr;
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfilePostCard({
  post,
  profile,
  onSubscribeClick,
}: {
  post: ProfileData["posts"][number];
  profile: ProfileData;
  onSubscribeClick: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 80 + 2));
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const handleLike = () => {
    if (liked) setLikeCount((c) => c - 1);
    else setLikeCount((c) => c + 1);
    setLiked(!liked);
  };

  const toggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && !commentsLoaded) {
      const res = await fetch(`/api/posts/${post.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
      setCommentsLoaded(true);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText }),
    });
    if (res.ok) {
      const comment = await res.json();
      setComments((prev) => [comment, ...prev]);
      setCommentText("");
    }
    setSubmitting(false);
  };

  return (
    <div className="post-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="rounded-full overflow-hidden"
            style={{ width: 44, height: 44, background: "#12121f", border: "2px solid rgba(255,255,255,0.06)" }}
          >
            {profile.profileImage ? (
              <Image
                src={profile.profileImage}
                alt=""
                width={44}
                height={44}
                className="object-cover w-full h-full"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-sm font-bold"
                style={{ color: "#FF10F0" }}
              >
                {profile.nickname[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              {profile.displayName || profile.nickname}
            </p>
            <p className="text-xs" style={{ color: "#5f6b7a" }}>
              @{profile.nickname}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!post.isPublic && (
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={{ background: "rgba(255,16,240,0.1)", color: "#FF10F0" }}
            >
              <Lock size={10} />
            </span>
          )}
          <span className="text-xs" style={{ color: "#5f6b7a" }}>
            {timeAgo(post.createdAt)}
          </span>
        </div>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-sm leading-relaxed" style={{ color: "#e8e8e8" }}>
            {post.caption}
          </p>
        </div>
      )}

      {/* Media */}
      {post.mediaUrl && (
        <div className="w-full relative" style={{ background: "#0d0d1a" }}>
          {post.type === "PHOTO" ? (
            <Image
              src={post.mediaUrl}
              alt=""
              width={580}
              height={400}
              className="w-full h-auto block"
            />
          ) : (
            <div className="w-full flex items-center justify-center" style={{ height: 240 }}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: "#8a96a3" }}>
                  <polygon points="5,3 19,12 5,21" fill="currentColor" />
                </svg>
              </div>
            </div>
          )}
          {/* Locked overlay */}
          {!post.isPublic && !profile.isSubscribed && !profile.isOwner && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: "rgba(0,0,0,0.7)" }}
            >
              <Lock size={28} style={{ color: "#8a96a3" }} />
              <button
                onClick={onSubscribeClick}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Heart size={13} />
                Subscribe to unlock
              </button>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div
        className="flex items-center gap-1 px-3 py-2.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <button
          onClick={handleLike}
          className={`post-action${liked ? " liked" : ""}`}
          aria-label="Like"
        >
          <Heart
            size={18}
            fill={liked ? "#e74c3c" : "none"}
            style={{ color: liked ? "#e74c3c" : undefined }}
          />
          <span>{likeCount}</span>
        </button>

        <button
          onClick={toggleComments}
          className="post-action"
          aria-label="Comment"
          style={{ color: showComments ? "#FF10F0" : undefined }}
        >
          <MessageCircle size={18} />
          <span>{commentsLoaded && comments.length > 0 ? comments.length : "Comment"}</span>
        </button>

        <button className="post-action" aria-label="Tip">
          <DollarSign size={18} />
          <span>Tip</span>
        </button>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setBookmarked(!bookmarked)}
          className="post-action"
          aria-label="Bookmark"
          style={{ color: bookmarked ? "#FF10F0" : undefined }}
        >
          <Bookmark
            size={18}
            fill={bookmarked ? "#FF10F0" : "none"}
            style={{ color: bookmarked ? "#FF10F0" : undefined }}
          />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div
          className="px-4 pb-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center gap-2 py-3">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="Write a comment..."
              className="input-field !py-2 !text-sm flex-1"
              maxLength={500}
            />
            <button
              onClick={submitComment}
              disabled={!commentText.trim() || submitting}
              className="p-2 rounded-lg transition-colors"
              style={{
                background: commentText.trim() ? "#FF10F0" : "rgba(255,255,255,0.06)",
                color: commentText.trim() ? "#fff" : "#5f6b7a",
              }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          {comments.length > 0 && (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div
                    className="shrink-0 rounded-full overflow-hidden"
                    style={{ width: 28, height: 28, background: "#12121f" }}
                  >
                    {c.user.profileImage ? (
                      <Image src={c.user.profileImage} alt="" width={28} height={28} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold" style={{ color: "#FF10F0" }}>
                        {c.user.nickname[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-white">{c.user.displayName || c.user.nickname}</span>
                      <span className="text-[10px]" style={{ color: "#5f6b7a" }}>{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: "#e8e8e8" }}>{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlanOption({
  label,
  price,
  period,
  onClick,
  loading,
  badge,
  highlight,
}: {
  label: string;
  price: number;
  period: string;
  onClick: () => void;
  loading: boolean;
  badge?: string;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-colors"
      style={{
        background: highlight ? "rgba(255,16,240,0.08)" : "rgba(255,255,255,0.03)",
        border: highlight
          ? "1px solid rgba(255,16,240,0.2)"
          : "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = highlight
          ? "rgba(255,16,240,0.12)"
          : "rgba(255,255,255,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = highlight
          ? "rgba(255,16,240,0.08)"
          : "rgba(255,255,255,0.03)";
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-white">{label}</span>
        {badge && (
          <span className="badge badge-blue" style={{ fontSize: 10 }}>
            {badge}
          </span>
        )}
      </div>
      <div className="text-right">
        <span className="text-base font-bold text-white">{formatCurrency(price)}</span>
        <span className="text-xs ml-1" style={{ color: "#5f6b7a" }}>
          {period}
        </span>
      </div>
    </button>
  );
}
