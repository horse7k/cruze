"use client";

import { useI18n, Locale } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "EN" },
  { code: "pt", label: "Português", flag: "PT" },
  { code: "es", label: "Español", flag: "ES" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = languages.find((l) => l.code === locale)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
        style={{
          color: "rgba(255,255,255,0.7)",
          background: open ? "rgba(255,255,255,0.06)" : "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#FFFFFF";
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "rgba(255,255,255,0.7)";
          e.currentTarget.style.background = open ? "rgba(255,255,255,0.06)" : "transparent";
        }}
      >
        <Globe size={16} />
        <span className="font-medium">{current.flag}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 py-1 rounded-xl min-w-[140px] z-50"
          style={{
            background: "#1A1A1A",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
                setOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors text-left"
              style={{
                color: locale === lang.code ? "#00AFF0" : "rgba(255,255,255,0.8)",
                background: locale === lang.code ? "rgba(0,175,240,0.08)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (locale !== lang.code) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  locale === lang.code ? "rgba(0,175,240,0.08)" : "transparent";
              }}
            >
              <span className="font-semibold text-xs w-6">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
