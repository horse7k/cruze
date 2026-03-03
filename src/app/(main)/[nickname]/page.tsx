"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Film,
  Users,
  Calendar,
  Settings,
  Heart,
  Loader2,
  X,
  ImageIcon,
  Check,
} from "lucide-react";

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
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [storyViewer, setStoryViewer] = useState<number | null>(null);

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

  const handleSubscribe = async (planType: string) => {
    if (!profile) return;
    setSubscribing(true);

    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: profile.id, planType }),
      });

      if (res.ok) {
        setProfile({ ...profile, isSubscribed: true });
        setShowPlanModal(false);
      }
    } catch {}
    setSubscribing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin" style={{ color: "#00AFF0" }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-24">
        <p className="text-lg font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
          User not found
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Banner */}
      <div
        className="h-48 sm:h-[220px] relative overflow-hidden"
        style={{
          background: profile.bannerImage
            ? undefined
            : "linear-gradient(135deg, rgba(0,175,240,0.18), rgba(123,97,255,0.12))",
        }}
      >
        {profile.bannerImage && (
          <Image src={profile.bannerImage} alt="" fill className="object-cover" />
        )}
        {/* Gradient overlay at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, transparent 40%, rgba(10,10,10,0.7) 100%)",
          }}
        />
      </div>

      {/* Profile section */}
      <div className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14 mb-7 relative">
          {/* Avatar with story ring if has stories */}
          <div className="shrink-0">
            {profile.stories.length > 0 ? (
              <button
                onClick={() => setStoryViewer(0)}
                className="block"
              >
                <div className="story-ring">
                  <div className="story-ring-inner">
                    <div className="w-[90px] h-[90px] sm:w-[108px] sm:h-[108px] rounded-full overflow-hidden">
                      {profile.profileImage ? (
                        <Image
                          src={profile.profileImage}
                          alt=""
                          width={108}
                          height={108}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-3xl font-bold"
                          style={{ background: "linear-gradient(135deg, rgba(0,175,240,0.2), rgba(123,97,255,0.2))", color: "#00AFF0" }}
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
                className="w-[90px] h-[90px] sm:w-[108px] sm:h-[108px] rounded-full overflow-hidden"
                style={{ border: "4px solid #0A0A0A", background: "#141414" }}
              >
                {profile.profileImage ? (
                  <Image
                    src={profile.profileImage}
                    alt=""
                    width={108}
                    height={108}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-3xl font-bold"
                    style={{ background: "linear-gradient(135deg, rgba(0,175,240,0.2), rgba(123,97,255,0.2))", color: "#00AFF0" }}
                  >
                    {profile.nickname?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex-1 flex items-center gap-3 sm:justify-end">
            {profile.isOwner ? (
              <Link href="/settings" className="btn-outline flex items-center gap-2 text-sm">
                <Settings size={15} />
                {t("profile", "edit_profile")}
              </Link>
            ) : profile.isCreator && !profile.isSubscribed ? (
              <button
                onClick={() => setShowPlanModal(true)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Heart size={15} />
                {t("profile", "subscribe")}
              </button>
            ) : profile.isSubscribed ? (
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  color: "#22C55E",
                }}
              >
                <Check size={15} />
                {t("profile", "subscribed")}
              </div>
            ) : null}
          </div>
        </div>

        {/* Name, bio, stats */}
        <div className="mb-7">
          <h1 className="text-xl font-bold text-white leading-tight">
            {profile.displayName || profile.nickname}
          </h1>
          <p className="text-sm mt-0.5 mb-4" style={{ color: "#00AFF0" }}>
            @{profile.nickname}
          </p>
          {profile.bio && (
            <p className="text-sm leading-relaxed max-w-lg mb-5" style={{ color: "rgba(255,255,255,0.58)" }}>
              {profile.bio}
            </p>
          )}

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">{profile.postsCount}</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
                {t("profile", "posts")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">{profile.subscribersCount}</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
                {t("profile", "subscribers")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} style={{ color: "rgba(255,255,255,0.28)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
                {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Stories strip (secondary view below avatar) */}
        {profile.stories.length > 0 && (
          <div className="mb-7">
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
              {t("profile", "stories")}
            </h3>
            <div className="flex items-center gap-3 overflow-x-auto pb-1 -mx-1 px-1">
              {profile.stories.map((story, idx) => (
                <button
                  key={story.id}
                  onClick={() => setStoryViewer(idx)}
                  className="shrink-0 transition-transform hover:scale-105"
                >
                  <div className="story-ring">
                    <div className="story-ring-inner">
                      <div className="w-14 h-14 rounded-full overflow-hidden">
                        <Image
                          src={story.mediaUrl}
                          alt=""
                          width={56}
                          height={56}
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

        {/* Posts Grid */}
        <div
          className="pb-10"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <h3
            className="text-xs font-semibold py-5 uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {t("profile", "posts")}
          </h3>

          {profile.posts.length === 0 ? (
            <div className="text-center py-16">
              <ImageIcon size={28} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.2)" }} />
              <p style={{ color: "rgba(255,255,255,0.3)" }}>
                {t("profile", "no_posts")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
              {profile.posts.map((post) => (
                <div
                  key={post.id}
                  className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                  style={{ background: "#111111" }}
                >
                  {post.type === "PHOTO" ? (
                    <Image src={post.mediaUrl} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film size={22} style={{ color: "rgba(255,255,255,0.2)" }} />
                    </div>
                  )}

                  {!post.isPublic && (
                    <div
                      className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.55)" }}
                    >
                      <Lock size={12} style={{ color: "#00AFF0" }} />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                  >
                    <Heart size={18} className="text-white" fill="white" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Exclusive content CTA */}
          {profile.isCreator && !profile.isSubscribed && !profile.isOwner && (
            <motion.div
              className="mt-6 p-7 rounded-2xl text-center"
              style={{
                background: "linear-gradient(145deg, rgba(0,175,240,0.06), rgba(123,97,255,0.04))",
                border: "1px solid rgba(0,175,240,0.12)",
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(0,175,240,0.1)", border: "1px solid rgba(0,175,240,0.15)" }}
              >
                <Lock size={20} style={{ color: "#00AFF0" }} />
              </div>
              <p className="text-base font-semibold text-white mb-1.5">
                {t("profile", "exclusive_content")}
              </p>
              {profile.subscriptionPlan && (
                <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Starting at {formatCurrency(profile.subscriptionPlan.monthlyPrice)}/month
                </p>
              )}
              <button
                onClick={() => setShowPlanModal(true)}
                className="btn-primary flex items-center gap-2 mx-auto text-sm"
              >
                <Heart size={15} />
                {t("profile", "subscribe")}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Subscription Modal */}
      <AnimatePresence>
        {showPlanModal && profile.subscriptionPlan && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
            onClick={() => setShowPlanModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl p-7"
              style={{
                background: "linear-gradient(145deg, #141414, #111111)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
              }}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">{t("profile", "choose_plan")}</h3>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
                    Subscribe to unlock exclusive content
                  </p>
                </div>
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                  style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2.5">
                <PlanOption
                  label={t("profile", "monthly")}
                  price={profile.subscriptionPlan.monthlyPrice}
                  period="/mo"
                  onClick={() => handleSubscribe("MONTHLY")}
                  loading={subscribing}
                />
                <PlanOption
                  label={t("profile", "quarterly")}
                  price={profile.subscriptionPlan.quarterlyPrice}
                  period="/3mo"
                  onClick={() => handleSubscribe("QUARTERLY")}
                  loading={subscribing}
                  badge="Save 15%"
                />
                <PlanOption
                  label={t("profile", "semi_annual")}
                  price={profile.subscriptionPlan.semiAnnualPrice}
                  period="/6mo"
                  onClick={() => handleSubscribe("SEMI_ANNUAL")}
                  loading={subscribing}
                  badge="Best Value"
                  highlight
                />
              </div>
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
            transition={{ duration: 0.2 }}
          >
            <button
              className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
              onClick={() => setStoryViewer(null)}
            >
              <X size={18} />
            </button>

            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 flex gap-1 p-3">
              {profile.stories.map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-0.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: idx < storyViewer ? "100%" : idx === storyViewer ? "50%" : "0%",
                      background: "#FFFFFF",
                      transition: "none",
                    }}
                  />
                </div>
              ))}
            </div>

            <motion.div
              className="max-w-lg w-full aspect-[9/16] relative"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.2 }}
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
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.1)", color: "#FFFFFF" }}
                onClick={(e) => { e.stopPropagation(); setStoryViewer(storyViewer - 1); }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              >
                &larr;
              </button>
            )}
            {storyViewer < profile.stories.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.1)", color: "#FFFFFF" }}
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
    </motion.div>
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
      className="w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all text-left group"
      style={{
        background: highlight ? "rgba(0,175,240,0.07)" : "rgba(255,255,255,0.03)",
        border: highlight
          ? "1px solid rgba(0,175,240,0.25)"
          : "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(0,175,240,0.35)";
        e.currentTarget.style.background = highlight ? "rgba(0,175,240,0.1)" : "rgba(0,175,240,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = highlight ? "rgba(0,175,240,0.25)" : "rgba(255,255,255,0.07)";
        e.currentTarget.style.background = highlight ? "rgba(0,175,240,0.07)" : "rgba(255,255,255,0.03)";
      }}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{label}</span>
          {badge && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: "rgba(0,175,240,0.12)", color: "#00AFF0" }}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        <span className="text-lg font-bold text-white">{formatCurrency(price)}</span>
        <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          {period}
        </span>
      </div>
    </button>
  );
}
