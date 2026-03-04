"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
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

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

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
    <div className="max-w-[560px] mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-white mb-8">{t("create", "title")}</h1>

      {/* Upload Area / Preview */}
      {!preview ? (
        <label
          className="flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all group"
          style={{
            padding: "72px 24px",
            border: "2px dashed rgba(255,255,255,0.08)",
            background: "rgba(26,26,46,0.4)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,16,240,0.3)";
            e.currentTarget.style.background = "rgba(255,16,240,0.03)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            e.currentTarget.style.background = "rgba(26,26,46,0.4)";
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(255,16,240,0.08)", color: "#FF10F0" }}
          >
            <Upload size={28} />
          </div>
          <span className="text-base font-semibold text-white mb-1">
            Drop your file here or click to browse
          </span>
          <span className="text-sm" style={{ color: "#5f6b7a" }}>
            JPG, PNG, GIF, MP4 — up to 10MB
          </span>
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      ) : (
        <div className="relative rounded-2xl overflow-hidden mb-2">
          {type === "PHOTO" ? (
            <img
              src={preview}
              alt=""
              className="w-full h-auto block"
              style={{ maxHeight: 480, objectFit: "contain", background: "#0d0d1a", borderRadius: 16 }}
            />
          ) : (
            <video
              src={preview}
              className="w-full"
              style={{ maxHeight: 480, background: "#0d0d1a", borderRadius: 16 }}
              controls
            />
          )}
          <button
            onClick={() => { setPreview(null); setMediaUrl(""); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(0,0,0,0.65)", color: "rgba(255,255,255,0.8)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(231,76,60,0.8)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.65)"; }}
          >
            <X size={14} />
          </button>
          {uploading && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ background: "rgba(0,0,0,0.65)", borderRadius: 16 }}
            >
              <Loader2 size={28} className="animate-spin" style={{ color: "#FF10F0" }} />
              <p className="text-sm" style={{ color: "#8a96a3" }}>Uploading...</p>
            </div>
          )}
        </div>
      )}

      {/* Controls — only show after upload */}
      {preview && (
        <div className="mt-6 space-y-5">
          {/* Type toggle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setType("PHOTO")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                background: type === "PHOTO" ? "rgba(255,16,240,0.1)" : "transparent",
                color: type === "PHOTO" ? "#FF10F0" : "#5f6b7a",
              }}
            >
              <ImageIcon size={14} />
              {t("create", "photo")}
            </button>
            <button
              onClick={() => setType("VIDEO")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                background: type === "VIDEO" ? "rgba(255,16,240,0.1)" : "transparent",
                color: type === "VIDEO" ? "#FF10F0" : "#5f6b7a",
              }}
            >
              <Film size={14} />
              {t("create", "video")}
            </button>
          </div>

          {/* Caption */}
          {!isStory && (
            <div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="input-field"
                style={{ minHeight: 100, resize: "none", fontSize: 15 }}
                placeholder={t("create", "caption_placeholder")}
                maxLength={500}
              />
              <p className="text-xs text-right mt-1.5" style={{ color: "#5f6b7a" }}>
                {caption.length}/500
              </p>
            </div>
          )}

          {/* Visibility */}
          {!isStory && (
            <div
              className="flex rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <button
                onClick={() => setIsPublic(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors"
                style={{
                  background: isPublic ? "rgba(255,16,240,0.08)" : "transparent",
                  color: isPublic ? "#FF10F0" : "#5f6b7a",
                }}
              >
                <Globe size={14} />
                {t("create", "public")}
              </button>
              <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
              <button
                onClick={() => setIsPublic(false)}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors"
                style={{
                  background: !isPublic ? "rgba(255,16,240,0.08)" : "transparent",
                  color: !isPublic ? "#FF10F0" : "#5f6b7a",
                }}
              >
                <Lock size={14} />
                {t("create", "exclusive")}
              </button>
            </div>
          )}

          {/* Story toggle */}
          <div
            className="flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-colors"
            style={{
              background: isStory ? "rgba(255,16,240,0.04)" : "transparent",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            onClick={() => setIsStory(!isStory)}
          >
            <div className="flex items-center gap-3">
              <Clock
                size={16}
                style={{ color: isStory ? "#FF10F0" : "#5f6b7a" }}
              />
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: isStory ? "#FF10F0" : "#e8e8e8" }}
                >
                  {t("create", "story")}
                </p>
                <p className="text-xs" style={{ color: "#5f6b7a" }}>
                  Disappears after 24 hours
                </p>
              </div>
            </div>
            <div
              style={{
                position: "relative",
                width: 44,
                height: 24,
                borderRadius: 12,
                background: isStory ? "#FF10F0" : "rgba(255,255,255,0.1)",
                border: isStory
                  ? "1px solid rgba(255,16,240,0.4)"
                  : "1px solid rgba(255,255,255,0.1)",
                flexShrink: 0,
                transition: "background 0.18s ease",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#fff",
                  left: isStory ? 22 : 3,
                  transition: "left 0.18s ease",
                }}
              />
            </div>
          </div>

          {/* Publish */}
          <button
            onClick={handlePublish}
            disabled={!mediaUrl || publishing || uploading}
            className="btn-primary w-full flex items-center justify-center gap-2"
            style={{ paddingTop: 14, paddingBottom: 14, fontSize: 15 }}
          >
            {publishing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
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
      )}
    </div>
  );
}
