import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./i18n";
import "./styles/global.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";

import { App } from "./app/App";
import { theme } from "./app/theme";
import { queryClient } from "./app/queryClient";
import { AuthProvider } from "./auth/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>,
);
