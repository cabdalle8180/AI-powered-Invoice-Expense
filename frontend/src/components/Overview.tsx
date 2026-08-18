import React from 'react';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Lightbulb, 
  ChevronDown 
} from 'lucide-react';

// --- Types ---
interface KpiCardProps {
  title: string;
  amount: string;
  trendText: string;
  trendType: 'up-blue' | 'up-red' | 'pending' | 'alert';
}

// --- Reusable KPI Card Component ---
const KpiCard: React.FC<KpiCardProps> = ({ title, amount, trendText, trendType }) => {
  const getTrendStyles = () => {
    switch (trendType) {
      case 'up-blue':
        return { text: 'text-blue-500', icon: <TrendingUp size={14} className="mr-1" /> };
      case 'up-red':
        return { text: 'text-red-500', icon: <TrendingUp size={14} className="mr-1" /> };
      case 'pending':
        return { text: 'text-amber-600', icon: <Clock size={14} className="mr-1" /> };
      case 'alert':
        return { text: 'text-red-600', icon: <AlertTriangle size={14} className="mr-1" /> };
    }
  };

  const trendStyle = getTrendStyles();

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-0">
      <h3 className="text-sm font-medium text-gray-500 mb-2 truncate">{title}</h3>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{amount}</p>
      <div className={`flex items-center text-xs font-medium ${trendStyle.text}`}>
        {trendStyle.icon}
        <span className="truncate">{trendText}</span>
      </div>
    </div>
  );
};

// --- Main Overview Component ---
const Overview: React.FC = () => {
  return (
    <main className="flex-1 bg-[#f8f9fa] min-h-screen font-sans overflow-x-hidden">
      
      {/* --- Top Header --- */}
      <header className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 px-4 sm:px-8 py-5 bg-white sm:bg-transparent border-b sm:border-b-0 border-gray-200">
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 bg-white sm:bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow"
          />
        </div>
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-5">
          <div className="flex items-center gap-5 ml-auto sm:ml-0">
            <div className="relative cursor-pointer text-gray-600 hover:text-gray-900">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <HelpCircle size={20} className="cursor-pointer text-gray-600 hover:text-gray-900" />
          </div>
          <img 
            src="https://i.pravatar.cc/150?img=47" 
            alt="User avatar" 
            className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer object-cover"
          />
        </div>
      </header>

      {/* --- Dashboard Content --- */}
      <div className="px-4 sm:px-8 pb-8 max-w-7xl mx-auto">
        
        {/* Page Title */}
        <div className="my-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Track your business performance and AI-driven insights.</p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <KpiCard title="Total Revenue" amount="$124,500" trendText="+12.5%" trendType="up-blue" />
          <KpiCard title="Total Expenses" amount="$42,800" trendText="+5.2%" trendType="up-red" />
          <KpiCard title="Net Profit" amount="$81,700" trendText="+8.4%" trendType="up-blue" />
          <KpiCard title="Outstanding" amount="$15,200" trendText="12 Invoices" trendType="pending" />
          <KpiCard title="Overdue" amount="$3,400" trendText="3 Invoices" trendType="alert" />
        </div>

        {/* AI Insight Banner */}
        <div className="bg-[#eff6ff] border border-blue-100 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 shadow-sm">
          <div className="bg-blue-500 text-white p-2 rounded-full shrink-0">
            <Lightbulb size={20} />
          </div>
          <div>
            <h4 className="text-[#1e3a8a] font-semibold text-sm mb-1">AI Financial Insight</h4>
            <p className="text-blue-900/80 text-sm leading-relaxed">
              Your marketing expenses increased by 15% this month compared to last month. Consider reviewing ongoing campaigns to optimize ROI.
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Revenue vs Expenses Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h3 className="font-semibold text-gray-900">Revenue vs Expenses</h3>
              <button className="self-start sm:self-auto flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                This Year <ChevronDown size={14} />
              </button>
            </div>
            {/* Chart Area Placeholder */}
            <div className="flex-1 relative border-l border-b border-gray-100 mt-4 min-h-[200px] pb-6">
              <div className="absolute w-full h-px bg-gray-50 bottom-1/4"></div>
              <div className="absolute w-full h-px bg-gray-50 bottom-2/4"></div>
              <div className="absolute w-full h-px bg-gray-50 bottom-3/4"></div>
              {/* X-Axis Labels */}
              <div className="absolute -bottom-6 w-full flex justify-between text-xs text-gray-400 px-2 sm:px-4">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span>
              </div>
            </div>
          </div>

          {/* Expenses by Category (Donut Chart) */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Expenses by Category</h3>
            
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-6">
              <div 
                className="w-full h-full rounded-full"
                style={{ 
                  background: 'conic-gradient(#0ea5e9 0% 45%, #94a3b8 45% 75%, #cbd5e1 75% 100%)' 
                }}
              ></div>
              <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-lg sm:text-xl font-bold text-gray-900">$42.8k</span>
                <span className="text-xs text-gray-400 font-medium">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="w-3 h-3 rounded-full bg-[#0ea5e9]"></span> Payroll
                </div>
                <span className="font-medium text-gray-900">45%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="w-3 h-3 rounded-full bg-[#94a3b8]"></span> Marketing
                </div>
                <span className="font-medium text-gray-900">30%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="w-3 h-3 rounded-full bg-[#cbd5e1]"></span> Software
                </div>
                <span className="font-medium text-gray-900">25%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Invoices</h3>
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">View All</a>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Invoice ID</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                 <tr>
                   <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                      No recent invoices to display.
                   </td>
                 </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
};

export default Overview;