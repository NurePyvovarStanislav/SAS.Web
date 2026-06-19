import { Center, Loader } from "@mantine/core";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "./AuthContext";

export function AdminRoute() {
  const { isAdmin, isInitializing, isAuthenticated } = useAuth();

  if (isInitializing) {
    return (
      <Center mih="100vh">
        <Loader color="green" size="lg" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
