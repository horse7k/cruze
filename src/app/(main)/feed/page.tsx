"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  Heart,
  MessageCircle,
  DollarSign,
  Bookmark,
  Lock,
  Loader2,
  Send,
} from "lucide-react";

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
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin" style={{ color: "#FF10F0" }} />
          <p className="text-sm" style={{ color: "#5f6b7a" }}>Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto py-4 sm:py-6"
      style={{ maxWidth: 580 }}
    >
      {posts.length === 0 ? (
        <div className="text-center py-24">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Compass size={24} style={{ color: "#8a96a3" }} />
          </div>
          <p className="text-base font-semibold text-white mb-1">{t("feed", "empty")}</p>
          <p className="text-sm mb-5" style={{ color: "#5f6b7a" }}>
            Follow some creators to fill your feed
          </p>
          <Link href="/explore" className="btn-primary inline-flex items-center gap-2">
            <Compass size={14} />
            {t("feed", "explore")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: "10px" }} data-feed>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 120 + 4));
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLikeCount((c) => c - 1);
    } else {
      setLikeCount((c) => c + 1);
    }
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
    <div className={`post-card${!post.isPublic ? " exclusive" : ""}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Link href={`/${post.user.nickname}`} className="shrink-0">
          <div
            className="rounded-full overflow-hidden"
            style={{
              width: 44,
              height: 44,
              background: "#12121f",
              border: !post.isPublic ? "2px solid rgba(255,16,240,0.35)" : "2px solid rgba(255,255,255,0.06)",
            }}
          >
            {post.user.profileImage ? (
              <Image
                src={post.user.profileImage}
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
                {post.user.nickname[0].toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            href={`/${post.user.nickname}`}
            className="text-sm font-semibold text-white hover:text-[#FF10F0] transition-colors leading-tight block"
          >
            {post.user.displayName || post.user.nickname}
          </Link>
          <p className="text-xs mt-0.5" style={{ color: "#5f6b7a" }}>
            @{post.user.nickname}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
        <div
          className="w-full relative"
          style={{ background: "#0d0d1a" }}
        >
          {post.type === "PHOTO" ? (
            <Image
              src={post.mediaUrl}
              alt=""
              width={580}
              height={400}
              className="w-full h-auto block"
              style={{ display: "block" }}
            />
          ) : (
            <div
              className="w-full flex items-center justify-center"
              style={{ height: 280 }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "#8a96a3" }}>
                  <polygon points="5,3 19,12 5,21" fill="currentColor" />
                </svg>
              </div>
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
          {/* Comment input */}
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

          {/* Comments list */}
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
