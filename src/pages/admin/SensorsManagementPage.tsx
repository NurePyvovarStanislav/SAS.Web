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
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { fieldsApi } from "../../api/fieldsApi";
import { sensorsApi } from "../../api/sensorsApi";
import { queryKeys } from "../../app/queryClient";
import { ConfirmDeleteModal } from "../../components/common/ConfirmDeleteModal";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import type { SensorDto } from "../../types/sensor";
import { formatDateTime } from "../../utils/dateFormat";
import {
  formatSensorType,
  SENSOR_TYPE_OPTIONS,
  type NormalizedSensorType,
} from "../../utils/enumFormat";
import { localeSort } from "../../utils/localeSort";
import { getApiErrorMessage } from "../../utils/apiError";

type SensorFormValues = {
  name: string;
  sensorType: NormalizedSensorType;
  minValue: number;
  maxValue: number;
  status: string;
  installedAt: string;
};

export default function SensorsManagementPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<SensorDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SensorDto | null>(null);

  const fieldsQuery = useQuery({
    queryKey: queryKeys.fields,
    queryFn: fieldsApi.getFields,
  });

  const sensorsQuery = useQuery({
    queryKey: queryKeys.sensors(selectedFieldId ?? "none"),
    queryFn: () => sensorsApi.getSensorsByField(selectedFieldId!),
    enabled: Boolean(selectedFieldId),
  });

  const schema = z
    .object({
      name: z.string().min(1, t("validation.nameRequired")),
      sensorType: z.enum([
        "SoilMoisture",
        "Temperature",
        "Ph",
        "Light",
        "ElectricalConductivity",
      ]),
      minValue: z.number(),
      maxValue: z.number(),
      status: z.string().min(1, t("validation.required")),
      installedAt: z.string().min(1, t("validation.installedAtRequired")),
    })
    .refine((data) => data.minValue < data.maxValue, {
      message: t("validation.minLessThanMax"),
      path: ["maxValue"],
    });

  const form = useForm<SensorFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      sensorType: "SoilMoisture",
      minValue: 0,
      maxValue: 100,
      status: "Active",
      installedAt: new Date().toISOString().slice(0, 16),
    },
  });

  const openCreate = () => {
    if (!selectedFieldId) return;
    setEditingSensor(null);
    form.reset({
      name: "",
      sensorType: "SoilMoisture",
      minValue: 0,
      maxValue: 100,
      status: "Active",
      installedAt: new Date().toISOString().slice(0, 16),
    });
    setModalOpen(true);
  };

  const openEdit = (sensor: SensorDto) => {
    setEditingSensor(sensor);
    const type =
      typeof sensor.sensorType === "string"
        ? sensor.sensorType
        : (["SoilMoisture", "Temperature", "Ph", "Light", "ElectricalConductivity"][
            sensor.sensorType
          ] as NormalizedSensorType);
    form.reset({
      name: sensor.name,
      sensorType: type,
      minValue: sensor.minValue,
      maxValue: sensor.maxValue,
      status: sensor.status,
      installedAt: new Date(sensor.installedAt).toISOString().slice(0, 16),
    });
    setModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (data: SensorFormValues) =>
      sensorsApi.createSensor(selectedFieldId!, {
        ...data,
        fieldId: selectedFieldId!,
        installedAt: new Date(data.installedAt).toISOString(),
        sensorType: data.sensorType,
      }),
    onSuccess: () => {
      notifications.show({ color: "green", message: t("sensors.created") });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sensors(selectedFieldId!),
      });
      setModalOpen(false);
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SensorFormValues }) =>
      sensorsApi.updateSensor(id, {
        name: data.name,
        sensorType: data.sensorType,
        minValue: data.minValue,
        maxValue: data.maxValue,
        status: data.status,
        installedAt: new Date(data.installedAt).toISOString(),
      }),
    onSuccess: () => {
      notifications.show({ color: "green", message: t("sensors.updated") });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sensors(selectedFieldId!),
      });
      setModalOpen(false);
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) }),
  });

  const deleteMutation = useMutation({
    mutationFn: sensorsApi.deleteSensor,
    onSuccess: () => {
      notifications.show({ color: "green", message: t("sensors.deleted") });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sensors(selectedFieldId!),
      });
      setDeleteTarget(null);
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) }),
  });

  const onSubmit = form.handleSubmit((values) => {
    if (editingSensor) {
      updateMutation.mutate({ id: editingSensor.sensorId, data: values });
    } else {
      createMutation.mutate(values);
    }
  });

  const fieldOptions = useMemo(
    () =>
      (fieldsQuery.data ?? []).map((f) => ({
        value: f.fieldId,
        label: f.name,
      })),
    [fieldsQuery.data],
  );

  const sensors = useMemo(
    () =>
      [...(sensorsQuery.data ?? [])].sort((a, b) =>
        localeSort(a.name, b.name, i18n.language),
      ),
    [sensorsQuery.data, i18n.language],
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <PageHeader
        title={t("sensors.managementTitle")}
        actions={
          <Button
            leftSection={<IconPlus size={16} />}
            color="green"
            disabled={!selectedFieldId}
            onClick={openCreate}
          >
            {t("sensors.create")}
          </Button>
        }
      />

      <Select
        label={t("fields.selectField")}
        placeholder={t("sensors.selectFieldFirst")}
        data={fieldOptions}
        value={selectedFieldId}
        onChange={setSelectedFieldId}
        searchable
        mb="lg"
        maw={400}
      />

      {!selectedFieldId ? (
        <EmptyState title={t("sensors.selectFieldFirst")} />
      ) : sensorsQuery.error ? (
        <ErrorState
          message={getApiErrorMessage(sensorsQuery.error, t)}
          onRetry={() => void sensorsQuery.refetch()}
        />
      ) : sensorsQuery.isLoading ? (
        <Skeleton height={200} radius="md" />
      ) : sensors.length === 0 ? (
        <EmptyState title={t("sensors.empty")} />
      ) : (
        <Paper className="sas-card sas-table-scroll" p="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("sensors.name")}</Table.Th>
                <Table.Th>{t("sensors.type")}</Table.Th>
                <Table.Th>{t("sensors.status")}</Table.Th>
                <Table.Th>{t("sensors.minValue")}</Table.Th>
                <Table.Th>{t("sensors.maxValue")}</Table.Th>
                <Table.Th>{t("sensors.installedAt")}</Table.Th>
                <Table.Th>{t("common.actions")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sensors.map((sensor) => (
                <Table.Tr key={sensor.sensorId}>
                  <Table.Td>{sensor.name}</Table.Td>
                  <Table.Td>{formatSensorType(sensor.sensorType, t)}</Table.Td>
                  <Table.Td>{sensor.status}</Table.Td>
                  <Table.Td>{sensor.minValue}</Table.Td>
                  <Table.Td>{sensor.maxValue}</Table.Td>
                  <Table.Td>{formatDateTime(sensor.installedAt, i18n.language)}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="light" onClick={() => openEdit(sensor)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => setDeleteTarget(sensor)}
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

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSensor ? t("sensors.edit") : t("sensors.create")}
        size="lg"
      >
        <form onSubmit={onSubmit}>
          <Stack gap="md">
            <TextInput
              label={t("sensors.name")}
              error={form.formState.errors.name?.message}
              {...form.register("name")}
            />
            <Controller
              control={form.control}
              name="sensorType"
              render={({ field }) => (
                <Select
                  label={t("sensors.type")}
                  data={SENSOR_TYPE_OPTIONS.map((type) => ({
                    value: type,
                    label: t(`sensorTypes.${type}`),
                  }))}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "SoilMoisture")}
                />
              )}
            />
            <Group grow>
              <NumberInput
                label={t("sensors.minValue")}
                value={form.watch("minValue")}
                onChange={(v) => form.setValue("minValue", Number(v) || 0)}
              />
              <NumberInput
                label={t("sensors.maxValue")}
                error={form.formState.errors.maxValue?.message}
                value={form.watch("maxValue")}
                onChange={(v) => form.setValue("maxValue", Number(v) || 0)}
              />
            </Group>
            <TextInput label={t("sensors.status")} {...form.register("status")} />
            <TextInput
              label={t("sensors.installedAt")}
              type="datetime-local"
              error={form.formState.errors.installedAt?.message}
              {...form.register("installedAt")}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setModalOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" color="green" loading={isSaving}>
                {t("common.save")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <ConfirmDeleteModal
        opened={deleteTarget !== null}
        title={t("confirmDelete.title")}
        message={t("confirmDelete.sensorMessage", { name: deleteTarget?.name ?? "" })}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.sensorId);
        }}
      />
    </>
  );
}
