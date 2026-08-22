import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleHomeRedirect from "./components/RoleHomeRedirect";
import Dashboard from "./components/Dashboard";
import CustomerLayout from "./components/CustomerLayout";
import Overview from "./components/Overview";

import { Customers } from "./pages/Customers";
import InvoicesPage from "./pages/InvoicesPage";
import ExpensesPage from "./pages/ExpensesPage";
import PaymentsPage from "./pages/PaymentsPage";
import ReceiptsPage from "./pages/ReceiptsPage";
import ReportsPage from "./pages/ReportsPage";
import AIInsightsPage from "./pages/AIInsightsPage";
import SettingsPage from "./pages/SettingsPage";

import CustomerDashboardPage from "./pages/CustomerDashboardPage";
import CustomerInvoicesPage from "./pages/CustomerInvoicesPage";
import CustomerPaymentsPage from "./pages/CustomerPaymentsPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import UserManagementPage from "./pages/UserManagementPage";
import BusinessesPage from "./pages/BusinessesPage";

import { ADMIN_ROLES } from "./constants/permissions";

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />

      {/* Admin & Business Dashboard — superAdmin, owner, accountant, staff */}
      <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
        <Route element={<Dashboard />}>
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="/admin/reports" element={<Navigate to="/reports" replace />} />
          <Route path="/overview" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/user-management"
            element={
              <ProtectedRoute allowedRoles={["superAdmin"]}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/businesses"
            element={
              <ProtectedRoute allowedRoles={["superAdmin"]}>
                <BusinessesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={["superAdmin", "owner", "accountant", "staff"]}>
                <Customers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices"
            element={
              <ProtectedRoute allowedRoles={["superAdmin", "owner", "accountant", "staff"]}>
                <InvoicesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/expenses"
            element={
              <ProtectedRoute allowedRoles={["superAdmin", "owner", "accountant"]}>
                <ExpensesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute allowedRoles={["superAdmin", "owner", "accountant", "staff"]}>
                <PaymentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/receipts"
            element={
              <ProtectedRoute allowedRoles={["superAdmin", "owner", "accountant", "staff"]}>
                <ReceiptsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["superAdmin", "owner", "accountant"]}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={["superAdmin", "owner", "accountant", "staff"]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["superAdmin", "owner", "accountant", "staff"]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-insights"
            element={
              <ProtectedRoute allowedRoles={["superAdmin", "owner", "accountant", "staff"]}>
                <AIInsightsPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>

      {/* Customer portal */}
      <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
        <Route element={<CustomerLayout />}>
          <Route path="/customer-dashboard" element={<CustomerDashboardPage />} />
          <Route path="/my-invoices" element={<CustomerInvoicesPage />} />
          <Route path="/my-payments" element={<CustomerPaymentsPage />} />
          <Route path="/my-profile" element={<CustomerProfilePage />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<RoleHomeRedirect />} />
    </Routes>
  );
};

export default App;
