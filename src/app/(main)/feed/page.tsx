"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Compass, Heart, MessageCircle, Lock, ImageIcon, Film, Loader2 } from "lucide-react";

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
        <Loader2 size={32} className="animate-spin" style={{ color: "#00AFF0" }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("feed", "title")}</h1>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(0,175,240,0.1)" }}
          >
            <Compass size={28} style={{ color: "#00AFF0" }} />
          </div>
          <p className="text-lg font-medium text-white mb-2">
            {t("feed", "empty")}
          </p>
          <Link href="/explore" className="btn-primary inline-flex items-center gap-2 mt-4">
            <Compass size={16} />
            {t("feed", "explore")}
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#141414",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href={`/${post.user.nickname}`}>
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
              style={{ background: "rgba(0,175,240,0.15)", color: "#00AFF0" }}
            >
              {post.user.nickname[0].toUpperCase()}
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/${post.user.nickname}`}
            className="text-sm font-semibold text-white hover:underline"
          >
            {post.user.displayName || post.user.nickname}
          </Link>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            @{post.user.nickname} &middot; {timeAgo(post.createdAt)}
          </p>
        </div>
        {!post.isPublic && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
            style={{
              background: "rgba(0,175,240,0.1)",
              color: "#00AFF0",
            }}
          >
            <Lock size={12} />
            Exclusive
          </div>
        )}
      </div>

      {/* Media */}
      <div
        className="relative aspect-square"
        style={{ background: "#0A0A0A" }}
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
            <Film size={48} style={{ color: "rgba(255,255,255,0.2)" }} />
          </div>
        )}
      </div>

      {/* Actions & Caption */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-4 mb-3">
          <button
            className="transition-colors"
            style={{ color: "rgba(255,255,255,0.6)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
          >
            <Heart size={22} />
          </button>
          <button
            className="transition-colors"
            style={{ color: "rgba(255,255,255,0.6)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#00AFF0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
          >
            <MessageCircle size={22} />
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
            <span style={{ color: "rgba(255,255,255,0.7)" }}>{post.caption}</span>
          </p>
        )}
      </div>
    </div>
  );
}
