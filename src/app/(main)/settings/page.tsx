"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import {
  Save,
  Upload,
  Loader2,
  Check,
  User,
  Crown,
  DollarSign,
} from "lucide-react";

interface ProfileData {
  displayName: string;
  bio: string;
  profileImage: string;
  bannerImage: string;
  isCreator: boolean;
  subscriptionPlan: {
    monthlyPrice: number;
    quarterlyPrice: number;
    semiAnnualPrice: number;
  } | null;
}

export default function SettingsPage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedPlan, setSavedPlan] = useState(false);

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
    await fetch("/api/users/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio, profileImage, bannerImage, isCreator }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) setter(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin" style={{ color: "#00AFF0" }} />
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1 className="text-2xl font-bold tracking-tight mb-8">{t("settings", "title")}</h1>

      {/* Profile Section */}
      <Section icon={<User size={17} />} title={t("settings", "profile_section")}>
        <div className="space-y-5">
          <Field label={t("settings", "display_name")}>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field"
              placeholder="Your display name"
            />
          </Field>

          <Field label={t("settings", "bio")}>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field min-h-[100px] resize-none"
              placeholder="Tell us about yourself..."
              maxLength={300}
            />
            <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>
              {bio.length}/300
            </p>
          </Field>

          <Field label={t("settings", "profile_image")}>
            <div className="flex items-center gap-4">
              {profileImage && (
                <img
                  src={profileImage}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover"
                  style={{ border: "2px solid rgba(255,255,255,0.1)" }}
                />
              )}
              <label className="btn-outline text-sm cursor-pointer flex items-center gap-2">
                <Upload size={14} />
                {t("settings", "profile_image")}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, setProfileImage)}
                />
              </label>
            </div>
          </Field>

          <Field label={t("settings", "banner_image")}>
            <div className="space-y-3">
              {bannerImage && (
                <img
                  src={bannerImage}
                  alt=""
                  className="w-full h-28 rounded-xl object-cover"
                  style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                />
              )}
              <label className="btn-outline text-sm cursor-pointer inline-flex items-center gap-2">
                <Upload size={14} />
                {t("settings", "banner_image")}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, setBannerImage)}
                />
              </label>
            </div>
          </Field>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
            style={saved ? { background: "linear-gradient(135deg, #22C55E, #16A34A)" } : undefined}
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : saved ? (
              <Check size={15} />
            ) : (
              <Save size={15} />
            )}
            {saved ? t("settings", "saved") : t("settings", "save")}
          </button>
        </div>
      </Section>

      {/* Creator Section */}
      <Section
        icon={<Crown size={17} />}
        title={t("settings", "creator_section")}
        className="mt-4"
      >
        <div className="space-y-5">
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            {t("settings", "creator_desc")}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Creator mode</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                {isCreator ? "Active - your profile is visible to subscribers" : "Disabled"}
              </p>
            </div>
            {/* Toggle switch */}
            <button
              onClick={() => {
                const next = !isCreator;
                setIsCreator(next);
                fetch("/api/users/profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isCreator: next }),
                });
              }}
              className="relative transition-all"
              style={{
                width: 46,
                height: 26,
                borderRadius: 13,
                background: isCreator ? "#00AFF0" : "rgba(255,255,255,0.1)",
                border: isCreator ? "1px solid rgba(0,175,240,0.5)" : "1px solid rgba(255,255,255,0.12)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  left: isCreator ? 23 : 3,
                  transition: "left 0.2s ease",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              />
            </button>
          </div>

          {isCreator && (
            <button
              onClick={() => {
                setIsCreator(false);
                fetch("/api/users/profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isCreator: false }),
                });
              }}
              className="btn-outline text-sm"
              style={{ borderColor: "rgba(239,68,68,0.25)", color: "#EF4444" }}
            >
              {t("settings", "disable_creator")}
            </button>
          )}
          {!isCreator && (
            <button
              onClick={() => {
                setIsCreator(true);
                fetch("/api/users/profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isCreator: true }),
                });
              }}
              className="btn-primary text-sm"
            >
              {t("settings", "enable_creator")}
            </button>
          )}
        </div>
      </Section>

      {/* Subscription Plan */}
      {isCreator && (
        <Section
          icon={<DollarSign size={17} />}
          title={t("settings", "plan_section")}
          className="mt-4"
        >
          <div className="space-y-5">
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              {t("settings", "plan_desc")}
            </p>

            <Field label={t("settings", "monthly_price")}>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  $
                </span>
                <input
                  type="number"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(e.target.value)}
                  className="input-field !pl-8"
                  step="0.01"
                  min="0.99"
                />
              </div>
            </Field>

            <Field label={t("settings", "quarterly_price")}>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  $
                </span>
                <input
                  type="number"
                  value={quarterlyPrice}
                  onChange={(e) => setQuarterlyPrice(e.target.value)}
                  className="input-field !pl-8"
                  step="0.01"
                  min="0.99"
                />
              </div>
            </Field>

            <Field label={t("settings", "semi_annual_price")}>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  $
                </span>
                <input
                  type="number"
                  value={semiAnnualPrice}
                  onChange={(e) => setSemiAnnualPrice(e.target.value)}
                  className="input-field !pl-8"
                  step="0.01"
                  min="0.99"
                />
              </div>
            </Field>

            <button
              onClick={handleSavePlan}
              disabled={savingPlan}
              className="btn-primary flex items-center gap-2"
              style={savedPlan ? { background: "linear-gradient(135deg, #22C55E, #16A34A)" } : undefined}
            >
              {savingPlan ? (
                <Loader2 size={15} className="animate-spin" />
              ) : savedPlan ? (
                <Check size={15} />
              ) : (
                <Save size={15} />
              )}
              {savedPlan ? t("settings", "saved") : t("settings", "save_plan")}
            </button>
          </div>
        </Section>
      )}
    </motion.div>
  );
}

function Section({
  icon,
  title,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{
        background: "linear-gradient(145deg, #111111, #0E0E0E)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-6">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(0,175,240,0.1)", color: "#00AFF0" }}
        >
          {icon}
        </div>
        <h2 className="text-[15px] font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-xs font-semibold mb-2 uppercase tracking-wider"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
