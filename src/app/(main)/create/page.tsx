"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import {
  Upload,
  ImageIcon,
  Film,
  Globe,
  Lock,
  Clock,
  Loader2,
  Check,
  X,
} from "lucide-react";

export default function CreatePostPage() {
  const { t } = useI18n();
  const { data: session } = useSession();
  const router = useRouter();
  const [type, setType] = useState<"PHOTO" | "VIDEO">("PHOTO");
  const [caption, setCaption] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isStory, setIsStory] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Detect type
    if (file.type.startsWith("video/")) setType("VIDEO");
    else setType("PHOTO");

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) setMediaUrl(data.url);
    setUploading(false);
  };

  const handlePublish = async () => {
    if (!mediaUrl) return;
    setPublishing(true);

    try {
      if (isStory) {
        await fetch("/api/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, mediaUrl }),
        });
      } else {
        await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, mediaUrl, caption, isPublic }),
        });
      }

      const user = session?.user as any;
      router.push(user?.nickname ? `/${user.nickname}` : "/feed");
    } catch {
      setPublishing(false);
    }
  };

  return (
    <motion.div
      className="max-w-[560px] mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1 className="text-2xl font-bold tracking-tight mb-8">{t("create", "title")}</h1>

      <div
        className="rounded-2xl p-6"
        style={{
          background: "linear-gradient(145deg, #111111, #0E0E0E)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
        }}
      >
        {/* Upload Area */}
        {!preview ? (
          <label
            className="flex flex-col items-center justify-center py-16 rounded-xl cursor-pointer transition-all group"
            style={{
              border: "2px dashed rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.015)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,175,240,0.28)";
              e.currentTarget.style.background = "rgba(0,175,240,0.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.background = "rgba(255,255,255,0.015)";
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
              style={{ background: "rgba(0,175,240,0.08)", border: "1px solid rgba(0,175,240,0.15)" }}
            >
              <Upload size={24} style={{ color: "#00AFF0" }} />
            </div>
            <span className="text-sm font-semibold text-white mb-1.5">{t("create", "upload")}</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              JPG, PNG, GIF, MP4 (max 10MB)
            </span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        ) : (
          <div className="relative rounded-xl overflow-hidden mb-5">
            {type === "PHOTO" ? (
              <img
                src={preview}
                alt=""
                className="w-full max-h-96 object-contain rounded-xl"
                style={{ background: "#0A0A0A" }}
              />
            ) : (
              <video
                src={preview}
                className="w-full max-h-96 rounded-xl"
                controls
                style={{ background: "#0A0A0A" }}
              />
            )}
            {/* Remove button */}
            <button
              onClick={() => { setPreview(null); setMediaUrl(""); }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.8)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.7)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.6)"; }}
            >
              <X size={14} />
            </button>
            {uploading && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                <Loader2 size={28} className="animate-spin" style={{ color: "#00AFF0" }} />
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Uploading...</p>
              </div>
            )}
          </div>
        )}

        {/* Type Toggle */}
        <div className="flex items-center gap-2 mt-5 mb-5">
          <TypeButton
            active={type === "PHOTO"}
            icon={<ImageIcon size={15} />}
            label={t("create", "photo")}
            onClick={() => setType("PHOTO")}
          />
          <TypeButton
            active={type === "VIDEO"}
            icon={<Film size={15} />}
            label={t("create", "video")}
            onClick={() => setType("VIDEO")}
          />
        </div>

        {/* Caption */}
        {!isStory && (
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="input-field min-h-[90px] resize-none mb-4"
            placeholder={t("create", "caption_placeholder")}
            maxLength={500}
          />
        )}

        {/* Visibility */}
        {!isStory && (
          <div className="flex items-center gap-2.5 mb-5">
            <VisibilityButton
              active={isPublic}
              icon={<Globe size={15} />}
              label={t("create", "public")}
              onClick={() => setIsPublic(true)}
            />
            <VisibilityButton
              active={!isPublic}
              icon={<Lock size={15} />}
              label={t("create", "exclusive")}
              onClick={() => setIsPublic(false)}
            />
          </div>
        )}

        {/* Story Toggle */}
        <label className="flex items-center justify-between mb-6 cursor-pointer p-4 rounded-xl transition-colors"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2.5">
            <Clock size={16} style={{ color: isStory ? "#00AFF0" : "rgba(255,255,255,0.35)" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: isStory ? "#00AFF0" : "rgba(255,255,255,0.7)" }}>
                {t("create", "story")}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Disappears after 24 hours</p>
            </div>
          </div>
          <div
            className="relative transition-all"
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: isStory ? "#00AFF0" : "rgba(255,255,255,0.1)",
              border: isStory ? "1px solid rgba(0,175,240,0.5)" : "1px solid rgba(255,255,255,0.1)",
              flexShrink: 0,
            }}
            onClick={() => setIsStory(!isStory)}
          >
            <div
              style={{
                position: "absolute",
                top: 3,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#FFFFFF",
                left: isStory ? 22 : 3,
                transition: "left 0.2s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }}
            />
          </div>
        </label>

        {/* Publish */}
        <button
          onClick={handlePublish}
          disabled={!mediaUrl || publishing || uploading}
          className="btn-primary w-full flex items-center justify-center gap-2 !py-3"
        >
          {publishing ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Check size={16} />
              {t("create", "publish")}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

function TypeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
      style={{
        background: active ? "rgba(0,175,240,0.1)" : "rgba(255,255,255,0.03)",
        border: active ? "1px solid rgba(0,175,240,0.25)" : "1px solid rgba(255,255,255,0.07)",
        color: active ? "#00AFF0" : "rgba(255,255,255,0.45)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function VisibilityButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
      style={{
        background: active ? "rgba(0,175,240,0.08)" : "rgba(255,255,255,0.03)",
        border: active ? "1px solid rgba(0,175,240,0.25)" : "1px solid rgba(255,255,255,0.07)",
        color: active ? "#00AFF0" : "rgba(255,255,255,0.45)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
