import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import Overview from "./components/Overview";

import { Customers } from "./pages/Customers";
import InvoicesPage from "./pages/InvoicesPage";
import ExpensesPage from "./pages/ExpensesPage";

function App() {
  return (
    <Routes>
      {/* ================================
          PUBLIC ROUTES
      ================================= */}

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />

      {/* ================================
          PROTECTED ROUTES
      ================================= */}

      <Route element={<ProtectedRoute />}>
        {/* Dashboard Layout */}
        <Route element={<Dashboard />}>

          {/* Overview */}
          <Route path="/overview" element={<Overview />} />

          {/* Customers */}
          <Route path="/customers" element={<Customers />} />

          {/* Invoices */}
          <Route path="/invoices" element={<InvoicesPage />} />

          {/* expenses */}
          <Route path="/expenses" element={<ExpensesPage />} />

        </Route>
      </Route>

      {/* Default Route */}
      <Route
        path="*"
        element={<Navigate to="/overview" replace />}
      />
    </Routes>
  );
}

export default App;