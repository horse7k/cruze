"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Users,
  Crown,
  CreditCard,
  DollarSign,
  Search,
  ImageIcon,
  Loader2,
  TrendingUp,
} from "lucide-react";

interface AdminData {
  stats: {
    totalUsers: number;
    totalCreators: number;
    totalSubscriptions: number;
    totalRevenue: number;
  };
  users: Array<{
    id: string;
    email: string | null;
    nickname: string | null;
    displayName: string | null;
    profileImage: string | null;
    role: string;
    isCreator: boolean;
    createdAt: string;
    postsCount: number;
    subscribersCount: number;
  }>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const, delay: i * 0.07 },
  }),
};

export default function AdminPage() {
  const { t } = useI18n();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin" style={{ color: "#00AFF0" }} />
      </div>
    );
  }

  const filtered = data.users.filter(
    (u) =>
      u.nickname?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold tracking-tight">{t("admin", "title")}</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.38)" }}>
          Platform overview and user management
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { icon: <Users size={18} />, label: t("admin", "total_users"), value: data.stats.totalUsers.toString(), color: "#00AFF0", index: 0 },
          { icon: <Crown size={18} />, label: t("admin", "total_creators"), value: data.stats.totalCreators.toString(), color: "#7B61FF", index: 1 },
          { icon: <CreditCard size={18} />, label: t("admin", "total_subs"), value: data.stats.totalSubscriptions.toString(), color: "#22C55E", index: 2 },
          { icon: <DollarSign size={18} />, label: t("admin", "total_revenue"), value: formatCurrency(data.stats.totalRevenue), color: "#F59E0B", index: 3 },
        ].map((stat) => (
          <motion.div key={stat.label} custom={stat.index} variants={cardVariants} initial="hidden" animate="show">
            <StatCard icon={stat.icon} label={stat.label} value={stat.value} color={stat.color} />
          </motion.div>
        ))}
      </div>

      {/* User Management Table */}
      <motion.div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #111111, #0E0E0E)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5">
          <div>
            <h2 className="text-[15px] font-semibold text-white">{t("admin", "user_management")}</h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              {filtered.length} users
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "rgba(255,255,255,0.25)" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field !pl-10 !py-2 !text-sm"
              placeholder={t("admin", "search")}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(255,255,255,0.015)",
                }}
              >
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>
                  User
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {t("admin", "role")}
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {t("profile", "posts")}
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {t("profile", "subscribers")}
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {t("admin", "joined")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => (
                <tr
                  key={user.id}
                  className="transition-colors"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden"
                        style={{
                          background: user.profileImage ? undefined : "linear-gradient(135deg, rgba(0,175,240,0.2), rgba(123,97,255,0.2))",
                          color: "#00AFF0",
                        }}
                      >
                        {user.profileImage ? (
                          <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          user.nickname?.[0]?.toUpperCase() || "?"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.displayName || user.nickname || "No name"}
                        </p>
                        <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {user.email || `@${user.nickname}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {user.role === "ADMIN" && (
                        <span
                          className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.15)" }}
                        >
                          Admin
                        </span>
                      )}
                      {user.isCreator && (
                        <span
                          className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(123,97,255,0.12)", color: "#A78BFA", border: "1px solid rgba(123,97,255,0.15)" }}
                        >
                          {t("admin", "creator")}
                        </span>
                      )}
                      {!user.isCreator && user.role !== "ADMIN" && (
                        <span
                          className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          User
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <ImageIcon size={13} style={{ color: "rgba(255,255,255,0.22)" }} />
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                        {user.postsCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Users size={13} style={{ color: "rgba(255,255,255,0.22)" }} />
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                        {user.subscribersCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {formatDate(user.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No users found</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 transition-all"
      style={{
        background: "linear-gradient(145deg, #111111, #0E0E0E)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}25`;
        e.currentTarget.style.boxShadow = `0 2px 12px rgba(0,0,0,0.25), 0 0 20px ${color}08`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.25)";
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${color}10`, color, border: `1px solid ${color}18` }}
      >
        {icon}
      </div>
      <p className="text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.38)" }}>
        {label}
      </p>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
  );
}
