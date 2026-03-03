"use client";

import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer
      style={{
        background: "#080808",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <img
                src="/cruze.png"
                alt="CruzeFans"
                width={26}
                height={26}
                style={{ filter: "drop-shadow(0 0 5px rgba(0,175,240,0.35))" }}
              />
              <span
                className="text-[17px] font-bold tracking-tight"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                Cruze<span style={{ color: "#00AFF0" }}>Fans</span>
              </span>
            </div>
            <p
              className="text-sm leading-relaxed max-w-[300px]"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              The platform where creators share exclusive content and fans
              support their favorite artists. Powered by the Solana blockchain.
            </p>

            {/* Solana badge */}
            <div
              className="inline-flex items-center gap-2 mt-5 px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(153,69,255,0.08)",
                border: "1px solid rgba(153,69,255,0.15)",
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: "#9945FF" }} />
              <span className="text-xs font-medium" style={{ color: "rgba(153,69,255,0.9)" }}>
                Powered by Solana
              </span>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4
              className="text-xs font-semibold mb-5 uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Platform
            </h4>
            <div className="flex flex-col gap-3">
              <FooterLink href="/explore">Explore Creators</FooterLink>
              <FooterLink href="/signup">Become a Creator</FooterLink>
              <FooterLink href="/feed">Your Feed</FooterLink>
            </div>
          </div>

          {/* Legal links */}
          <div>
            <h4
              className="text-xs font-semibold mb-5 uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Legal
            </h4>
            <div className="flex flex-col gap-3">
              <FooterLink href="#">{t("footer", "terms")}</FooterLink>
              <FooterLink href="#">{t("footer", "privacy")}</FooterLink>
              <FooterLink href="#">{t("footer", "support")}</FooterLink>
            </div>
          </div>
        </div>

        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>
            &copy; {new Date().getFullYear()} CruzeFans. {t("footer", "rights")}
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.18)" }}>
              Built for creators, by creators.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm transition-all w-fit"
      style={{ color: "rgba(255,255,255,0.38)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#00AFF0";
        e.currentTarget.style.paddingLeft = "4px";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(255,255,255,0.38)";
        e.currentTarget.style.paddingLeft = "0";
      }}
    >
      {children}
    </Link>
  );
}
