import {
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { measurementsApi } from "../../api/measurementsApi";
import { sensorsApi } from "../../api/sensorsApi";
import { queryKeys } from "../../app/queryClient";
import { useAuth } from "../../auth/AuthContext";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import { formatDateTime, formatNumber } from "../../utils/dateFormat";
import { getApiErrorMessage } from "../../utils/apiError";

function getDefaultFromIso(): string {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

function toInputValue(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export default function UserMeasurementsPage() {
  const { t, i18n } = useTranslation();
  const { sensorId } = useParams<{ sensorId: string }>();
  const { user } = useAuth();
  const fieldId = user?.fieldId ?? null;

  const [from, setFrom] = useState(() => toInputValue(getDefaultFromIso()));
  const [to, setTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState(() => getDefaultFromIso());
  const [appliedTo, setAppliedTo] = useState<string | undefined>(undefined);

  const sensorsQuery = useQuery({
    queryKey: queryKeys.sensors(fieldId ?? "none"),
    queryFn: () => sensorsApi.getSensorsByField(fieldId!),
    enabled: Boolean(fieldId),
  });

  const sensor = sensorsQuery.data?.find((s) => s.sensorId === sensorId);

  const measurementsQuery = useQuery({
    queryKey: queryKeys.measurements(sensorId ?? "", appliedFrom, appliedTo),
    queryFn: () =>
      measurementsApi.getBySensor({
        sensorId: sensorId!,
        from: appliedFrom,
        to: appliedTo,
      }),
    enabled: Boolean(sensorId),
  });

  const applyFilters = () => {
    setAppliedFrom(from ? new Date(from).toISOString() : getDefaultFromIso());
    setAppliedTo(to ? new Date(to).toISOString() : undefined);
  };

  const clearFilters = () => {
    setFrom(toInputValue(getDefaultFromIso()));
    setTo("");
    setAppliedFrom(getDefaultFromIso());
    setAppliedTo(undefined);
  };

  if (!fieldId || !sensorId) {
    return (
      <>
        <PageHeader title={t("measurements.title")} />
        <EmptyState title={t("measurements.selectSensor")} />
      </>
    );
  }

  if (measurementsQuery.error) {
    return (
      <>
        <PageHeader title={t("measurements.title")} />
        <ErrorState
          message={getApiErrorMessage(measurementsQuery.error, t)}
          onRetry={() => void measurementsQuery.refetch()}
        />
      </>
    );
  }

  const measurements = [...(measurementsQuery.data ?? [])].sort(
    (a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime(),
  );

  const chartData = [...measurements]
    .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())
    .map((m) => ({
      time: formatDateTime(m.measuredAt, i18n.language),
      value: m.value,
    }));

  return (
    <>
      <PageHeader
        title={t("measurements.title")}
        actions={
          sensor ? (
            <Text c="dimmed" size="sm">
              {sensor.name}
            </Text>
          ) : null
        }
      />

      <Stack gap="lg">
        <Paper className="sas-card" p="md">
          <Group align="flex-end" wrap="wrap">
            <TextInput
              label={t("measurements.from")}
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.currentTarget.value)}
            />
            <TextInput
              label={t("measurements.to")}
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.currentTarget.value)}
            />
            <Button color="green" onClick={applyFilters}>
              {t("measurements.applyFilters")}
            </Button>
            <Button variant="default" onClick={clearFilters}>
              {t("measurements.clearFilters")}
            </Button>
          </Group>
        </Paper>

        {measurementsQuery.isLoading ? (
          <Skeleton height={280} radius="md" />
        ) : measurements.length === 0 ? (
          <EmptyState title={t("measurements.empty")} />
        ) : (
          <>
            <Paper className="sas-card" p="md">
              <Title order={4} mb="md">
                {t("measurements.chartTitle")}
              </Title>
              <div className="sas-chart-container">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2E7D32"
                      strokeWidth={2}
                      dot={false}
                      name={t("charts.value")}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Paper>

            <Paper className="sas-card sas-table-scroll" p="md">
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t("measurements.value")}</Table.Th>
                    <Table.Th>{t("measurements.measuredAt")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {measurements.map((m) => (
                    <Table.Tr key={m.measurementId}>
                      <Table.Td>{formatNumber(m.value, i18n.language)}</Table.Td>
                      <Table.Td>{formatDateTime(m.measuredAt, i18n.language)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          </>
        )}
      </Stack>
    </>
  );
}
