"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
        <Loader2 size={28} className="animate-spin" style={{ color: "#00AFF0" }} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-2xl font-bold tracking-tight">{t("nav", "explore")}</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            {t("landing", "creators_subtitle")}
          </p>
        </motion.div>

        <motion.div
          className="relative w-full sm:w-72"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
        >
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "rgba(255,255,255,0.25)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !pl-11"
            placeholder={t("admin", "search")}
          />
        </motion.div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Search size={22} style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
          <p className="text-base font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
            No creators found.
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06 } },
          }}
        >
          {filtered.map((creator) => (
            <motion.div
              key={creator.id}
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
              }}
            >
              <CreatorCard creator={creator} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Link href={`/${creator.nickname}`} className="block group">
      <div
        className="rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: "#111111",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(0,175,240,0.22)";
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(0,175,240,0.06)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)";
        }}
      >
        {/* Banner */}
        <div
          className="h-28 relative"
          style={{
            background: creator.bannerImage
              ? undefined
              : "linear-gradient(135deg, rgba(0,175,240,0.18), rgba(123,97,255,0.14))",
          }}
        >
          {creator.bannerImage && (
            <Image src={creator.bannerImage} alt="" fill className="object-cover" />
          )}
          {/* Banner overlay */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(17,17,17,0.8) 100%)" }}
          />
        </div>

        {/* Content */}
        <div className="px-4 pb-4 -mt-9 relative">
          {/* Avatar */}
          <div
            className="w-[60px] h-[60px] rounded-full overflow-hidden mb-3 transition-transform duration-300 group-hover:scale-105"
            style={{ border: "3px solid #111111", background: "#0A0A0A" }}
          >
            {creator.profileImage ? (
              <Image
                src={creator.profileImage}
                alt=""
                width={60}
                height={60}
                className="object-cover w-full h-full"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xl font-bold"
                style={{ background: "linear-gradient(135deg, rgba(0,175,240,0.2), rgba(123,97,255,0.2))", color: "#00AFF0" }}
              >
                {creator.nickname?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <h3 className="font-semibold text-white text-[15px] leading-tight">
            {creator.displayName || creator.nickname}
          </h3>
          <p className="text-xs mb-3 mt-0.5" style={{ color: "#00AFF0" }}>
            @{creator.nickname}
          </p>

          {creator.bio && (
            <p
              className="text-xs leading-relaxed mb-3 line-clamp-2"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {creator.bio}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <ImageIcon size={13} style={{ color: "rgba(255,255,255,0.28)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                {creator.postsCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={13} style={{ color: "rgba(255,255,255,0.28)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                {creator.subscribersCount}
              </span>
            </div>
            {creator.subscriptionPlan && (
              <span
                className="text-xs font-semibold ml-auto px-2.5 py-1 rounded-lg"
                style={{
                  background: "rgba(0,175,240,0.08)",
                  border: "1px solid rgba(0,175,240,0.15)",
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
