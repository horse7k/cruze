"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Users,
  FileText,
  Share2,
  Loader2,
  Copy,
  Check,
  TrendingUp,
} from "lucide-react";

interface DashboardData {
  totalEarnings: number;
  subscriberCount: number;
  postsCount: number;
  referralCount: number;
  referralEarnings: number;
  referralCode: string | null;
  recentSubscribers: Array<{
    nickname: string;
    displayName: string | null;
    profileImage: string | null;
    planType: string;
    amount: number;
    endDate: string;
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const user = session?.user as any;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!user?.isCreator) {
      router.push("/feed");
      return;
    }
    fetch("/api/creator/dashboard")
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status, user, router]);

  const generateReferralCode = async () => {
    setGeneratingCode(true);
    const res = await fetch("/api/creator/referral", { method: "POST" });
    if (res.ok) {
      const { referralCode } = await res.json();
      setData((prev) => prev ? { ...prev, referralCode } : prev);
    }
    setGeneratingCode(false);
  };

  const copyReferralLink = () => {
    if (!data?.referralCode) return;
    const url = `${window.location.origin}/signup?ref=${data.referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin" style={{ color: "#FF10F0" }} />
      </div>
    );
  }

  if (!data) return null;

  const formatMoney = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(255,16,240,0.08)", color: "#FF10F0" }}
        >
          <TrendingUp size={18} />
        </div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={<DollarSign size={18} />}
          label="Earnings"
          value={formatMoney(data.totalEarnings)}
          color="#1db954"
        />
        <StatCard
          icon={<Users size={18} />}
          label="Subscribers"
          value={data.subscriberCount.toString()}
          color="#FF10F0"
        />
        <StatCard
          icon={<FileText size={18} />}
          label="Posts"
          value={data.postsCount.toString()}
          color="#7B61FF"
        />
        <StatCard
          icon={<Share2 size={18} />}
          label="Referral Earnings"
          value={formatMoney(data.referralEarnings)}
          sublabel={`${data.referralCount} referrals`}
          color="#f39c12"
        />
      </div>

      {/* Referral Section */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <h2 className="text-[15px] font-semibold text-white mb-1">Referral Program</h2>
        <p className="text-xs mb-4" style={{ color: "#5f6b7a" }}>
          Earn 1% commission on all subscriptions from referred users
        </p>

        {data.referralCode ? (
          <div className="flex items-center gap-2">
            <div
              className="flex-1 px-3 py-2.5 rounded-lg text-sm font-mono truncate"
              style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.08)", color: "#e8e8e8" }}
            >
              {`${typeof window !== "undefined" ? window.location.origin : ""}/signup?ref=${data.referralCode}`}
            </div>
            <button
              onClick={copyReferralLink}
              className="p-2.5 rounded-lg transition-colors shrink-0"
              style={{
                background: copied ? "rgba(29,185,84,0.15)" : "rgba(255,16,240,0.1)",
                color: copied ? "#1db954" : "#FF10F0",
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        ) : (
          <button
            onClick={generateReferralCode}
            disabled={generatingCode}
            className="btn-primary text-sm flex items-center gap-2"
          >
            {generatingCode ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
            Generate referral link
          </button>
        )}
      </div>

      {/* Recent Subscribers */}
      {data.recentSubscribers.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="px-5 py-4">
            <h2 className="text-[15px] font-semibold text-white">Recent Subscribers</h2>
          </div>
          <div>
            {data.recentSubscribers.map((sub, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full overflow-hidden shrink-0"
                    style={{ background: "#12121f" }}
                  >
                    {sub.profileImage ? (
                      <img src={sub.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-[10px] font-bold"
                        style={{ color: "#FF10F0" }}
                      >
                        {(sub.nickname || "?")[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {sub.displayName || sub.nickname}
                    </p>
                    <p className="text-[11px]" style={{ color: "#5f6b7a" }}>
                      {sub.planType.replace("_", " ").toLowerCase()}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-white">{formatMoney(sub.amount)}</p>
                  <p className="text-[11px]" style={{ color: "#5f6b7a" }}>
                    expires {new Date(sub.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
        style={{ background: `${color}15`, color }}
      >
        {icon}
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs mt-0.5" style={{ color: "#5f6b7a" }}>{label}</p>
      {sublabel && (
        <p className="text-[10px] mt-0.5" style={{ color: "#5f6b7a" }}>{sublabel}</p>
      )}
    </div>
  );
}
