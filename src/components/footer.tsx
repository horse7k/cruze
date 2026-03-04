"use client";

import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer
      style={{
        background: "#000",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <img src="/cruze.png" alt="CruzeFans" width={26} height={26} />
              <span className="text-[16px] font-bold text-white">
                Cruze<span style={{ color: "#FF10F0" }}>Fans</span>
              </span>
            </Link>

            <p
              className="text-sm leading-relaxed max-w-[280px]"
              style={{ color: "#5f6b7a" }}
            >
              The platform where creators share exclusive content and fans support
              their favorite artists.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h4
              className="text-xs font-semibold mb-4 uppercase tracking-widest"
              style={{ color: "#5f6b7a" }}
            >
              Platform
            </h4>
            <div className="flex flex-col gap-2.5">
              <FooterLink href="/explore">Explore Creators</FooterLink>
              <FooterLink href="/signup">Become a Creator</FooterLink>
              <FooterLink href="/feed">Your Feed</FooterLink>
            </div>
          </div>

          {/* Legal links */}
          <div>
            <h4
              className="text-xs font-semibold mb-4 uppercase tracking-widest"
              style={{ color: "#5f6b7a" }}
            >
              Legal
            </h4>
            <div className="flex flex-col gap-2.5">
              <FooterLink href="#">{t("footer", "terms")}</FooterLink>
              <FooterLink href="#">{t("footer", "privacy")}</FooterLink>
              <FooterLink href="#">{t("footer", "support")}</FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs" style={{ color: "#5f6b7a" }}>
            &copy; {new Date().getFullYear()} CruzeFans. {t("footer", "rights")}
          </p>
          <span className="text-xs" style={{ color: "#5f6b7a" }}>
            Built for creators, by creators.
          </span>
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
      className="text-sm w-fit transition-colors"
      style={{ color: "#8a96a3" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#FF10F0";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#8a96a3";
      }}
    >
      {children}
    </Link>
  );
}
