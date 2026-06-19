import { Grid, Paper, Skeleton, Stack, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { alertsApi } from "../../api/alertsApi";
import { fieldsApi } from "../../api/fieldsApi";
import { sensorsApi } from "../../api/sensorsApi";
import { queryKeys } from "../../app/queryClient";
import { useAuth } from "../../auth/AuthContext";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import { formatNumber } from "../../utils/dateFormat";
import { getApiErrorMessage } from "../../utils/apiError";

export default function MyFieldPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const fieldId = user?.fieldId ?? null;

  const fieldQuery = useQuery({
    queryKey: queryKeys.field(fieldId ?? "none"),
    queryFn: () => fieldsApi.getField(fieldId!),
    enabled: Boolean(fieldId),
  });

  const sensorsQuery = useQuery({
    queryKey: queryKeys.sensors(fieldId ?? "none"),
    queryFn: () => sensorsApi.getSensorsByField(fieldId!),
    enabled: Boolean(fieldId),
  });

  const alertsQuery = useQuery({
    queryKey: queryKeys.alerts(fieldId ?? "none"),
    queryFn: () => alertsApi.getAlerts(fieldId!),
    enabled: Boolean(fieldId),
  });

  if (!fieldId) {
    return (
      <>
        <PageHeader title={t("fields.myFieldTitle")} />
        <EmptyState
          title={t("dashboard.noFieldAssigned")}
          description={t("dashboard.noFieldDescription")}
        />
      </>
    );
  }

  const error = fieldQuery.error ?? sensorsQuery.error ?? alertsQuery.error;

  if (error) {
    return (
      <>
        <PageHeader title={t("fields.myFieldTitle")} />
        <ErrorState message={getApiErrorMessage(error, t)} onRetry={() => void fieldQuery.refetch()} />
      </>
    );
  }

  const field = fieldQuery.data;
  const sensors = sensorsQuery.data ?? [];
  const alerts = alertsQuery.data ?? [];
  const activeAlerts = alerts.filter((a) => !a.isResolved);

  return (
    <>
      <PageHeader title={t("fields.myFieldTitle")} />

      {fieldQuery.isLoading ? (
        <Skeleton height={200} radius="md" />
      ) : field ? (
        <Stack gap="lg">
          <Paper className="sas-card" p="lg">
            <Title order={3} mb="md">
              {field.name}
            </Title>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text size="sm" c="dimmed">
                  {t("fields.cropType")}
                </Text>
                <Text fw={600}>{field.cropType}</Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text size="sm" c="dimmed">
                  {t("fields.area")}
                </Text>
                <Text fw={600}>{formatNumber(field.area, i18n.language)}</Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12 }}>
                <Text size="sm" c="dimmed">
                  {t("fields.location")}
                </Text>
                <Text fw={600}>{field.location ?? t("common.notAvailable")}</Text>
              </Grid.Col>
            </Grid>
          </Paper>

          <Paper className="sas-card" p="lg">
            <Title order={4} mb="md">
              {t("fields.summary")}
            </Title>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Text size="sm" c="dimmed">
                  {t("dashboard.sensorsCount")}
                </Text>
                <Title order={3}>{sensors.length}</Title>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Text size="sm" c="dimmed">
                  {t("alerts.title")}
                </Text>
                <Title order={3}>{alerts.length}</Title>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Text size="sm" c="dimmed">
                  {t("dashboard.activeAlertsCount")}
                </Text>
                <Title order={3} c={activeAlerts.length > 0 ? "red" : undefined}>
                  {activeAlerts.length}
                </Title>
              </Grid.Col>
            </Grid>
          </Paper>
        </Stack>
      ) : null}
    </>
  );
}
