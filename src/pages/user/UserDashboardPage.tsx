import { Button, Grid, Group, Paper, SimpleGrid, Skeleton, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle, IconDeviceAnalytics } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { alertsApi } from "../../api/alertsApi";
import { fieldsApi } from "../../api/fieldsApi";
import { measurementsApi } from "../../api/measurementsApi";
import { sensorsApi } from "../../api/sensorsApi";
import { queryKeys } from "../../app/queryClient";
import { useAuth } from "../../auth/AuthContext";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import { formatDateTime, formatNumber } from "../../utils/dateFormat";
import { getApiErrorMessage } from "../../utils/apiError";
import type { MeasurementDto } from "../../types/measurement";

export default function UserDashboardPage() {
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

  const lastMeasurementQuery = useQuery({
    queryKey: ["user", "lastMeasurement", fieldId, sensorsQuery.data?.length],
    queryFn: async (): Promise<MeasurementDto | null> => {
      const sensors = sensorsQuery.data ?? [];
      if (sensors.length === 0) return null;

      const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const results = await Promise.all(
        sensors.map((sensor) =>
          measurementsApi.getBySensor({ sensorId: sensor.sensorId, from }).catch(() => []),
        ),
      );

      const all = results.flat();
      if (all.length === 0) return null;

      return all.reduce((latest, current) =>
        new Date(current.measuredAt) > new Date(latest.measuredAt) ? current : latest,
      );
    },
    enabled: Boolean(fieldId) && (sensorsQuery.data?.length ?? 0) > 0,
  });

  if (!fieldId) {
    return (
      <>
        <PageHeader title={t("dashboard.title")} />
        <EmptyState
          title={t("dashboard.noFieldAssigned")}
          description={t("dashboard.noFieldDescription")}
        />
      </>
    );
  }

  const isLoading = fieldQuery.isLoading || sensorsQuery.isLoading || alertsQuery.isLoading;
  const error = fieldQuery.error ?? sensorsQuery.error ?? alertsQuery.error;

  if (error) {
    return (
      <>
        <PageHeader title={t("dashboard.title")} />
        <ErrorState
          message={getApiErrorMessage(error, t)}
          onRetry={() => {
            void fieldQuery.refetch();
            void sensorsQuery.refetch();
            void alertsQuery.refetch();
          }}
        />
      </>
    );
  }

  const field = fieldQuery.data;
  const sensors = sensorsQuery.data ?? [];
  const alerts = alertsQuery.data ?? [];
  const activeAlerts = alerts.filter((a) => !a.isResolved);
  const lastMeasurement = lastMeasurementQuery.data;

  return (
    <>
      <PageHeader
        title={t("dashboard.title")}
        actions={
          <Text c="dimmed">{t("dashboard.welcome", { name: user?.fullName ?? "" })}</Text>
        }
      />

      {isLoading ? (
        <Stack gap="md">
          <Skeleton height={120} radius="md" />
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={90} radius="md" />
            ))}
          </SimpleGrid>
        </Stack>
      ) : (
        <Stack gap="lg">
          <Paper className="sas-card" p="lg">
            <Title order={4} mb="sm">
              {t("dashboard.assignedField")}
            </Title>
            {field ? (
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Text size="sm" c="dimmed">
                    {t("fields.name")}
                  </Text>
                  <Text fw={600}>{field.name}</Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Text size="sm" c="dimmed">
                    {t("dashboard.cropType")}
                  </Text>
                  <Text fw={600}>{field.cropType}</Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Text size="sm" c="dimmed">
                    {t("dashboard.area")}
                  </Text>
                  <Text fw={600}>
                    {formatNumber(field.area, i18n.language)} {t("fields.area").includes("га") ? "" : "ha"}
                  </Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Text size="sm" c="dimmed">
                    {t("dashboard.location")}
                  </Text>
                  <Text fw={600}>{field.location ?? t("common.notAvailable")}</Text>
                </Grid.Col>
              </Grid>
            ) : null}
          </Paper>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
            <Paper className="sas-card" p="md">
              <Text size="sm" c="dimmed">
                {t("dashboard.sensorsCount")}
              </Text>
              <Title order={3}>{sensors.length}</Title>
            </Paper>
            <Paper className="sas-card" p="md">
              <Text size="sm" c="dimmed">
                {t("dashboard.activeAlertsCount")}
              </Text>
              <Title order={3} c={activeAlerts.length > 0 ? "red" : undefined}>
                {activeAlerts.length}
              </Title>
            </Paper>
            <Paper className="sas-card" p="md" style={{ gridColumn: "span 2" }}>
              <Text size="sm" c="dimmed">
                {t("dashboard.lastMeasurement")}
              </Text>
              {lastMeasurementQuery.isLoading ? (
                <Skeleton height={28} mt="xs" />
              ) : lastMeasurement ? (
                <Text fw={600}>
                  {formatNumber(lastMeasurement.value, i18n.language)} —{" "}
                  {formatDateTime(lastMeasurement.measuredAt, i18n.language)}
                </Text>
              ) : (
                <Text>{t("dashboard.noMeasurements")}</Text>
              )}
            </Paper>
          </SimpleGrid>

          <Paper className="sas-card" p="lg">
            <Title order={4} mb="md">
              {t("dashboard.quickLinks")}
            </Title>
            <Group>
              <Button
                component={Link}
                to="/app/sensors"
                leftSection={<IconDeviceAnalytics size={16} />}
                variant="light"
                color="green"
              >
                {t("dashboard.viewSensors")}
              </Button>
              <Button
                component={Link}
                to="/app/alerts"
                leftSection={<IconAlertTriangle size={16} />}
                variant="light"
                color="orange"
              >
                {t("dashboard.viewAlerts")}
              </Button>
            </Group>
          </Paper>
        </Stack>
      )}
    </>
  );
}
