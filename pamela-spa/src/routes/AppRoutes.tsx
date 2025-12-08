// src/routes/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import { LoginPage } from "../pages/Auth/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ProductsPage from "../pages/Products/ProductsPage";
import CategoriesPage from "../pages/Categories/CategoriesPage";
import StockInPage from "../pages/StockIn/StockInPage";
import { StockOutPage } from "../pages/StockOut/StockOutPage";
import { ReportsPage } from "../pages/Reports/ReportsPage";
import UsersPage from "../pages/Users/UsersPage";
import AuditLogsPage from "../pages/AuditLogs/AuditLogsPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleProtectedRoute } from "./RoleProtectedRoute"; 

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    {/* Must wrap with ProtectedRoute */}
    <Route element={<ProtectedRoute />}>
      {/* Public for all authenticated roles */}
      <Route path="/" element={<DashboardPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/stock-in" element={<StockInPage />} />
      <Route path="/stock-out" element={<StockOutPage />} />
      <Route path="/reports" element={<ReportsPage />} />

      {/* Categories protected */}
      <Route
        element={
          <RoleProtectedRoute
            allowedRoles={["super_admin", "admin", "staff"]}
          />
        }
      >
        <Route path="/categories" element={<CategoriesPage />} />
      </Route>

      {/* Users protected */}
      <Route
        element={<RoleProtectedRoute allowedRoles={["super_admin", "admin"]} />}
      >
        <Route path="/users" element={<UsersPage />} />
      </Route>

      {/* Audit Logs protected */}
      <Route
        element={<RoleProtectedRoute allowedRoles={["super_admin", "admin"]} />}
      >
        <Route path="/audit-logs" element={<AuditLogsPage />} />
      </Route>
    </Route>
  </Routes>
);

export default AppRoutes;
