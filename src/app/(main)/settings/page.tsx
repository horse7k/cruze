"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import {
  Save,
  Upload,
  Loader2,
  Check,
  Camera,
  Crown,
  DollarSign,
} from "lucide-react";

export default function SettingsPage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedPlan, setSavedPlan] = useState(false);
  const [error, setError] = useState("");
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState("9.99");
  const [quarterlyPrice, setQuarterlyPrice] = useState("24.99");
  const [semiAnnualPrice, setSemiAnnualPrice] = useState("44.99");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((data) => {
        setDisplayName(data.displayName || "");
        setBio(data.bio || "");
        setProfileImage(data.profileImage || "");
        setBannerImage(data.bannerImage || "");
        setIsCreator(data.isCreator);
        if (data.subscriptionPlan) {
          setMonthlyPrice(data.subscriptionPlan.monthlyPrice.toString());
          setQuarterlyPrice(data.subscriptionPlan.quarterlyPrice.toString());
          setSemiAnnualPrice(data.subscriptionPlan.semiAnnualPrice.toString());
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url;
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, profileImage, bannerImage, isCreator }),
      });
      if (!res.ok) {
        setError("Failed to save profile");
        setSaving(false);
        return;
      }
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Failed to save profile");
      setSaving(false);
    }
  };

  const handleSavePlan = async () => {
    setSavingPlan(true);
    setSavedPlan(false);
    await fetch("/api/subscriptions/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthlyPrice, quarterlyPrice, semiAnnualPrice }),
    });
    setSavingPlan(false);
    setSavedPlan(true);
    setTimeout(() => setSavedPlan(false), 2000);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    type: "profile" | "banner"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large (max 5MB)");
      return;
    }
    setError("");
    if (type === "profile") setUploadingProfile(true);
    else setUploadingBanner(true);
    try {
      const url = await uploadFile(file);
      if (url) setter(url);
      else setError("Upload failed");
    } catch {
      setError("Upload failed");
    }
    if (type === "profile") setUploadingProfile(false);
    else setUploadingBanner(false);
  };

  const toggleCreator = (next: boolean) => {
    setIsCreator(next);
    fetch("/api/users/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCreator: next }),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin" style={{ color: "#FF10F0" }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-white mb-6">{t("settings", "title")}</h1>

      {/* ---- VISUAL PROFILE HEADER ---- */}
      <div className="rounded-2xl overflow-hidden mb-6" style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Banner — clickable */}
        <label className="block relative cursor-pointer group" style={{ height: 140 }}>
          <div
            className="w-full h-full"
            style={{ background: bannerImage ? undefined : "linear-gradient(135deg, #1a1a2e, #222240)" }}
          >
            {bannerImage && (
              <img src={bannerImage} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            {uploadingBanner ? (
              <Loader2 size={20} className="animate-spin" style={{ color: "#fff" }} />
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Camera size={16} />
                Change banner
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e, setBannerImage, "banner")}
            disabled={uploadingBanner}
          />
        </label>

        {/* Avatar — overlaid on banner */}
        <div className="px-5" style={{ marginTop: -36 }}>
          <label className="relative inline-block cursor-pointer group">
            <div
              className="rounded-full overflow-hidden"
              style={{
                width: 72,
                height: 72,
                border: "3px solid #1a1a2e",
                background: "#12121f",
              }}
            >
              {profileImage ? (
                <img src={profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-xl font-bold"
                  style={{ color: "#FF10F0" }}
                >
                  {displayName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              {uploadingProfile ? (
                <Loader2 size={16} className="animate-spin" style={{ color: "#fff" }} />
              ) : (
                <Camera size={16} style={{ color: "#fff" }} />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, setProfileImage, "profile")}
              disabled={uploadingProfile}
            />
          </label>
        </div>

        {/* Name / Bio fields */}
        <div className="px-5 pt-4 pb-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#5f6b7a" }}>
              {t("settings", "display_name")}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field"
              placeholder="Your display name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#5f6b7a" }}>
              {t("settings", "bio")}
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field"
              style={{ minHeight: 88, resize: "none" }}
              placeholder="Tell us about yourself..."
              maxLength={300}
            />
            <p className="text-xs text-right mt-1" style={{ color: "#5f6b7a" }}>
              {bio.length}/300
            </p>
          </div>

          {/* Save profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
              style={saved ? { background: "#1db954" } : undefined}
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : saved ? (
                <Check size={14} />
              ) : (
                <Save size={14} />
              )}
              {saved ? t("settings", "saved") : t("settings", "save")}
            </button>

            {error && (
              <span className="text-sm" style={{ color: "#e74c3c" }}>{error}</span>
            )}
          </div>
        </div>
      </div>

      {/* ---- CREATOR MODE ---- */}
      <div
        className="rounded-xl px-5 py-4 mb-4 flex items-center justify-between"
        style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <Crown size={16} style={{ color: isCreator ? "#FF10F0" : "#5f6b7a" }} />
          <div>
            <p className="text-sm font-semibold text-white">Creator mode</p>
            <p className="text-xs mt-0.5" style={{ color: "#5f6b7a" }}>
              {isCreator ? "Active — visible to subscribers" : "Enable to start creating content"}
            </p>
          </div>
        </div>
        <button
          onClick={() => toggleCreator(!isCreator)}
          aria-label="Toggle creator mode"
          style={{
            position: "relative",
            width: 44,
            height: 24,
            borderRadius: 12,
            background: isCreator ? "#FF10F0" : "rgba(255,255,255,0.1)",
            border: isCreator
              ? "1px solid rgba(255,16,240,0.4)"
              : "1px solid rgba(255,255,255,0.12)",
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
              left: isCreator ? 22 : 3,
              transition: "left 0.18s ease",
            }}
          />
        </button>
      </div>

      {/* ---- SUBSCRIPTION PRICING ---- */}
      {isCreator && (
        <div
          className="rounded-xl p-5"
          style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <DollarSign size={16} style={{ color: "#FF10F0" }} />
            <h2 className="text-[15px] font-semibold text-white">{t("settings", "plan_section")}</h2>
          </div>

          <p className="text-sm mb-5" style={{ color: "#5f6b7a" }}>
            {t("settings", "plan_desc")}
          </p>

          {/* Price grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <PriceInput
              label={t("settings", "monthly_price")}
              value={monthlyPrice}
              onChange={setMonthlyPrice}
            />
            <PriceInput
              label={t("settings", "quarterly_price")}
              value={quarterlyPrice}
              onChange={setQuarterlyPrice}
            />
            <PriceInput
              label={t("settings", "semi_annual_price")}
              value={semiAnnualPrice}
              onChange={setSemiAnnualPrice}
            />
          </div>

          <button
            onClick={handleSavePlan}
            disabled={savingPlan}
            className="btn-primary flex items-center gap-2"
            style={savedPlan ? { background: "#1db954" } : undefined}
          >
            {savingPlan ? (
              <Loader2 size={14} className="animate-spin" />
            ) : savedPlan ? (
              <Check size={14} />
            ) : (
              <Save size={14} />
            )}
            {savedPlan ? t("settings", "saved") : t("settings", "save_plan")}
          </button>
        </div>
      )}
    </div>
  );
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#5f6b7a" }}>
        {label}
      </label>
      <div className="relative">
        <span
          className="absolute top-1/2 -translate-y-1/2 text-sm font-medium"
          style={{ left: 12, color: "#5f6b7a" }}
        >
          $
        </span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
          style={{ paddingLeft: 28 }}
          step="0.01"
          min="0.99"
        />
      </div>
    </div>
  );
}
