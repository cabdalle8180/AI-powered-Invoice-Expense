import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Banknote,
  Wallet,
  Receipt,
  BarChart3,
  BrainCircuit,
  Settings,
  UserCircle,
  Building2,
  Menu,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";

interface NavItemProps {
  name: string;
  icon: React.ReactNode;
  to: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ name, icon, to, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `
      group flex items-center rounded-lg px-3 py-2.5 transition-all duration-200 relative justify-start
      ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
    `}
  >
    {({ isActive }) => (
      <>
        <div className={`shrink-0 mr-3 ${isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-600"}`}>
          {icon}
        </div>

        <span className="whitespace-nowrap overflow-hidden font-medium">
          {name}
        </span>

        {isActive && (
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-700 rounded-l-md" />
        )}
      </>
    )}
  </NavLink>
);

const Sidebar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { user } = useAppSelector((state) => state.auth);

  const businessName = user?.business?.name || user?.businessName || "My Business";
  const role = user?.role || "user";
  const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

  const mainNavItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, to: "/overview" },
    { name: "Customers", icon: <Users size={20} />, to: "/customers" },
    { name: "Invoices", icon: <FileText size={20} />, to: "/invoices" },
    { name: "Payments", icon: <Banknote size={20} />, to: "/payments" },
    { name: "Expenses", icon: <Wallet size={20} />, to: "/expenses" },
    { name: "Receipts", icon: <Receipt size={20} />, to: "/receipts" },
    { name: "Reports", icon: <BarChart3 size={20} />, to: "/reports" },
    { name: "AI Insights", icon: <BrainCircuit size={20} />, to: "/ai-insights" },
  ];

  const bottomNavItems = [
    { name: "Settings", icon: <Settings size={20} />, to: "/settings" },
    { name: "User Profile", icon: <UserCircle size={20} />, to: "/profile" },
  ];

  const handleMobileClose = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile Hamburger Button */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-md shadow-md text-gray-600 hover:text-gray-900 border border-gray-200"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Mobile Background Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={handleMobileClose}
        />
      )}

      <aside
        className={`
          fixed md:relative z-50 md:z-auto h-screen w-64 bg-[#f8f9fa] flex flex-col border-r border-gray-200 shrink-0 transition-transform duration-300
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Mobile Close Button (X) */}
        {isMobileOpen && (
          <button
            onClick={handleMobileClose}
            className="md:hidden absolute right-4 top-6 p-1 text-gray-500 hover:bg-gray-200 rounded-md"
          >
            <X size={24} />
          </button>
        )}

        {/* Brand */}
        <div className="h-24 flex items-center px-6 gap-3 mt-6 md:mt-0">
          <div className="bg-[#1e4b6b] text-white rounded-lg w-10 h-10 flex items-center justify-center font-bold text-lg shrink-0">
            F
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">FinAI Tracker</h1>
          </div>
        </div>

        {/* Business + Role */}
        <div className="mx-3 mb-4 bg-white border border-gray-200 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <Building2 size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{businessName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{formattedRole}</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-1 px-4">
          {mainNavItems.map((item) => (
            <NavItem key={item.name} {...item} onClick={handleMobileClose} />
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 p-4">
          <nav className="space-y-1">
            {bottomNavItems.map((item) => (
              <NavItem key={item.name} {...item} onClick={handleMobileClose} />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;