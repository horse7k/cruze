"use client";

import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const pageEnter = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      variants={pageEnter}
      initial="hidden"
      animate="show"
    >
      <Navbar />

      {/* ---- HERO ---- */}
      <section className="flex-1 flex items-center justify-center px-4 sm:px-6 py-24">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.06] mb-6"
          >
            <span className="text-white">{t("landing", "hero_title")}</span>
            <br />
            <span style={{ color: "#FF10F0" }}>{t("landing", "hero_title2")}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ color: "#8a96a3" }}
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
              className="btn-primary flex items-center gap-2 text-sm !py-3 !px-7"
            >
              {t("landing", "get_started")}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="btn-outline flex items-center gap-2 text-sm !py-3 !px-7"
            >
              {t("nav", "login")}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </motion.div>
  );
}
