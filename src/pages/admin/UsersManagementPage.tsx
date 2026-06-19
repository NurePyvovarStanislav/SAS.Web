import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Paper,
  Select,
  Skeleton,
  Stack,
  Switch,
  Table,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { fieldsApi } from "../../api/fieldsApi";
import { usersApi } from "../../api/usersApi";
import { queryKeys } from "../../app/queryClient";
import { useAuth } from "../../auth/AuthContext";
import { ConfirmDeleteModal } from "../../components/common/ConfirmDeleteModal";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import type { UserDto } from "../../types/user";
import { formatUserRole, USER_ROLE_OPTIONS } from "../../utils/enumFormat";
import { localeSort } from "../../utils/localeSort";
import { getApiErrorMessage } from "../../utils/apiError";

type UserFormValues = {
  email: string;
  password?: string;
  fullName: string;
  role: "User" | "Administrator";
  phone: string;
  fieldId: string | null;
  isActive: boolean;
};

export default function UsersManagementPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserDto | null>(null);

  const usersQuery = useQuery({
    queryKey: queryKeys.users,
    queryFn: usersApi.getUsers,
  });

  const fieldsQuery = useQuery({
    queryKey: queryKeys.fields,
    queryFn: fieldsApi.getFields,
  });

  const schema = z.object({
    email: z.string().min(1, t("validation.required")).email(t("validation.email")),
    password: editingUser
      ? z.string().optional()
      : z.string().min(1, t("validation.passwordMin")),
    fullName: z.string().min(1, t("validation.required")),
    role: z.enum(["User", "Administrator"]),
    phone: z.string(),
    fieldId: z.string().nullable(),
    isActive: z.boolean(),
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema) as Resolver<UserFormValues>,
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      role: "User",
      phone: "",
      fieldId: null,
      isActive: true,
    },
  });

  const openCreate = () => {
    setEditingUser(null);
    form.reset({
      email: "",
      password: "",
      fullName: "",
      role: "User",
      phone: "",
      fieldId: null,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (user: UserDto) => {
    setEditingUser(user);
    form.reset({
      email: user.email,
      password: "",
      fullName: user.fullName,
      role: user.role === 1 || user.role === "Administrator" ? "Administrator" : "User",
      phone: user.phone ?? "",
      fieldId: user.fieldId,
      isActive: user.isActive,
    });
    setModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      notifications.show({ color: "green", message: t("users.created") });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
      setModalOpen(false);
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof usersApi.updateUser>[1] }) =>
      usersApi.updateUser(id, data),
    onSuccess: () => {
      notifications.show({ color: "green", message: t("users.updated") });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
      setModalOpen(false);
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) }),
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      notifications.show({ color: "green", message: t("users.deleted") });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
      setDeleteTarget(null);
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) }),
  });

  const onSubmit = form.handleSubmit((values) => {
    if (editingUser) {
      updateMutation.mutate({
        id: editingUser.userId,
        data: {
          email: values.email,
          fullName: values.fullName,
          role: values.role,
          phone: values.phone || null,
          password: values.password || null,
          fieldId: values.fieldId || null,
          isActive: values.isActive,
        },
      });
    } else {
      createMutation.mutate({
        email: values.email,
        password: values.password ?? "",
        fullName: values.fullName,
        role: values.role,
        phone: values.phone || null,
        fieldId: values.fieldId || null,
        isActive: values.isActive,
      });
    }
  });

  const fieldOptions = useMemo(
    () => [
      { value: "", label: t("users.noField") },
      ...(fieldsQuery.data ?? []).map((f) => ({
        value: f.fieldId,
        label: f.name,
      })),
    ],
    [fieldsQuery.data, t],
  );

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...(usersQuery.data ?? [])].sort((a, b) =>
      localeSort(a.fullName, b.fullName, i18n.language),
    );
    if (!q) return list;
    return list.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q),
    );
  }, [usersQuery.data, search, i18n.language]);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (usersQuery.error) {
    return (
      <>
        <PageHeader title={t("users.title")} />
        <ErrorState
          message={getApiErrorMessage(usersQuery.error, t)}
          onRetry={() => void usersQuery.refetch()}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t("users.title")}
        actions={
          <Button leftSection={<IconPlus size={16} />} color="green" onClick={openCreate}>
            {t("users.create")}
          </Button>
        }
      />

      <TextInput
        placeholder={t("users.search")}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="md"
      />

      {usersQuery.isLoading ? (
        <Skeleton height={200} radius="md" />
      ) : filteredUsers.length === 0 ? (
        <EmptyState title={t("users.empty")} />
      ) : (
        <Paper className="sas-card sas-table-scroll" p="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("users.fullName")}</Table.Th>
                <Table.Th>{t("users.email")}</Table.Th>
                <Table.Th>{t("users.role")}</Table.Th>
                <Table.Th>{t("users.phone")}</Table.Th>
                <Table.Th>{t("users.assignedField")}</Table.Th>
                <Table.Th>{t("users.active")}</Table.Th>
                <Table.Th>{t("common.actions")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredUsers.map((user) => {
                const fieldName =
                  fieldsQuery.data?.find((f) => f.fieldId === user.fieldId)?.name ??
                  t("users.noField");
                const isSelf = user.userId === currentUser?.userId;

                return (
                  <Table.Tr key={user.userId}>
                    <Table.Td>{user.fullName}</Table.Td>
                    <Table.Td>{user.email}</Table.Td>
                    <Table.Td>{formatUserRole(user.role, t)}</Table.Td>
                    <Table.Td>{user.phone ?? t("common.notAvailable")}</Table.Td>
                    <Table.Td>{fieldName}</Table.Td>
                    <Table.Td>
                      <StatusBadge active={user.isActive} />
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon variant="light" onClick={() => openEdit(user)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          disabled={isSelf}
                          title={isSelf ? t("users.cannotDeleteSelf") : undefined}
                          onClick={() => setDeleteTarget(user)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? t("users.edit") : t("users.create")}
        size="lg"
      >
        <form onSubmit={onSubmit}>
          <Stack gap="md">
            <TextInput
              label={t("users.email")}
              error={form.formState.errors.email?.message}
              {...form.register("email")}
            />
            <TextInput
              label={editingUser ? t("users.passwordOptional") : t("users.password")}
              type="password"
              error={form.formState.errors.password?.message}
              {...form.register("password")}
            />
            <TextInput
              label={t("users.fullName")}
              error={form.formState.errors.fullName?.message}
              {...form.register("fullName")}
            />
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select
                  label={t("users.role")}
                  data={USER_ROLE_OPTIONS.map((r) => ({
                    value: r,
                    label: t(`roles.${r}`),
                  }))}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "User")}
                />
              )}
            />
            <TextInput label={t("users.phone")} {...form.register("phone")} />
            <Controller
              control={form.control}
              name="fieldId"
              render={({ field }) => (
                <Select
                  label={t("users.assignedField")}
                  data={fieldOptions}
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(v || null)}
                  searchable
                />
              )}
            />
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  label={t("users.active")}
                  checked={field.value}
                  onChange={(e) => field.onChange(e.currentTarget.checked)}
                />
              )}
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
        message={t("confirmDelete.userMessage", { name: deleteTarget?.fullName ?? "" })}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.userId);
        }}
      />
    </>
  );
}
