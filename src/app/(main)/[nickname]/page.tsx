"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  ImageIcon,
  Film,
  Users,
  Calendar,
  Settings,
  Heart,
  Loader2,
  X,
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
        <Loader2 size={32} className="animate-spin" style={{ color: "#00AFF0" }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-lg" style={{ color: "rgba(255,255,255,0.45)" }}>
          User not found
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Banner */}
      <div
        className="h-48 sm:h-64 relative"
        style={{
          background: profile.bannerImage
            ? undefined
            : "linear-gradient(135deg, rgba(0,175,240,0.15), rgba(123,97,255,0.1))",
        }}
      >
        {profile.bannerImage && (
          <Image
            src={profile.bannerImage}
            alt=""
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16 mb-6 relative">
          {/* Avatar */}
          <div
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shrink-0"
            style={{ border: "4px solid #0A0A0A", background: "#141414" }}
          >
            {profile.profileImage ? (
              <Image
                src={profile.profileImage}
                alt=""
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-3xl font-bold"
                style={{ background: "rgba(0,175,240,0.15)", color: "#00AFF0" }}
              >
                {profile.nickname?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-1 flex items-center gap-3 sm:justify-end">
            {profile.isOwner ? (
              <Link href="/settings" className="btn-outline flex items-center gap-2 text-sm">
                <Settings size={16} />
                {t("profile", "edit_profile")}
              </Link>
            ) : profile.isCreator && !profile.isSubscribed ? (
              <button
                onClick={() => setShowPlanModal(true)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                {t("profile", "subscribe")}
              </button>
            ) : profile.isSubscribed ? (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  color: "#22C55E",
                }}
              >
                <Heart size={16} />
                {t("profile", "subscribed")}
              </div>
            ) : null}
          </div>
        </div>

        {/* Name & Bio */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">
            {profile.displayName || profile.nickname}
          </h1>
          <p className="text-sm" style={{ color: "#00AFF0" }}>
            @{profile.nickname}
          </p>
          {profile.bio && (
            <p
              className="text-sm mt-3 leading-relaxed max-w-lg"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              {profile.bio}
            </p>
          )}

          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-1.5">
              <ImageIcon size={16} style={{ color: "rgba(255,255,255,0.35)" }} />
              <span className="text-sm font-semibold text-white">{profile.postsCount}</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {t("profile", "posts")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={16} style={{ color: "rgba(255,255,255,0.35)" }} />
              <span className="text-sm font-semibold text-white">{profile.subscribersCount}</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {t("profile", "subscribers")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={16} style={{ color: "rgba(255,255,255,0.35)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Stories */}
        {profile.stories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
              {t("profile", "stories")}
            </h3>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {profile.stories.map((story, idx) => (
                <button
                  key={story.id}
                  onClick={() => setStoryViewer(idx)}
                  className="shrink-0"
                >
                  <div className="story-ring">
                    <div className="story-ring-inner">
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <Image
                          src={story.mediaUrl}
                          alt=""
                          width={64}
                          height={64}
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
          className="pb-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h3
            className="text-sm font-semibold py-4"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            {t("profile", "posts")}
          </h3>

          {profile.posts.length === 0 ? (
            <div className="text-center py-16">
              <p style={{ color: "rgba(255,255,255,0.35)" }}>
                {t("profile", "no_posts")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {profile.posts.map((post) => (
                <div
                  key={post.id}
                  className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                  style={{ background: "#141414" }}
                >
                  {post.type === "PHOTO" ? (
                    <Image
                      src={post.mediaUrl}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film size={24} style={{ color: "rgba(255,255,255,0.2)" }} />
                    </div>
                  )}

                  {!post.isPublic && (
                    <div className="absolute top-2 right-2">
                      <Lock size={14} style={{ color: "#00AFF0" }} />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                  >
                    <Heart size={20} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Exclusive content prompt */}
          {profile.isCreator && !profile.isSubscribed && !profile.isOwner && (
            <div
              className="mt-6 p-6 rounded-2xl text-center"
              style={{
                background: "rgba(0,175,240,0.05)",
                border: "1px solid rgba(0,175,240,0.15)",
              }}
            >
              <Lock size={24} style={{ color: "#00AFF0" }} className="mx-auto mb-3" />
              <p className="text-sm font-medium text-white mb-1">
                {t("profile", "exclusive_content")}
              </p>
              {profile.subscriptionPlan && (
                <p
                  className="text-xs mb-4"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Starting at {formatCurrency(profile.subscriptionPlan.monthlyPrice)}/month
                </p>
              )}
              <button
                onClick={() => setShowPlanModal(true)}
                className="btn-primary text-sm"
              >
                {t("profile", "subscribe")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Plan Modal */}
      {showPlanModal && profile.subscriptionPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowPlanModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              background: "#141414",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{t("profile", "choose_plan")}</h3>
              <button
                onClick={() => setShowPlanModal(false)}
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
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
          </div>
        </div>
      )}

      {/* Story Viewer */}
      {storyViewer !== null && profile.stories[storyViewer] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => setStoryViewer(null)}
        >
          <button
            className="absolute top-4 right-4 z-10"
            style={{ color: "rgba(255,255,255,0.7)" }}
            onClick={() => setStoryViewer(null)}
          >
            <X size={28} />
          </button>

          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 flex gap-1 p-3">
            {profile.stories.map((_, idx) => (
              <div
                key={idx}
                className="flex-1 h-0.5 rounded-full"
                style={{
                  background:
                    idx <= storyViewer
                      ? "#FFFFFF"
                      : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>

          <div className="max-w-lg w-full aspect-[9/16] relative">
            <Image
              src={profile.stories[storyViewer].mediaUrl}
              alt=""
              fill
              className="object-contain"
            />
          </div>

          {/* Nav arrows */}
          {storyViewer > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.1)" }}
              onClick={(e) => {
                e.stopPropagation();
                setStoryViewer(storyViewer - 1);
              }}
            >
              &larr;
            </button>
          )}
          {storyViewer < profile.stories.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.1)" }}
              onClick={(e) => {
                e.stopPropagation();
                setStoryViewer(storyViewer + 1);
              }}
            >
              &rarr;
            </button>
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
      className="w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all text-left"
      style={{
        background: highlight ? "rgba(0,175,240,0.08)" : "rgba(255,255,255,0.03)",
        border: highlight
          ? "1px solid rgba(0,175,240,0.3)"
          : "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(0,175,240,0.4)";
        e.currentTarget.style.background = "rgba(0,175,240,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = highlight
          ? "rgba(0,175,240,0.3)"
          : "rgba(255,255,255,0.07)";
        e.currentTarget.style.background = highlight
          ? "rgba(0,175,240,0.08)"
          : "rgba(255,255,255,0.03)";
      }}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{label}</span>
          {badge && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: "rgba(0,175,240,0.15)",
                color: "#00AFF0",
              }}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        <span className="text-lg font-bold text-white">
          {formatCurrency(price)}
        </span>
        <span
          className="text-xs ml-1"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {period}
        </span>
      </div>
    </button>
  );
}
