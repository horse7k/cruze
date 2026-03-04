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
        <Loader2 size={24} className="animate-spin" style={{ color: "#FF10F0" }} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">{t("nav", "explore")}</h1>
          <p className="text-sm mt-0.5" style={{ color: "#8a96a3" }}>
            {t("landing", "creators_subtitle")}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#5f6b7a" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: 40 }}
            placeholder={t("admin", "search")}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Search size={20} style={{ color: "#5f6b7a" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "#8a96a3" }}>
            No creators found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    <Link href={`/${creator.nickname}`} className="block">
      <div className="card-hover rounded-xl overflow-hidden">
        {/* Banner */}
        <div
          className="relative"
          style={{ height: 100, background: "#1a1a2e" }}
        >
          {creator.bannerImage && (
            <Image src={creator.bannerImage} alt="" fill className="object-cover" />
          )}
        </div>

        {/* Content */}
        <div className="px-4 pb-4" style={{ marginTop: -28 }}>
          {/* Avatar */}
          <div
            className="rounded-full overflow-hidden mb-3"
            style={{
              width: 56,
              height: 56,
              border: "3px solid #000",
              background: "#12121f",
            }}
          >
            {creator.profileImage ? (
              <Image
                src={creator.profileImage}
                alt=""
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-lg font-bold"
                style={{ color: "#FF10F0" }}
              >
                {creator.nickname?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <p className="font-semibold text-white text-sm leading-tight">
            {creator.displayName || creator.nickname}
          </p>
          <p className="text-xs mt-0.5 mb-2" style={{ color: "#FF10F0" }}>
            @{creator.nickname}
          </p>

          {creator.bio && (
            <p
              className="text-xs leading-relaxed mb-3 line-clamp-2"
              style={{ color: "#8a96a3" }}
            >
              {creator.bio}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <ImageIcon size={12} style={{ color: "#5f6b7a" }} />
              <span className="text-xs" style={{ color: "#8a96a3" }}>
                {creator.postsCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={12} style={{ color: "#5f6b7a" }} />
              <span className="text-xs" style={{ color: "#8a96a3" }}>
                {creator.subscribersCount}
              </span>
            </div>
            {creator.subscriptionPlan && (
              <span
                className="badge badge-blue ml-auto"
                style={{ fontSize: 11 }}
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
