import React from "react";
import { Link } from "react-router-dom";
import {
  Scan,
  TrendingUp,
  FileText,
  BarChart3,
  BrainCircuit,
  ArrowRight,
  Play,
  CheckCircle2,
  Send,
  Zap,
} from "lucide-react";

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* ─── NAVIGATION BAR ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-sky-500/20">
              <BarChart3 size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              FinAI<span className="text-sky-500">Tracker</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-sky-600 transition-colors">
              Features
            </a>
            <a href="#meet-brain" className="hover:text-sky-600 transition-colors">
              Meet Brain
            </a>
            <a href="#testimonials" className="hover:text-sky-600 transition-colors">
              Customers
            </a>
            <a href="#pricing" className="hover:text-sky-600 transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-sky-600 px-4 py-2 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-xl shadow-sm shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_35%_at_50%_0%,rgba(14,165,233,0.08)_0%,transparent_100%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Zap size={13} className="text-sky-500" />
            Next-Gen Financial Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Master Your Business Intelligence with AI
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            The complete AI-powered invoice and expense tracker for modern businesses.
            Simplify your financials, gain instant insights, and reclaim your time.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold bg-sky-500 hover:bg-sky-600 text-white px-7 py-3.5 rounded-xl shadow-md shadow-sky-500/25 transition-all hover:scale-[1.02]"
            >
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <a
              href="#meet-brain"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-3.5 rounded-xl shadow-sm transition-all"
            >
              <Play size={16} className="text-slate-500" /> Watch Demo
            </a>
          </div>

          {/* Realistic Dashboard Mockup */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="relative rounded-2xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-200/80 p-2 sm:p-4 transition-all">
              {/* Mock Browser Header */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 mb-3">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="ml-4 bg-slate-100/80 rounded-md px-4 py-1 text-xs text-slate-400 font-mono flex-1 text-left">
                  https://app.finai-tracker.com/dashboard
                </div>
              </div>

              {/* Dashboard Content Mockup */}
              <div className="bg-slate-50/50 rounded-xl p-4 sm:p-6 text-left">
                {/* Header inside mockup */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200/60">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      Welcome, David Chen!
                    </h3>
                    <p className="text-xs text-slate-500">
                      Here&apos;s your live business financial overview
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-600">
                      Oct 01 – Oct 31, 2026
                    </span>
                    <span className="text-xs bg-sky-500 text-white rounded-lg px-3 py-1.5 font-semibold">
                      Generate Report
                    </span>
                  </div>
                </div>

                {/* KPI Cards inside mockup */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 my-5">
                  <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-xs">
                    <span className="text-xs text-slate-400 font-medium">Total Balance</span>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">$15,450.85</p>
                    <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">+4.2%</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-xs">
                    <span className="text-xs text-slate-400 font-medium">Monthly Income</span>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">$8,200.00</p>
                    <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">+9.4%</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-xs">
                    <span className="text-xs text-slate-400 font-medium">Total Expenses</span>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">$6,350.50</p>
                    <span className="text-xs text-rose-500 font-semibold mt-1 inline-block">+2.1%</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-xs">
                    <span className="text-xs text-slate-400 font-medium">Savings Rate</span>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">23.7%</p>
                    <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">+1.5%</span>
                  </div>
                </div>

                {/* Mini chart & activity mockup */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/70">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold text-slate-800">Revenue & Expenses Trend</span>
                      <span className="text-xs text-sky-600 font-medium">Cash Flow • Real-time</span>
                    </div>
                    {/* SVG Chart visualization */}
                    <div className="h-36 w-full">
                      <svg viewBox="0 0 500 120" className="w-full h-full" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,80 Q70,40 140,60 T280,30 T420,50 T500,20 L500,120 L0,120 Z"
                          fill="url(#chartGrad)"
                        />
                        <path
                          d="M0,80 Q70,40 140,60 T280,30 T420,50 T500,20"
                          fill="none"
                          stroke="#0ea5e9"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <path
                          d="M0,95 Q70,75 140,85 T280,65 T420,70 T500,60"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                        />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                      <span>Jun</span>
                      <span>Jul</span>
                      <span>Aug</span>
                      <span>Sep</span>
                      <span>Oct</span>
                      <span>Nov</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200/70">
                    <span className="text-xs font-semibold text-slate-800 block mb-3">Recent Transactions</span>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <div>
                          <p className="font-semibold text-slate-800">Acme Corp</p>
                          <p className="text-[10px] text-slate-400">Invoice #INV-2041</p>
                        </div>
                        <span className="font-semibold text-emerald-600">+$1,850</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <div>
                          <p className="font-semibold text-slate-800">AWS Cloud</p>
                          <p className="text-[10px] text-slate-400">Hosting & Services</p>
                        </div>
                        <span className="font-semibold text-slate-700">-$349.50</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <p className="font-semibold text-slate-800">Globex Corp</p>
                          <p className="text-[10px] text-slate-400">Payment received</p>
                        </div>
                        <span className="font-semibold text-emerald-600">+$2,400</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF / TRUSTED BY ─────────────────────────────────── */}
      <section className="py-10 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-6">
            Trusted by 8,500+ modern businesses worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-65 grayscale hover:grayscale-0 transition-all">
            <span className="font-bold text-lg text-slate-700 tracking-tight">Acme Corp</span>
            <span className="font-bold text-lg text-slate-700 tracking-tight">Globex</span>
            <span className="font-bold text-lg text-slate-700 tracking-tight">Soylent</span>
            <span className="font-bold text-lg text-slate-700 tracking-tight">Initech</span>
            <span className="font-bold text-lg text-slate-700 tracking-tight">Umbrella</span>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─────────────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-28 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything you need to scale
            </h2>
            <p className="mt-3.5 text-base sm:text-lg text-slate-600">
              Powerful tools designed to automate your workflow and provide clarity on your financial health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-500 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Scan size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                AI-Powered Scanning
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Instantly extract structured data from physical and digital receipts or invoices with unmatched accuracy. Say goodbye to manual entry.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Financial Insights
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Visualize your cash flow, identify spending anomalies, and forecast future runway with real-time aggregated dashboard analytics.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-500 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Automated Invoicing
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Create, send, and track professional multi-currency invoices automatically. Reduce overdue balances with scheduled reminders and customer portal access.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-500 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Smart Reporting
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Generate comprehensive tax-ready Profit & Loss, revenue, expense, and aging receivable reports with a single click. Export to CSV or PDF instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MEET BRAIN AI ADVISOR ───────────────────────────────────────── */}
      <section id="meet-brain" className="py-20 md:py-28 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-xs font-semibold uppercase tracking-wider mb-4">
                <BrainCircuit size={14} /> Meet Brain
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Your Personal AI Financial Advisor
              </h2>

              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                Brain analyzes your spending patterns, identifies cost-saving opportunities, and answers complex financial queries in plain English. It&apos;s like having a CFO in your pocket.
              </p>

              <div className="mt-6 space-y-3.5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-sky-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">
                    Anomaly detection in recurring expenses
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-sky-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">
                    Automated tax category and ledger tagging
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-sky-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">
                    Natural language queries and cash-flow recommendations
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all"
                >
                  Try Brain AI Assistant <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Brain Chat Box Preview */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xl">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200/70">
                <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Brain AI</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-slate-500">Online • Ready to assist</span>
                  </div>
                </div>
              </div>

              {/* Chat messages */}
              <div className="my-5 space-y-4 text-sm">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-slate-200/80 text-slate-800 px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-[85%]">
                    How did our marketing spend compare to last month?
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="bg-sky-50/90 border border-sky-100 text-slate-800 p-4 rounded-2xl rounded-tl-xs max-w-[92%] space-y-2.5">
                    <p className="text-slate-800 text-xs sm:text-sm">
                      Marketing spend is <strong className="text-slate-900 font-bold">down 12%</strong> compared to last month. You spent <strong className="text-slate-900 font-bold">$4,350</strong> this month vs $4,770 last month.
                    </p>
                    <div className="bg-white/80 rounded-xl p-3 border border-sky-100/60 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Paid Ads</span>
                        <span className="font-semibold text-slate-900">$2,200</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Software Subscriptions</span>
                        <span className="font-semibold text-slate-900">$1,500</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Freelancers</span>
                        <span className="font-semibold text-slate-900">$650</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat input box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask Brain a question..."
                  readOnly
                  className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-11 py-2.5 text-xs sm:text-sm text-slate-600 focus:outline-none"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-sky-500 text-white rounded-lg flex items-center justify-center hover:bg-sky-600 transition"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to streamline your financial operations?
          </h2>
          <p className="mt-3.5 text-sky-100 text-base sm:text-lg">
            Join thousands of founders, accountants, and businesses gaining absolute clarity over their numbers.
          </p>
          <div className="mt-8">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-sky-600 hover:bg-sky-50 font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all hover:scale-105"
            >
              Get Started for Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
                  <BarChart3 size={16} />
                </div>
                FinAI Tracker
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Master your business intelligence with the complete AI-powered financial tracker.
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-3 uppercase tracking-wider text-xs">Product</h5>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#meet-brain" className="hover:text-white transition">AI Insights</a></li>
                <li><Link to="/login" className="hover:text-white transition">Receipt Scanner</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Invoicing</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-3 uppercase tracking-wider text-xs">Company</h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-3 uppercase tracking-wider text-xs">Legal</h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© 2026 FinAI Tracker. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
