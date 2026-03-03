"use client";

import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";
import {
  Camera,
  DollarSign,
  Wallet,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Background effects */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,175,240,0.12) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute top-20 left-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(0,175,240,0.06)" }}
        />
        <div
          className="absolute top-40 right-1/4 w-56 h-56 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(123,97,255,0.05)" }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
            style={{
              background: "rgba(0,175,240,0.1)",
              border: "1px solid rgba(0,175,240,0.2)",
              color: "#00AFF0",
            }}
          >
            <Sparkles size={14} />
            Powered by Solana Blockchain
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            <span className="text-white">{t("landing", "hero_title")}</span>
            <br />
            <span className="gradient-text">{t("landing", "hero_title2")}</span>
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            {t("landing", "hero_subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="btn-primary flex items-center gap-2 text-base !py-3.5 !px-8"
            >
              {t("landing", "get_started")}
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#features"
              className="btn-outline flex items-center gap-2 text-base !py-3.5 !px-8"
            >
              {t("landing", "learn_more")}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-16 mt-16">
            <StatItem icon={<Users size={18} />} value="10K+" label="Creators" />
            <div
              className="w-px h-10"
              style={{ background: "rgba(255,255,255,0.1)" }}
            />
            <StatItem
              icon={<TrendingUp size={18} />}
              value="500K+"
              label="Subscribers"
            />
            <div
              className="w-px h-10 hidden sm:block"
              style={{ background: "rgba(255,255,255,0.1)" }}
            />
            <StatItem
              icon={<Shield size={18} />}
              value="$2M+"
              label="Paid to Creators"
              className="hidden sm:flex"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="gradient-text">monetize</span> your content
            </h2>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Powerful tools designed for creators, built for fans.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FeatureCard
              icon={<Camera size={24} />}
              title={t("landing", "feat1_title")}
              desc={t("landing", "feat1_desc")}
              gradient="linear-gradient(135deg, rgba(0,175,240,0.15), rgba(0,175,240,0.03))"
              iconBg="rgba(0,175,240,0.15)"
              iconColor="#00AFF0"
            />
            <FeatureCard
              icon={<DollarSign size={24} />}
              title={t("landing", "feat2_title")}
              desc={t("landing", "feat2_desc")}
              gradient="linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.03))"
              iconBg="rgba(34,197,94,0.15)"
              iconColor="#22C55E"
            />
            <FeatureCard
              icon={<Wallet size={24} />}
              title={t("landing", "feat3_title")}
              desc={t("landing", "feat3_desc")}
              gradient="linear-gradient(135deg, rgba(123,97,255,0.15), rgba(123,97,255,0.03))"
              iconBg="rgba(123,97,255,0.15)"
              iconColor="#7B61FF"
            />
            <FeatureCard
              icon={<Clock size={24} />}
              title={t("landing", "feat4_title")}
              desc={t("landing", "feat4_desc")}
              gradient="linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.03))"
              iconBg="rgba(245,158,11,0.15)"
              iconColor="#F59E0B"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="py-24 px-4 sm:px-6"
        style={{ background: "rgba(255,255,255,0.015)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How it <span className="gradient-text">works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Create Your Profile"
              desc="Sign up with your email or Solana wallet. Choose a unique username that becomes your personal page."
            />
            <StepCard
              number="02"
              title="Share Content"
              desc="Post photos, videos, and 24h stories. Choose what's public and what's exclusive for subscribers."
            />
            <StepCard
              number="03"
              title="Earn Money"
              desc="Set your subscription prices. Fans pay monthly, quarterly, or semi-annually to access your content."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(0,175,240,0.1) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("landing", "cta_title")}
          </h2>
          <p
            className="text-lg mb-8"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {t("landing", "cta_subtitle")}
          </p>
          <Link
            href="/signup"
            className="btn-primary inline-flex items-center gap-2 text-base !py-3.5 !px-8"
          >
            {t("landing", "cta_button")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function StatItem({
  icon,
  value,
  label,
  className = "",
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="flex items-center gap-2">
        <span style={{ color: "#00AFF0" }}>{icon}</span>
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <span
        className="text-xs font-medium"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        {label}
      </span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  gradient,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div
      className="glass-card-hover p-6 sm:p-8"
      style={{
        background: gradient,
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
        {desc}
      </p>
    </div>
  );
}

function StepCard({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-center">
      <div
        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 text-xl font-bold"
        style={{
          background: "rgba(0,175,240,0.1)",
          color: "#00AFF0",
          border: "1px solid rgba(0,175,240,0.2)",
        }}
      >
        {number}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        {desc}
      </p>
    </div>
  );
}
