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
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">{t("create", "title")}</h1>

      <div
        className="rounded-2xl p-6"
        style={{
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Upload Area */}
        {!preview ? (
          <label
            className="flex flex-col items-center justify-center py-16 rounded-xl cursor-pointer transition-all"
            style={{
              border: "2px dashed rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.02)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,175,240,0.3)";
              e.currentTarget.style.background = "rgba(0,175,240,0.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.background = "rgba(255,255,255,0.02)";
            }}
          >
            <Upload size={32} style={{ color: "rgba(255,255,255,0.3)" }} className="mb-3" />
            <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
              {t("create", "upload")}
            </span>
            <span className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
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
            {uploading && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.5)" }}
              >
                <Loader2 size={32} className="animate-spin" style={{ color: "#00AFF0" }} />
              </div>
            )}
          </div>
        )}

        {/* Type Toggle */}
        <div className="flex items-center gap-2 mt-5 mb-4">
          <TypeButton
            active={type === "PHOTO"}
            icon={<ImageIcon size={16} />}
            label={t("create", "photo")}
            onClick={() => setType("PHOTO")}
          />
          <TypeButton
            active={type === "VIDEO"}
            icon={<Film size={16} />}
            label={t("create", "video")}
            onClick={() => setType("VIDEO")}
          />
        </div>

        {/* Caption */}
        {!isStory && (
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="input-field min-h-[80px] resize-none mb-4"
            placeholder={t("create", "caption_placeholder")}
            maxLength={500}
          />
        )}

        {/* Visibility */}
        {!isStory && (
          <div className="flex items-center gap-3 mb-4">
            <VisibilityButton
              active={isPublic}
              icon={<Globe size={16} />}
              label={t("create", "public")}
              onClick={() => setIsPublic(true)}
            />
            <VisibilityButton
              active={!isPublic}
              icon={<Lock size={16} />}
              label={t("create", "exclusive")}
              onClick={() => setIsPublic(false)}
            />
          </div>
        )}

        {/* Story Toggle */}
        <label className="flex items-center gap-3 mb-6 cursor-pointer">
          <div
            className="w-10 h-6 rounded-full relative transition-colors"
            style={{
              background: isStory ? "#00AFF0" : "rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="w-4 h-4 rounded-full absolute top-1 transition-all"
              style={{
                background: "#FFFFFF",
                left: isStory ? "22px" : "4px",
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} style={{ color: isStory ? "#00AFF0" : "rgba(255,255,255,0.4)" }} />
            <span className="text-sm" style={{ color: isStory ? "#00AFF0" : "rgba(255,255,255,0.6)" }}>
              {t("create", "story")}
            </span>
          </div>
        </label>

        {/* Publish */}
        <button
          onClick={handlePublish}
          disabled={!mediaUrl || publishing || uploading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {publishing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Check size={16} />
              {t("create", "publish")}
            </>
          )}
        </button>
      </div>
    </div>
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
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
      style={{
        background: active ? "rgba(0,175,240,0.1)" : "transparent",
        border: active ? "1px solid rgba(0,175,240,0.3)" : "1px solid rgba(255,255,255,0.08)",
        color: active ? "#00AFF0" : "rgba(255,255,255,0.5)",
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
        border: active ? "1px solid rgba(0,175,240,0.3)" : "1px solid rgba(255,255,255,0.07)",
        color: active ? "#00AFF0" : "rgba(255,255,255,0.5)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
