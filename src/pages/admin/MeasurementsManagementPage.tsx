import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod";

import { fieldsApi } from "../../api/fieldsApi";
import { measurementsApi } from "../../api/measurementsApi";
import { sensorsApi } from "../../api/sensorsApi";
import { queryKeys } from "../../app/queryClient";
import { ConfirmDeleteModal } from "../../components/common/ConfirmDeleteModal";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import type { MeasurementDto } from "../../types/measurement";
import { formatDateTime, formatNumber } from "../../utils/dateFormat";
import { getApiErrorMessage } from "../../utils/apiError";

type MeasurementFormValues = {
  value: number;
  measuredAt: string;
};

function getDefaultFromIso(): string {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

function toInputValue(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
}

export default function MeasurementsManagementPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [fieldId, setFieldId] = useState<string | null>(null);
  const [sensorId, setSensorId] = useState<string | null>(null);
  const [from, setFrom] = useState(() => toInputValue(getDefaultFromIso()));
  const [to, setTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState(() => getDefaultFromIso());
  const [appliedTo, setAppliedTo] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState<MeasurementDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MeasurementDto | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fieldsQuery = useQuery({
    queryKey: queryKeys.fields,
    queryFn: fieldsApi.getFields,
  });

  const sensorsQuery = useQuery({
    queryKey: queryKeys.sensors(fieldId ?? "none"),
    queryFn: () => sensorsApi.getSensorsByField(fieldId!),
    enabled: Boolean(fieldId),
  });

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

  const schema = z.object({
    value: z.number({ message: t("validation.valueRequired") }),
    measuredAt: z.string().min(1, t("validation.measuredAtRequired")),
  });

  const form = useForm<MeasurementFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { value: 0, measuredAt: "" },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MeasurementFormValues }) =>
      measurementsApi.updateMeasurement(id, {
        value: data.value,
        measuredAt: new Date(data.measuredAt).toISOString(),
      }),
    onSuccess: () => {
      notifications.show({ color: "green", message: t("measurements.updated") });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.measurements(sensorId!, appliedFrom, appliedTo),
      });
      setModalOpen(false);
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) }),
  });

  const deleteMutation = useMutation({
    mutationFn: measurementsApi.deleteMeasurement,
    onSuccess: () => {
      notifications.show({ color: "green", message: t("measurements.deleted") });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.measurements(sensorId!, appliedFrom, appliedTo),
      });
      setDeleteTarget(null);
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) }),
  });

  const openEdit = (measurement: MeasurementDto) => {
    setEditing(measurement);
    form.reset({
      value: measurement.value,
      measuredAt: toInputValue(measurement.measuredAt),
    });
    setModalOpen(true);
  };

  const onSubmit = form.handleSubmit((values) => {
    if (editing) {
      updateMutation.mutate({ id: editing.measurementId, data: values });
    }
  });

  const applyFilters = () => {
    setAppliedFrom(from ? new Date(from).toISOString() : getDefaultFromIso());
    setAppliedTo(to ? new Date(to).toISOString() : undefined);
  };

  const measurements = [...(measurementsQuery.data ?? [])].sort(
    (a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime(),
  );

  const chartData = [...measurements]
    .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())
    .map((m) => ({
      time: formatDateTime(m.measuredAt, i18n.language),
      value: m.value,
    }));

  const fieldOptions = (fieldsQuery.data ?? []).map((f) => ({
    value: f.fieldId,
    label: f.name,
  }));

  const sensorOptions = (sensorsQuery.data ?? []).map((s) => ({
    value: s.sensorId,
    label: s.name,
  }));

  return (
    <>
      <PageHeader title={t("measurements.managementTitle")} />

      <Paper className="sas-card" p="md" mb="lg">
        <Group align="flex-end" wrap="wrap">
          <Select
            label={t("measurements.field")}
            data={fieldOptions}
            value={fieldId}
            onChange={(v) => {
              setFieldId(v);
              setSensorId(null);
            }}
            searchable
            maw={220}
          />
          <Select
            label={t("measurements.sensor")}
            data={sensorOptions}
            value={sensorId}
            onChange={setSensorId}
            disabled={!fieldId}
            searchable
            maw={220}
          />
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
          <Button color="green" onClick={applyFilters} disabled={!sensorId}>
            {t("measurements.applyFilters")}
          </Button>
        </Group>
      </Paper>

      {!sensorId ? (
        <EmptyState title={t("measurements.selectFieldAndSensor")} />
      ) : measurementsQuery.error ? (
        <ErrorState
          message={getApiErrorMessage(measurementsQuery.error, t)}
          onRetry={() => void measurementsQuery.refetch()}
        />
      ) : measurementsQuery.isLoading ? (
        <Skeleton height={280} radius="md" />
      ) : measurements.length === 0 ? (
        <EmptyState title={t("measurements.empty")} />
      ) : (
        <Stack gap="lg">
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
                  <Table.Th>{t("common.actions")}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {measurements.map((m) => (
                  <Table.Tr key={m.measurementId}>
                    <Table.Td>{formatNumber(m.value, i18n.language)}</Table.Td>
                    <Table.Td>{formatDateTime(m.measuredAt, i18n.language)}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon variant="light" onClick={() => openEdit(m)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => setDeleteTarget(m)}
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
        </Stack>
      )}

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t("measurements.edit")}
      >
        <form onSubmit={onSubmit}>
          <Stack gap="md">
            <NumberInput
              label={t("measurements.value")}
              value={form.watch("value")}
              onChange={(v) => form.setValue("value", Number(v) || 0)}
            />
            <TextInput
              label={t("measurements.measuredAt")}
              type="datetime-local"
              error={form.formState.errors.measuredAt?.message}
              {...form.register("measuredAt")}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setModalOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" color="green" loading={updateMutation.isPending}>
                {t("common.save")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <ConfirmDeleteModal
        opened={deleteTarget !== null}
        title={t("confirmDelete.title")}
        message={t("confirmDelete.measurementMessage")}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.measurementId);
        }}
      />
    </>
  );
}
