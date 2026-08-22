import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  HelpCircle,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  PieChart,
  Wallet,
  Sparkles,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getAiInsights, type InsightCard } from "../api/aiService";

// ─── Insight Card Component ───────────────────────────────────────────────────
const InsightCardUI: React.FC<{ card: InsightCard }> = ({ card }) => {
  if (card.type === "alert-warning") {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex gap-4 col-span-1 lg:col-span-1">
        <div className="w-10 h-10 bg-sky-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <TrendingUp size={20} className="text-sky-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
              ALERT
            </span>
            <h3 className="font-semibold text-gray-900 text-sm">{card.title}</h3>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{card.body}</p>
          {card.actionLabel && (
            <button className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition">
              {card.actionLabel} →
            </button>
          )}
        </div>
      </div>
    );
  }

  if (card.type === "alert-overdue") {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex gap-4">
        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base leading-tight">{card.title}</h3>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{card.body}</p>
          {card.actionLabel && (
            <button className="mt-3 text-sm font-semibold text-gray-800 border border-gray-200 hover:bg-gray-50 px-4 py-1.5 rounded-lg transition">
              {card.actionLabel}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (card.type === "category") {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex gap-4">
        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <PieChart size={20} className="text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{card.title}</h3>
          {card.subtitle && (
            <p className="text-sm font-medium text-gray-700 mt-1">{card.subtitle}</p>
          )}
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{card.body}</p>
        </div>
      </div>
    );
  }

  if (card.type === "cashflow") {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex gap-4">
        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <Wallet size={20} className="text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{card.title}</h3>
          {card.subtitle && (
            <p className="text-sm font-semibold text-emerald-600 mt-1">{card.subtitle}</p>
          )}
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{card.body}</p>
        </div>
      </div>
    );
  }

  // processing placeholder
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center gap-3 text-center min-h-[160px]">
      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
        <Sparkles size={22} className="text-gray-400 animate-pulse" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{card.title}</p>
      <p className="text-sm text-gray-400">{card.body}</p>
    </div>
  );
};

const AIInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<string>("");

  const fetchInsights = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await getAiInsights();
      setInsights(data.insights);

      const d = data.generatedAt ? new Date(data.generatedAt) : new Date();
      setLastAnalysis(
        `Today, ${d.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`
      );
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message || "Failed to load dynamic AI insights.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleRefresh = () => {
    fetchInsights(true);
  };

  const alertCards = insights.filter(
    (c) => c.type === "alert-warning" || c.type === "alert-overdue"
  );
  const otherCards = insights.filter(
    (c) => !["alert-warning", "alert-overdue"].includes(c.type)
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="relative w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search insights..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-gray-800 transition">
            <Bell size={20} />
          </button>
          <button className="text-gray-500 hover:text-gray-800 transition">
            <HelpCircle size={20} />
          </button>
          <img
            src="https://i.pravatar.cc/150?img=47"
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
        </div>
      </header>

      <main className="px-6 py-6 max-w-6xl mx-auto">
        {/* Title + Refresh Button */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
              <Clock size={13} /> Last analysis: {lastAnalysis || "Calculating..."}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60 shadow-sm"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin text-blue-600" : ""} />
            {refreshing ? "Refreshing AI Engine..." : "Refresh Analysis"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <p className="text-sm">Analyzing transaction data and calculating insights...</p>
          </div>
        ) : (
          <>
            {/* Top row — Alert Cards */}
            {alertCards.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {alertCards.map((c) => (
                  <InsightCardUI key={c.id} card={c} />
                ))}
              </div>
            )}

            {/* Bottom row — Projection, Category, & Processing Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherCards.map((c) => (
                <InsightCardUI key={c.id} card={c} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AIInsightsPage;
