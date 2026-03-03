"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Compass, Heart, MessageCircle, Lock, Film, Loader2 } from "lucide-react";

interface Post {
  id: string;
  type: string;
  mediaUrl: string;
  caption: string | null;
  isPublic: boolean;
  createdAt: string;
  user: {
    nickname: string;
    displayName: string | null;
    profileImage: string | null;
  };
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function FeedPage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const user = session?.user as any;
    if (!user?.nickname) {
      router.push("/nickname");
      return;
    }

    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status, session, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={28} className="animate-spin" style={{ color: "#00AFF0" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("feed", "title")}</h1>
      </div>

      {posts.length === 0 ? (
        <motion.div
          className="text-center py-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{
              background: "rgba(0,175,240,0.08)",
              border: "1px solid rgba(0,175,240,0.15)",
            }}
          >
            <Compass size={26} style={{ color: "#00AFF0" }} />
          </div>
          <p className="text-lg font-semibold text-white mb-2">{t("feed", "empty")}</p>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>
            Follow some creators to fill your feed
          </p>
          <Link href="/explore" className="btn-primary inline-flex items-center gap-2">
            <Compass size={15} />
            {t("feed", "explore")}
          </Link>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07 } },
          }}
        >
          {posts.map((post) => (
            <motion.div key={post.id} variants={cardVariants}>
              <PostCard post={post} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <Link href={`/${post.user.nickname}`} className="shrink-0">
          {post.user.profileImage ? (
            <Image
              src={post.user.profileImage}
              alt=""
              width={40}
              height={40}
              className="rounded-full object-cover"
              style={{ width: 40, height: 40 }}
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "linear-gradient(135deg, rgba(0,175,240,0.2), rgba(123,97,255,0.2))", color: "#00AFF0" }}
            >
              {post.user.nickname[0].toUpperCase()}
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/${post.user.nickname}`}
            className="text-sm font-semibold text-white hover:text-[#00AFF0] transition-colors"
          >
            {post.user.displayName || post.user.nickname}
          </Link>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            @{post.user.nickname} &middot; {timeAgo(post.createdAt)}
          </p>
        </div>
        {!post.isPublic && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{
              background: "rgba(0,175,240,0.08)",
              border: "1px solid rgba(0,175,240,0.15)",
              color: "#00AFF0",
            }}
          >
            <Lock size={11} />
            Exclusive
          </div>
        )}
      </div>

      {/* Media */}
      <div className="relative aspect-square" style={{ background: "#0A0A0A" }}>
        {post.type === "PHOTO" ? (
          <Image src={post.mediaUrl} alt="" fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <Film size={28} style={{ color: "rgba(255,255,255,0.3)" }} />
            </div>
          </div>
        )}
      </div>

      {/* Actions & Caption */}
      <div className="px-4 py-3.5">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setLiked(!liked)}
            className="transition-all duration-150 active:scale-90"
            style={{ color: liked ? "#EF4444" : "rgba(255,255,255,0.5)" }}
          >
            <Heart
              size={21}
              fill={liked ? "#EF4444" : "none"}
              style={{ transition: "all 0.15s ease" }}
            />
          </button>
          <button
            className="transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#00AFF0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
          >
            <MessageCircle size={21} />
          </button>
        </div>

        {post.caption && (
          <p className="text-sm leading-relaxed">
            <Link
              href={`/${post.user.nickname}`}
              className="font-semibold text-white mr-1.5 hover:underline"
            >
              {post.user.nickname}
            </Link>
            <span style={{ color: "rgba(255,255,255,0.65)" }}>{post.caption}</span>
          </p>
        )}
      </div>
    </div>
  );
}
