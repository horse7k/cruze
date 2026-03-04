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

export default function AdminPage() {
  const { t } = useI18n();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin" style={{ color: "#FF10F0" }} />
      </div>
    );
  }

  const filtered = data.users.filter(
    (u) =>
      u.nickname?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    {
      icon: <Users size={17} />,
      label: t("admin", "total_users"),
      value: data.stats.totalUsers.toString(),
      color: "#FF10F0",
    },
    {
      icon: <Crown size={17} />,
      label: t("admin", "total_creators"),
      value: data.stats.totalCreators.toString(),
      color: "#7B61FF",
    },
    {
      icon: <CreditCard size={17} />,
      label: t("admin", "total_subs"),
      value: data.stats.totalSubscriptions.toString(),
      color: "#1db954",
    },
    {
      icon: <DollarSign size={17} />,
      label: t("admin", "total_revenue"),
      value: formatCurrency(data.stats.totalRevenue),
      color: "#f39c12",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-7"
      >
        <h1 className="text-xl font-bold text-white">{t("admin", "title")}</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8a96a3" }}>
          Platform overview and user management
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <StatCard
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              color={stat.color}
            />
          </motion.div>
        ))}
      </div>

      {/* Users Table */}
      <motion.div
        className="card overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.28 }}
      >
        {/* Table header */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <h2 className="text-[15px] font-semibold text-white">
              {t("admin", "user_management")}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#5f6b7a" }}>
              {filtered.length} users
            </p>
          </div>
          <div className="relative w-full sm:w-60">
            <Search
              size={13}
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: 14, color: "#5f6b7a" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 38, paddingTop: 9, paddingBottom: 9, fontSize: 13 }}
              placeholder={t("admin", "search")}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                <th
                  className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: "#5f6b7a" }}
                >
                  User
                </th>
                <th
                  className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: "#5f6b7a" }}
                >
                  {t("admin", "role")}
                </th>
                <th
                  className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider hidden sm:table-cell"
                  style={{ color: "#5f6b7a" }}
                >
                  {t("profile", "posts")}
                </th>
                <th
                  className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider hidden sm:table-cell"
                  style={{ color: "#5f6b7a" }}
                >
                  {t("profile", "subscribers")}
                </th>
                <th
                  className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider hidden md:table-cell"
                  style={{ color: "#5f6b7a" }}
                >
                  {t("admin", "joined")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="rounded-full overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold"
                        style={{
                          width: 32,
                          height: 32,
                          background: user.profileImage ? undefined : "rgba(255,16,240,0.1)",
                          color: "#FF10F0",
                        }}
                      >
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.nickname?.[0]?.toUpperCase() || "?"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.displayName || user.nickname || "No name"}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "#5f6b7a" }}
                        >
                          {user.email || `@${user.nickname}`}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {user.role === "ADMIN" && (
                        <span className="badge badge-amber">Admin</span>
                      )}
                      {user.isCreator && (
                        <span className="badge badge-purple">
                          {t("admin", "creator")}
                        </span>
                      )}
                      {!user.isCreator && user.role !== "ADMIN" && (
                        <span
                          className="badge"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            color: "#8a96a3",
                          }}
                        >
                          User
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <ImageIcon size={12} style={{ color: "#5f6b7a" }} />
                      <span className="text-sm" style={{ color: "#8a96a3" }}>
                        {user.postsCount}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} style={{ color: "#5f6b7a" }} />
                      <span className="text-sm" style={{ color: "#8a96a3" }}>
                        {user.subscribersCount}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-xs" style={{ color: "#5f6b7a" }}>
                      {formatDate(user.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: "#5f6b7a" }}>
                No users found
              </p>
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
      className="card p-5 transition-colors"
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#222240";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#1a1a2e";
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
        style={{ background: `${color}12`, color }}
      >
        {icon}
      </div>
      <p className="text-xs font-medium mb-1" style={{ color: "#8a96a3" }}>
        {label}
      </p>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
  );
}
