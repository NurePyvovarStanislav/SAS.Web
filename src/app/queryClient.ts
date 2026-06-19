import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const queryKeys = {
  users: ["users"] as const,
  fields: ["fields"] as const,
  field: (fieldId: string) => ["field", fieldId] as const,
  sensors: (fieldId: string) => ["sensors", fieldId] as const,
  measurements: (sensorId: string, from?: string, to?: string) =>
    ["measurements", sensorId, from ?? "", to ?? ""] as const,
  alerts: (fieldId: string) => ["alerts", fieldId] as const,
  adminSummary: ["admin", "summary"] as const,
};
