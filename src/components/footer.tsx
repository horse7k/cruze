"use client";

import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer
      style={{
        background: "#080808",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/cruze.png" alt="CruzeFans" width={28} height={28} />
              <span className="text-lg font-bold">
                Cruze<span style={{ color: "#00AFF0" }}>Fans</span>
              </span>
            </div>
            <p
              className="text-sm leading-relaxed max-w-sm"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              The platform where creators share exclusive content and fans
              support their favorite artists. Built with the power of Solana.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4
              className="text-sm font-semibold mb-4 uppercase tracking-wider"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Platform
            </h4>
            <div className="flex flex-col gap-2.5">
              <FooterLink href="/explore">Explore</FooterLink>
              <FooterLink href="/signup">Become a Creator</FooterLink>
              <FooterLink href="/feed">Feed</FooterLink>
            </div>
          </div>

          <div>
            <h4
              className="text-sm font-semibold mb-4 uppercase tracking-wider"
              style={{ color: "rgba(255,255,255,0.5)" }}
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

        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            &copy; {new Date().getFullYear()} CruzeFans. {t("footer", "rights")}
          </p>
          <div className="flex items-center gap-4">
            <span
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              Powered by Solana
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
      className="text-sm transition-colors"
      style={{ color: "rgba(255,255,255,0.45)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#00AFF0";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(255,255,255,0.45)";
      }}
    >
      {children}
    </Link>
  );
}
