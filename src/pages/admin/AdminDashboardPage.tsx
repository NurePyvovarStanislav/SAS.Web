import {
  Button,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { alertsApi } from "../../api/alertsApi";
import { fieldsApi } from "../../api/fieldsApi";
import { measurementsApi } from "../../api/measurementsApi";
import { sensorsApi } from "../../api/sensorsApi";
import { usersApi } from "../../api/usersApi";
import { queryKeys } from "../../app/queryClient";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import type { AlertDto } from "../../types/alert";
import { formatDateTime } from "../../utils/dateFormat";
import {
  formatAlertLevel,
  normalizeAlertLevel,
} from "../../utils/enumFormat";
import { getApiErrorMessage } from "../../utils/apiError";

export default function AdminDashboardPage() {
  const { t, i18n } = useTranslation();

  const summaryQuery = useQuery({
    queryKey: queryKeys.adminSummary,
    queryFn: async () => {
      const [users, fields] = await Promise.all([
        usersApi.getUsers(),
        fieldsApi.getFields(),
      ]);

      const sensorResults = await Promise.all(
        fields.map((field) => sensorsApi.getSensorsByField(field.fieldId)),
      );
      const sensors = sensorResults.flat();

      const alertResults = await Promise.all(
        fields.map((field) => alertsApi.getAlerts(field.fieldId)),
      );
      const alerts = alertResults.flat();

      const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const measurementBatches = sensors.slice(0, 10);
      const measurementResults = await Promise.all(
        measurementBatches.map((sensor) =>
          measurementsApi
            .getBySensor({ sensorId: sensor.sensorId, from })
            .catch(() => []),
        ),
      );
      const measurements = measurementResults.flat();

      return { users, fields, sensors, alerts, measurements };
    },
  });

  const chartData = useMemo(() => {
    const alerts = summaryQuery.data?.alerts ?? [];
    const levels = ["Low", "High", "Critical"] as const;
    return levels.map((level) => ({
      level: t(`alertLevels.${level}`),
      count: alerts.filter((a) => normalizeAlertLevel(a.level) === level).length,
    }));
  }, [summaryQuery.data?.alerts, t]);

  const recentMeasurements = useMemo(() => {
    return [...(summaryQuery.data?.measurements ?? [])]
      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())
      .slice(0, 20)
      .reverse()
      .map((m) => ({
        time: formatDateTime(m.measuredAt, i18n.language),
        value: m.value,
      }));
  }, [summaryQuery.data?.measurements, i18n.language]);

  const recentAlerts = useMemo(() => {
    return [...(summaryQuery.data?.alerts ?? [])]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [summaryQuery.data?.alerts]);

  if (summaryQuery.error) {
    return (
      <>
        <PageHeader title={t("dashboard.adminTitle")} />
        <ErrorState
          message={getApiErrorMessage(summaryQuery.error, t)}
          onRetry={() => void summaryQuery.refetch()}
        />
      </>
    );
  }

  const users = summaryQuery.data?.users ?? [];
  const fields = summaryQuery.data?.fields ?? [];
  const sensors = summaryQuery.data?.sensors ?? [];
  const alerts = summaryQuery.data?.alerts ?? [];
  const activeAlerts = alerts.filter((a) => !a.isResolved);
  const criticalAlerts = alerts.filter(
    (a) => normalizeAlertLevel(a.level) === "Critical" && !a.isResolved,
  );

  return (
    <>
      <PageHeader title={t("dashboard.adminTitle")} />

      {summaryQuery.isLoading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={90} radius="md" />
          ))}
        </SimpleGrid>
      ) : (
        <Stack gap="lg">
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
            <Paper className="sas-card" p="md">
              <Text size="sm" c="dimmed">
                {t("dashboard.stats.users")}
              </Text>
              <Title order={3}>{users.length}</Title>
            </Paper>
            <Paper className="sas-card" p="md">
              <Text size="sm" c="dimmed">
                {t("dashboard.stats.activeUsers")}
              </Text>
              <Title order={3}>{users.filter((u) => u.isActive).length}</Title>
            </Paper>
            <Paper className="sas-card" p="md">
              <Text size="sm" c="dimmed">
                {t("dashboard.stats.fields")}
              </Text>
              <Title order={3}>{fields.length}</Title>
            </Paper>
            <Paper className="sas-card" p="md">
              <Text size="sm" c="dimmed">
                {t("dashboard.stats.sensors")}
              </Text>
              <Title order={3}>{sensors.length}</Title>
            </Paper>
            <Paper className="sas-card" p="md">
              <Text size="sm" c="dimmed">
                {t("dashboard.stats.activeAlerts")}
              </Text>
              <Title order={3} c="orange">
                {activeAlerts.length}
              </Title>
            </Paper>
            <Paper className="sas-card" p="md">
              <Text size="sm" c="dimmed">
                {t("dashboard.stats.criticalAlerts")}
              </Text>
              <Title order={3} c="red">
                {criticalAlerts.length}
              </Title>
            </Paper>
          </SimpleGrid>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper className="sas-card" p="md">
                <Title order={4} mb="md">
                  {t("dashboard.charts.alertsByLevel")}
                </Title>
                <div className="sas-chart-container">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="level" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2E7D32" name={t("charts.count")} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper className="sas-card" p="md">
                <Title order={4} mb="md">
                  {t("dashboard.charts.recentMeasurements")}
                </Title>
                <div className="sas-chart-container">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={recentMeasurements}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2E7D32"
                        dot={false}
                        name={t("charts.value")}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Paper>
            </Grid.Col>
          </Grid>

          <Paper className="sas-card" p="md">
            <Group justify="space-between" mb="md">
              <Title order={4}>{t("dashboard.recentAlerts")}</Title>
              <Button component={Link} to="/admin/alerts" variant="light" color="green" size="xs">
                {t("dashboard.viewAlerts")}
              </Button>
            </Group>
            {recentAlerts.length === 0 ? (
              <Text c="dimmed">{t("alerts.empty")}</Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t("alerts.level")}</Table.Th>
                    <Table.Th>{t("alerts.message")}</Table.Th>
                    <Table.Th>{t("alerts.createdAt")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {recentAlerts.map((alert: AlertDto) => (
                    <Table.Tr key={alert.alertId}>
                      <Table.Td>{formatAlertLevel(alert.level, t)}</Table.Td>
                      <Table.Td>{alert.message}</Table.Td>
                      <Table.Td>{formatDateTime(alert.createdAt, i18n.language)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Paper>

          <Group>
            <Button component={Link} to="/admin/users" variant="light" color="green">
              {t("nav.users")}
            </Button>
            <Button component={Link} to="/admin/fields" variant="light" color="green">
              {t("nav.fields")}
            </Button>
            <Button component={Link} to="/admin/data" variant="light" color="green">
              {t("nav.dataManagement")}
            </Button>
          </Group>
        </Stack>
      )}
    </>
  );
}
