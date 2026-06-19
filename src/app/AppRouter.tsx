import { Center, Loader } from "@mantine/core";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AdminRoute } from "../auth/AdminRoute";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { useAuth } from "../auth/AuthContext";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const UserLayout = lazy(() => import("../layouts/UserLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const UserDashboardPage = lazy(() => import("../pages/user/UserDashboardPage"));
const MyFieldPage = lazy(() => import("../pages/user/MyFieldPage"));
const UserSensorsPage = lazy(() => import("../pages/user/UserSensorsPage"));
const UserMeasurementsPage = lazy(
  () => import("../pages/user/UserMeasurementsPage"),
);
const UserAlertsPage = lazy(() => import("../pages/user/UserAlertsPage"));
const AdminDashboardPage = lazy(
  () => import("../pages/admin/AdminDashboardPage"),
);
const UsersManagementPage = lazy(
  () => import("../pages/admin/UsersManagementPage"),
);
const FieldsManagementPage = lazy(
  () => import("../pages/admin/FieldsManagementPage"),
);
const SensorsManagementPage = lazy(
  () => import("../pages/admin/SensorsManagementPage"),
);
const MeasurementsManagementPage = lazy(
  () => import("../pages/admin/MeasurementsManagementPage"),
);
const AlertsManagementPage = lazy(
  () => import("../pages/admin/AlertsManagementPage"),
);
const DataManagementPage = lazy(
  () => import("../pages/admin/DataManagementPage"),
);

function PageLoader() {
  return (
    <Center mih="50vh">
      <Loader color="green" size="lg" />
    </Center>
  );
}

function LoginRoute() {
  const { isAuthenticated, isAdmin, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <Center mih="100vh">
        <Loader color="green" size="lg" />
      </Center>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin" : "/app"} replace />;
  }

  return <LoginPage />;
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<UserLayout />}>
            <Route index element={<UserDashboardPage />} />
            <Route path="field" element={<MyFieldPage />} />
            <Route path="sensors" element={<UserSensorsPage />} />
            <Route
              path="sensors/:sensorId/measurements"
              element={<UserMeasurementsPage />}
            />
            <Route path="alerts" element={<UserAlertsPage />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<UsersManagementPage />} />
            <Route path="fields" element={<FieldsManagementPage />} />
            <Route path="sensors" element={<SensorsManagementPage />} />
            <Route path="measurements" element={<MeasurementsManagementPage />} />
            <Route path="alerts" element={<AlertsManagementPage />} />
            <Route path="data" element={<DataManagementPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
