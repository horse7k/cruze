"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Users, ImageIcon, Loader2, Search } from "lucide-react";

interface Creator {
  id: string;
  nickname: string;
  displayName: string | null;
  bio: string | null;
  profileImage: string | null;
  bannerImage: string | null;
  postsCount: number;
  subscribersCount: number;
  subscriptionPlan: {
    monthlyPrice: number;
  } | null;
}

export default function ExplorePage() {
  const { t } = useI18n();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/users/creators")
      .then((res) => res.json())
      .then((data) => {
        setCreators(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = creators.filter(
    (c) =>
      c.nickname?.toLowerCase().includes(search.toLowerCase()) ||
      c.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin" style={{ color: "#00AFF0" }} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t("nav", "explore")}</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            {t("landing", "creators_subtitle")}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "rgba(255,255,255,0.3)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !pl-11"
            placeholder={t("admin", "search")}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p style={{ color: "rgba(255,255,255,0.45)" }}>
            No creators found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      )}
    </div>
  );
}

function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Link href={`/${creator.nickname}`}>
      <div
        className="rounded-2xl overflow-hidden transition-all"
        style={{
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(0,175,240,0.3)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,175,240,0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Banner */}
        <div
          className="h-28 relative"
          style={{
            background: creator.bannerImage
              ? undefined
              : "linear-gradient(135deg, rgba(0,175,240,0.2), rgba(123,97,255,0.15))",
          }}
        >
          {creator.bannerImage && (
            <Image
              src={creator.bannerImage}
              alt=""
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Profile */}
        <div className="px-4 pb-4 -mt-8 relative">
          <div
            className="w-16 h-16 rounded-full overflow-hidden mb-3"
            style={{
              border: "3px solid #141414",
              background: "#0A0A0A",
            }}
          >
            {creator.profileImage ? (
              <Image
                src={creator.profileImage}
                alt=""
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xl font-bold"
                style={{ background: "rgba(0,175,240,0.15)", color: "#00AFF0" }}
              >
                {creator.nickname?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <h3 className="font-semibold text-white text-base">
            {creator.displayName || creator.nickname}
          </h3>
          <p className="text-xs mb-3" style={{ color: "#00AFF0" }}>
            @{creator.nickname}
          </p>

          {creator.bio && (
            <p
              className="text-xs leading-relaxed mb-3 line-clamp-2"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {creator.bio}
            </p>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <ImageIcon size={14} style={{ color: "rgba(255,255,255,0.35)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                {creator.postsCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} style={{ color: "rgba(255,255,255,0.35)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                {creator.subscribersCount}
              </span>
            </div>
            {creator.subscriptionPlan && (
              <span
                className="text-xs font-semibold ml-auto px-2.5 py-1 rounded-lg"
                style={{
                  background: "rgba(0,175,240,0.1)",
                  color: "#00AFF0",
                }}
              >
                {formatCurrency(creator.subscriptionPlan.monthlyPrice)}/mo
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
