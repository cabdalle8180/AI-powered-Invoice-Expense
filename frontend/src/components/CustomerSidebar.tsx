import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Banknote,
  UserCircle,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAppDispatch } from "../hooks/reduxHooks";
import { logout } from "../features/auth/authSlice";
import { usePermission } from "../hooks/usePermission";
import { CUSTOMER_NAV_ITEMS } from "../constants/permissions";

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
        <span className="whitespace-nowrap overflow-hidden font-medium">{name}</span>
        {isActive && (
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-700 rounded-l-md" />
        )}
      </>
    )}
  </NavLink>
);

const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard size={20} />,
  "My Invoices": <FileText size={20} />,
  "My Payments": <Banknote size={20} />,
  "My Profile": <UserCircle size={20} />,
};

const CustomerSidebar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = usePermission();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const handleMobileClose = () => setIsMobileOpen(false);

  return (
    <>
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-md shadow-md text-gray-600 hover:text-gray-900 border border-gray-200"
        >
          <Menu size={24} />
        </button>
      )}

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
        {isMobileOpen && (
          <button
            onClick={handleMobileClose}
            className="md:hidden absolute right-4 top-6 p-1 text-gray-500 hover:bg-gray-200 rounded-md"
          >
            <X size={24} />
          </button>
        )}

        <div className="h-24 flex items-center px-6 gap-3 mt-6 md:mt-0">
          <div className="bg-[#1e4b6b] text-white rounded-lg w-10 h-10 flex items-center justify-center font-bold text-lg shrink-0">
            F
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">FinAI Tracker</h1>
          </div>
        </div>

        <div className="mx-3 mb-4 bg-white border border-gray-200 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <UserCircle size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">Customer Portal</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <p className="text-xs font-medium text-gray-500 truncate">{user?.name || "Customer"}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1 px-4">
          {CUSTOMER_NAV_ITEMS.map((item) => (
            <NavItem
              key={item.name}
              name={item.name}
              icon={iconMap[item.name]}
              to={item.to}
              onClick={handleMobileClose}
            />
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="w-full group flex items-center rounded-lg px-3 py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
          >
            <LogOut size={20} className="mr-3 text-gray-400 group-hover:text-red-600" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default CustomerSidebar;
