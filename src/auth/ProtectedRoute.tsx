import { Center, Loader } from "@mantine/core";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "./AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <Center mih="100vh">
        <Loader color="green" size="lg" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
