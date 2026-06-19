import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  Skeleton,
  Stack,
  Table,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Controller,
  useForm,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { fieldsApi } from "../../api/fieldsApi";
import { queryKeys } from "../../app/queryClient";
import { ConfirmDeleteModal } from "../../components/common/ConfirmDeleteModal";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import type { FieldDto } from "../../types/field";
import { formatNumber } from "../../utils/dateFormat";
import { localeSort } from "../../utils/localeSort";
import { getApiErrorMessage } from "../../utils/apiError";

type FieldFormValues = {
  name: string;
  cropType: string;
  area: number;
  location: string;
};

export default function FieldsManagementPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FieldDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FieldDto | null>(null);

  const fieldsQuery = useQuery({
    queryKey: queryKeys.fields,
    queryFn: fieldsApi.getFields,
  });

  const schema = z.object({
    name: z.string().min(1, t("validation.nameRequired")),
    cropType: z.string().min(1, t("validation.cropTypeRequired")),
    area: z.number().positive(t("validation.areaPositive")),
    location: z.string(),
  });

  const form = useForm<FieldFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", cropType: "", area: 1, location: "" },
  });

  const openCreate = () => {
    setEditingField(null);
    form.reset({ name: "", cropType: "", area: 1, location: "" });
    setModalOpen(true);
  };

  const openEdit = (field: FieldDto) => {
    setEditingField(field);
    form.reset({
      name: field.name,
      cropType: field.cropType,
      area: field.area,
      location: field.location ?? "",
    });
    setModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: fieldsApi.createField,
    onSuccess: () => {
      notifications.show({ color: "green", message: t("fields.created") });
      void queryClient.invalidateQueries({ queryKey: queryKeys.fields });
      setModalOpen(false);
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FieldFormValues }) =>
      fieldsApi.updateField(id, {
        name: data.name,
        cropType: data.cropType,
        area: data.area,
        location: data.location || null,
      }),
    onSuccess: () => {
      notifications.show({ color: "green", message: t("fields.updated") });
      void queryClient.invalidateQueries({ queryKey: queryKeys.fields });
      setModalOpen(false);
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) }),
  });

  const deleteMutation = useMutation({
    mutationFn: fieldsApi.deleteField,
    onSuccess: () => {
      notifications.show({ color: "green", message: t("fields.deleted") });
      void queryClient.invalidateQueries({ queryKey: queryKeys.fields });
      setDeleteTarget(null);
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) }),
  });

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      name: values.name,
      cropType: values.cropType,
      area: values.area,
      location: values.location || null,
    };
    if (editingField) {
      updateMutation.mutate({ id: editingField.fieldId, data: values });
    } else {
      createMutation.mutate(payload);
    }
  });

  const filteredFields = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...(fieldsQuery.data ?? [])].sort((a, b) =>
      localeSort(a.name, b.name, i18n.language),
    );
    if (!q) return list;
    return list.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.cropType.toLowerCase().includes(q) ||
        (f.location ?? "").toLowerCase().includes(q),
    );
  }, [fieldsQuery.data, search, i18n.language]);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (fieldsQuery.error) {
    return (
      <>
        <PageHeader title={t("fields.title")} />
        <ErrorState
          message={getApiErrorMessage(fieldsQuery.error, t)}
          onRetry={() => void fieldsQuery.refetch()}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t("fields.title")}
        actions={
          <Button leftSection={<IconPlus size={16} />} color="green" onClick={openCreate}>
            {t("fields.create")}
          </Button>
        }
      />

      <TextInput
        placeholder={t("fields.search")}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="md"
      />

      {fieldsQuery.isLoading ? (
        <Skeleton height={200} radius="md" />
      ) : filteredFields.length === 0 ? (
        <EmptyState title={t("fields.empty")} />
      ) : (
        <Paper className="sas-card sas-table-scroll" p="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("fields.name")}</Table.Th>
                <Table.Th>{t("fields.cropType")}</Table.Th>
                <Table.Th>{t("fields.area")}</Table.Th>
                <Table.Th>{t("fields.location")}</Table.Th>
                <Table.Th>{t("common.actions")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredFields.map((field) => (
                <Table.Tr key={field.fieldId}>
                  <Table.Td>{field.name}</Table.Td>
                  <Table.Td>{field.cropType}</Table.Td>
                  <Table.Td>{formatNumber(field.area, i18n.language)}</Table.Td>
                  <Table.Td>{field.location ?? t("common.notAvailable")}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="light" onClick={() => openEdit(field)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => setDeleteTarget(field)}
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
        title={editingField ? t("fields.edit") : t("fields.create")}
      >
        <form onSubmit={onSubmit}>
          <Stack gap="md">
            <TextInput
              label={t("fields.name")}
              error={form.formState.errors.name?.message}
              {...form.register("name")}
            />
            <TextInput
              label={t("fields.cropType")}
              error={form.formState.errors.cropType?.message}
              {...form.register("cropType")}
            />
            <Controller
              name="area"
              control={form.control}
              render={({ field, fieldState }) => (
                <NumberInput
                  label={t("fields.area")}
                  min={0.01}
                  decimalScale={2}
                  value={field.value}
                  error={fieldState.error?.message}
                  onBlur={field.onBlur}
                  onChange={(value) => {
                    field.onChange(
                      typeof value === "number"
                        ? value
                        : Number(value) || 0,
                    );
                  }}
                />
              )}
            />
            <TextInput label={t("fields.location")} {...form.register("location")} />
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
        message={t("confirmDelete.fieldMessage", { name: deleteTarget?.name ?? "" })}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.fieldId);
        }}
      />
    </>
  );
}
