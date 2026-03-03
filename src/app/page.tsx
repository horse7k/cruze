"use client";

import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";
import { motion } from "framer-motion";
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
  Check,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ---- HERO ---- */}
      <section className="relative pt-36 pb-28 px-4 sm:px-6 overflow-hidden">

        {/* Background gradient mesh */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 100% 60% at 50% -5%, rgba(0,175,240,0.14) 0%, transparent 55%)",
          }}
        />
        {/* Purple blob */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "5%",
            right: "15%",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(123,97,255,0.09) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        {/* Cyan blob left */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "10%",
            left: "8%",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,175,240,0.07) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            mask: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
            WebkitMask: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
          }}
        />

        <motion.div
          className="relative max-w-5xl mx-auto text-center"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="flex justify-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: "rgba(0,175,240,0.08)",
                border: "1px solid rgba(0,175,240,0.18)",
                color: "#00AFF0",
              }}
            >
              <Sparkles size={13} />
              Powered by Solana Blockchain
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-[82px] font-extrabold tracking-[-0.03em] leading-[1.05] mb-7"
          >
            <span className="text-white">{t("landing", "hero_title")}</span>
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #00AFF0 0%, #7B61FF 55%, #A855F7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("landing", "hero_title2")}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-11 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {t("landing", "hero_subtitle")}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/signup"
              className="btn-primary flex items-center gap-2 text-[15px] !py-3.5 !px-8"
            >
              {t("landing", "get_started")}
              <ArrowRight size={17} />
            </Link>
            <Link
              href="#features"
              className="btn-outline flex items-center gap-2 text-[15px] !py-3.5 !px-8"
            >
              {t("landing", "learn_more")}
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-8 sm:gap-16 mt-20"
          >
            <StatItem icon={<Users size={16} />} value="10K+" label="Creators" />
            <div className="w-px h-10" style={{ background: "rgba(255,255,255,0.08)" }} />
            <StatItem icon={<TrendingUp size={16} />} value="500K+" label="Subscribers" />
            <div className="w-px h-10 hidden sm:block" style={{ background: "rgba(255,255,255,0.08)" }} />
            <StatItem
              icon={<Shield size={16} />}
              value="$2M+"
              label="Paid to Creators"
              className="hidden sm:flex"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ---- FEATURES ---- */}
      <section id="features" className="py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-18"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#00AFF0" }}>
              Platform Features
            </p>
            <h2 className="text-3xl sm:text-[42px] font-bold tracking-tight leading-[1.15] mb-5">
              Everything you need to{" "}
              <span className="gradient-text">monetize</span> your content
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
              Powerful tools designed for creators, built for fans.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <FeatureCard
              icon={<Camera size={22} />}
              title={t("landing", "feat1_title")}
              desc={t("landing", "feat1_desc")}
              accentColor="#00AFF0"
              checks={["Photo & video support", "24h stories", "Content scheduling"]}
            />
            <FeatureCard
              icon={<DollarSign size={22} />}
              title={t("landing", "feat2_title")}
              desc={t("landing", "feat2_desc")}
              accentColor="#22C55E"
              checks={["Keep 95% of revenue", "Instant payouts", "No chargebacks"]}
            />
            <FeatureCard
              icon={<Wallet size={22} />}
              title={t("landing", "feat3_title")}
              desc={t("landing", "feat3_desc")}
              accentColor="#7B61FF"
              checks={["Solana wallet login", "On-chain payments", "Full transparency"]}
            />
            <FeatureCard
              icon={<Clock size={22} />}
              title={t("landing", "feat4_title")}
              desc={t("landing", "feat4_desc")}
              accentColor="#F59E0B"
              checks={["Flexible tiers", "Quarterly discounts", "Auto-renewal"]}
            />
          </motion.div>
        </div>
      </section>

      {/* ---- HOW IT WORKS ---- */}
      <section
        className="py-28 px-4 sm:px-6 relative overflow-hidden"
        style={{ background: "rgba(255,255,255,0.012)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(0,175,240,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(123,97,255,0.05) 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-18"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#7B61FF" }}>
              Get Started in Minutes
            </p>
            <h2 className="text-3xl sm:text-[42px] font-bold tracking-tight leading-[1.15]">
              How it <span className="gradient-text">works</span>
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <StepCard
              number="01"
              title="Create Your Profile"
              desc="Sign up with your email or Solana wallet. Choose a unique username that becomes your personal page."
            />
            <StepCard
              number="02"
              title="Share Content"
              desc="Post photos, videos, and 24h stories. Choose what is public and what is exclusive for subscribers."
            />
            <StepCard
              number="03"
              title="Earn Money"
              desc="Set your subscription prices. Fans pay monthly, quarterly, or semi-annually to access your content."
            />
          </motion.div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="py-32 px-4 sm:px-6 relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(0,175,240,0.1) 0%, transparent 55%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            mask: "radial-gradient(ellipse 70% 50% at 50% 100%, black, transparent)",
            WebkitMask: "radial-gradient(ellipse 70% 50% at 50% 100%, black, transparent)",
          }}
        />

        <motion.div
          className="relative max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{
              background: "rgba(123,97,255,0.1)",
              border: "1px solid rgba(123,97,255,0.2)",
              color: "#A78BFA",
            }}
          >
            <Sparkles size={13} />
            Join 10,000+ creators today
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
            {t("landing", "cta_title")}
          </h2>
          <p
            className="text-lg mb-10 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            {t("landing", "cta_subtitle")}
          </p>
          <Link
            href="/signup"
            className="btn-primary inline-flex items-center gap-2 text-[15px] !py-3.5 !px-9"
          >
            {t("landing", "cta_button")}
            <ArrowRight size={17} />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

/* ---- Sub-components ---- */

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
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-2">
        <span style={{ color: "#00AFF0" }}>{icon}</span>
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
      </div>
      <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
        {label}
      </span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  accentColor,
  checks,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accentColor: string;
  checks: string[];
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="glass-card-hover p-7 group"
      style={{
        background: `linear-gradient(145deg, rgba(17,17,17,0.98) 0%, rgba(14,14,14,0.95) 100%)`,
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
        style={{
          background: `${accentColor}12`,
          color: accentColor,
          border: `1px solid ${accentColor}20`,
        }}
      >
        {icon}
      </div>
      <h3 className="text-[17px] font-semibold text-white mb-2.5">{title}</h3>
      <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.48)" }}>
        {desc}
      </p>
      <ul className="space-y-2">
        {checks.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            <Check size={13} style={{ color: accentColor, flexShrink: 0 }} />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
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
    <motion.div
      variants={fadeUp}
      className="relative glass-card p-7 text-left"
    >
      {/* Number badge */}
      <div
        className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 text-base font-bold"
        style={{
          background: "rgba(0,175,240,0.08)",
          color: "#00AFF0",
          border: "1px solid rgba(0,175,240,0.18)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {number}
      </div>
      {/* Connector line (except last) */}
      <div
        className="absolute top-[52px] left-[calc(50%+24px)] h-px hidden md:block"
        style={{
          width: "calc(100% - 24px)",
          background: "linear-gradient(90deg, rgba(0,175,240,0.2), transparent)",
        }}
      />
      <h3 className="text-base font-semibold text-white mb-2.5">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
        {desc}
      </p>
    </motion.div>
  );
}
