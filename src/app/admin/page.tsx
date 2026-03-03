"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/utils";
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
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin" style={{ color: "#00AFF0" }} />
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
      <h1 className="text-2xl font-bold mb-8">{t("admin", "title")}</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users size={20} />}
          label={t("admin", "total_users")}
          value={data.stats.totalUsers.toString()}
          color="#00AFF0"
        />
        <StatCard
          icon={<Crown size={20} />}
          label={t("admin", "total_creators")}
          value={data.stats.totalCreators.toString()}
          color="#7B61FF"
        />
        <StatCard
          icon={<CreditCard size={20} />}
          label={t("admin", "total_subs")}
          value={data.stats.totalSubscriptions.toString()}
          color="#22C55E"
        />
        <StatCard
          icon={<DollarSign size={20} />}
          label={t("admin", "total_revenue")}
          value={formatCurrency(data.stats.totalRevenue)}
          color="#F59E0B"
        />
      </div>

      {/* User Management */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
          <h2 className="text-lg font-semibold">{t("admin", "user_management")}</h2>
          <div className="relative w-full sm:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "rgba(255,255,255,0.3)" }}
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
                }}
              >
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
                  User
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {t("admin", "role")}
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold hidden sm:table-cell" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {t("profile", "posts")}
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold hidden sm:table-cell" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {t("profile", "subscribers")}
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold hidden md:table-cell" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {t("admin", "joined")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
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
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden"
                        style={{
                          background: user.profileImage ? undefined : "rgba(0,175,240,0.15)",
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
                        <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {user.email || `@${user.nickname}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {user.role === "ADMIN" && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}
                        >
                          Admin
                        </span>
                      )}
                      {user.isCreator && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "rgba(123,97,255,0.15)", color: "#A78BFA" }}
                        >
                          {t("admin", "creator")}
                        </span>
                      )}
                      {!user.isCreator && user.role !== "ADMIN" && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
                        >
                          User
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <ImageIcon size={14} style={{ color: "rgba(255,255,255,0.25)" }} />
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {user.postsCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} style={{ color: "rgba(255,255,255,0.25)" }} />
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {user.subscribersCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {formatDate(user.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
      className="rounded-2xl p-5"
      style={{
        background: "#141414",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}15`, color }}
      >
        {icon}
      </div>
      <p
        className="text-xs font-medium mb-1"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        {label}
      </p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
