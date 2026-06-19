import { Badge, Button, Group, Paper, SegmentedControl, Skeleton, Table } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { alertsApi } from "../../api/alertsApi";
import { queryKeys } from "../../app/queryClient";
import { useAuth } from "../../auth/AuthContext";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import type { AlertDto, AlertLevel } from "../../types/alert";
import { formatDateTime } from "../../utils/dateFormat";
import {
  formatAlertLevel,
  normalizeAlertLevel,
  type NormalizedAlertLevel,
} from "../../utils/enumFormat";
import { getApiErrorMessage } from "../../utils/apiError";

type FilterValue = "all" | "active" | "resolved" | NormalizedAlertLevel;

export default function UserAlertsPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const fieldId = user?.fieldId ?? null;
  const [filter, setFilter] = useState<FilterValue>("all");

  const alertsQuery = useQuery({
    queryKey: queryKeys.alerts(fieldId ?? "none"),
    queryFn: () => alertsApi.getAlerts(fieldId!),
    enabled: Boolean(fieldId),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, isResolved }: { id: string; isResolved: boolean }) =>
      alertsApi.resolveAlert(id, { isResolved }),
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: t("alerts.resolvedSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.alerts(fieldId!) });
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, t),
      });
    },
  });

  const filteredAlerts = useMemo(() => {
    const alerts = alertsQuery.data ?? [];
    return alerts.filter((alert: AlertDto) => {
      if (filter === "active") return !alert.isResolved;
      if (filter === "resolved") return alert.isResolved;
      if (filter === "Low" || filter === "High" || filter === "Critical") {
        return normalizeAlertLevel(alert.level) === filter;
      }
      return true;
    });
  }, [alertsQuery.data, filter]);

  if (!fieldId) {
    return (
      <>
        <PageHeader title={t("alerts.title")} />
        <EmptyState
          title={t("dashboard.noFieldAssigned")}
          description={t("dashboard.noFieldDescription")}
        />
      </>
    );
  }

  if (alertsQuery.error) {
    return (
      <>
        <PageHeader title={t("alerts.title")} />
        <ErrorState
          message={getApiErrorMessage(alertsQuery.error, t)}
          onRetry={() => void alertsQuery.refetch()}
        />
      </>
    );
  }

  const levelColor = (level: AlertLevel) => {
    const normalized = normalizeAlertLevel(level);
    if (normalized === "Critical") return "red";
    if (normalized === "High") return "orange";
    return "green";
  };

  return (
    <>
      <PageHeader title={t("alerts.title")} />

      <Group mb="md">
        <SegmentedControl
          value={filter}
          onChange={(value) => setFilter(value as FilterValue)}
          data={[
            { value: "all", label: t("alerts.filterAll") },
            { value: "active", label: t("alerts.filterActive") },
            { value: "resolved", label: t("alerts.filterResolved") },
            { value: "Low", label: t("alertLevels.Low") },
            { value: "High", label: t("alertLevels.High") },
            { value: "Critical", label: t("alertLevels.Critical") },
          ]}
        />
      </Group>

      {alertsQuery.isLoading ? (
        <Skeleton height={200} radius="md" />
      ) : filteredAlerts.length === 0 ? (
        <EmptyState title={t("alerts.empty")} />
      ) : (
        <Paper className="sas-card sas-table-scroll" p="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("alerts.level")}</Table.Th>
                <Table.Th>{t("alerts.message")}</Table.Th>
                <Table.Th>{t("alerts.createdAt")}</Table.Th>
                <Table.Th>{t("alerts.status")}</Table.Th>
                <Table.Th>{t("common.actions")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredAlerts.map((alert) => (
                <Table.Tr key={alert.alertId}>
                  <Table.Td>
                    <Badge color={levelColor(alert.level)} variant="light">
                      {formatAlertLevel(alert.level, t)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{alert.message}</Table.Td>
                  <Table.Td>{formatDateTime(alert.createdAt, i18n.language)}</Table.Td>
                  <Table.Td>
                    <Badge color={alert.isResolved ? "gray" : "red"} variant="light">
                      {alert.isResolved ? t("alerts.resolved") : t("alerts.active")}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {!alert.isResolved ? (
                      <Button
                        size="xs"
                        variant="light"
                        color="green"
                        loading={resolveMutation.isPending}
                        onClick={() =>
                          resolveMutation.mutate({ id: alert.alertId, isResolved: true })
                        }
                      >
                        {t("alerts.resolve")}
                      </Button>
                    ) : null}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </>
  );
}
