import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  SegmentedControl,
  Select,
  Skeleton,
  Table,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { alertsApi } from "../../api/alertsApi";
import { fieldsApi } from "../../api/fieldsApi";
import { queryKeys } from "../../app/queryClient";
import { ConfirmDeleteModal } from "../../components/common/ConfirmDeleteModal";
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

export default function AlertsManagementPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [fieldId, setFieldId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [deleteTarget, setDeleteTarget] = useState<AlertDto | null>(null);

  const fieldsQuery = useQuery({
    queryKey: queryKeys.fields,
    queryFn: fieldsApi.getFields,
  });

  const alertsQuery = useQuery({
    queryKey: queryKeys.alerts(fieldId ?? "none"),
    queryFn: () => alertsApi.getAlerts(fieldId!),
    enabled: Boolean(fieldId),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, isResolved }: { id: string; isResolved: boolean }) =>
      alertsApi.resolveAlert(id, { isResolved }),
    onSuccess: () => {
      notifications.show({ color: "green", message: t("alerts.resolvedSuccess") });
      void queryClient.invalidateQueries({ queryKey: queryKeys.alerts(fieldId!) });
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) }),
  });

  const deleteMutation = useMutation({
    mutationFn: alertsApi.deleteAlert,
    onSuccess: () => {
      notifications.show({ color: "green", message: t("alerts.deleted") });
      void queryClient.invalidateQueries({ queryKey: queryKeys.alerts(fieldId!) });
      setDeleteTarget(null);
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) }),
  });

  const filteredAlerts = useMemo(() => {
    const alerts = alertsQuery.data ?? [];
    return alerts.filter((alert) => {
      if (filter === "active") return !alert.isResolved;
      if (filter === "resolved") return alert.isResolved;
      if (filter === "Low" || filter === "High" || filter === "Critical") {
        return normalizeAlertLevel(alert.level) === filter;
      }
      return true;
    });
  }, [alertsQuery.data, filter]);

  const levelColor = (level: AlertLevel) => {
    const normalized = normalizeAlertLevel(level);
    if (normalized === "Critical") return "red";
    if (normalized === "High") return "orange";
    return "green";
  };

  const fieldOptions = (fieldsQuery.data ?? []).map((f) => ({
    value: f.fieldId,
    label: f.name,
  }));

  return (
    <>
      <PageHeader title={t("alerts.managementTitle")} />

      <Select
        label={t("alerts.selectField")}
        data={fieldOptions}
        value={fieldId}
        onChange={setFieldId}
        searchable
        mb="md"
        maw={400}
      />

      {fieldId ? (
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
      ) : null}

      {!fieldId ? (
        <EmptyState title={t("alerts.selectField")} />
      ) : alertsQuery.error ? (
        <ErrorState
          message={getApiErrorMessage(alertsQuery.error, t)}
          onRetry={() => void alertsQuery.refetch()}
        />
      ) : alertsQuery.isLoading ? (
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
                <Table.Th>{t("alerts.measurementId")}</Table.Th>
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
                  <Table.Td>{alert.measurementId}</Table.Td>
                  <Table.Td>{formatDateTime(alert.createdAt, i18n.language)}</Table.Td>
                  <Table.Td>
                    <Badge color={alert.isResolved ? "gray" : "red"} variant="light">
                      {alert.isResolved ? t("alerts.resolved") : t("alerts.active")}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        color="green"
                        loading={resolveMutation.isPending}
                        onClick={() =>
                          resolveMutation.mutate({
                            id: alert.alertId,
                            isResolved: !alert.isResolved,
                          })
                        }
                      >
                        {alert.isResolved ? t("alerts.unresolve") : t("alerts.resolve")}
                      </Button>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => setDeleteTarget(alert)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      <ConfirmDeleteModal
        opened={deleteTarget !== null}
        title={t("confirmDelete.title")}
        message={t("confirmDelete.alertMessage")}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.alertId);
        }}
      />
    </>
  );
}
