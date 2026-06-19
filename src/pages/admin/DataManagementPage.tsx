import {
  Alert,
  Button,
  FileInput,
  Grid,
  Group,
  List,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { administrationApi } from "../../api/administrationApi";
import { PageHeader } from "../../components/common/PageHeader";
import type { ExportEntity, ImportResultDto } from "../../types/administration";
import { getApiErrorMessage } from "../../utils/apiError";

const JSON_ENTITIES: ExportEntity[] = [
  "all",
  "users",
  "fields",
  "sensors",
  "measurements",
  "alerts",
];

const CSV_ENTITIES: ExportEntity[] = [
  "users",
  "fields",
  "sensors",
  "measurements",
  "alerts",
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DataManagementPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [jsonEntity, setJsonEntity] = useState<ExportEntity>("all");
  const [csvEntity, setCsvEntity] = useState<ExportEntity>("fields");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResultDto | null>(null);

  const backupMutation = useMutation({
    mutationFn: administrationApi.createBackup,
    onSuccess: () =>
      notifications.show({ color: "green", message: t("dataManagement.backup.success") }),
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) }),
  });

  const exportJsonMutation = useMutation({
    mutationFn: (entity: ExportEntity) => administrationApi.exportData("json", entity),
    onSuccess: () =>
      notifications.show({ color: "green", message: t("dataManagement.exportJson.success") }),
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) }),
  });

  const exportCsvMutation = useMutation({
    mutationFn: (entity: ExportEntity) => administrationApi.exportData("csv", entity),
    onSuccess: () =>
      notifications.show({ color: "green", message: t("dataManagement.exportCsv.success") }),
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) }),
  });

  const importMutation = useMutation({
    mutationFn: administrationApi.importData,
    onSuccess: (result) => {
      setImportResult(result);
      setConfirmOpen(false);
      setImportFile(null);
      notifications.show({ color: "green", message: t("dataManagement.import.success") });
      void queryClient.invalidateQueries();
    },
    onError: (error) => {
      notifications.show({ color: "red", message: getApiErrorMessage(error, t) });
    },
  });

  const handleImportConfirm = () => {
    if (!importFile) return;
    if (!importFile.name.toLowerCase().endsWith(".json")) {
      notifications.show({ color: "red", message: t("validation.jsonOnly") });
      return;
    }
    if (importFile.size > 10 * 1024 * 1024) {
      notifications.show({ color: "red", message: t("validation.fileTooLarge") });
      return;
    }
    importMutation.mutate(importFile);
  };

  const entityOptions = (entities: ExportEntity[]) =>
    entities.map((entity) => ({
      value: entity,
      label: t(`dataManagement.entities.${entity}`),
    }));

  return (
    <>
      <PageHeader title={t("dataManagement.title")} />

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper className="sas-card" p="lg">
            <Stack gap="md">
              <Title order={4}>{t("dataManagement.backup.title")}</Title>
              <Text c="dimmed" size="sm">
                {t("dataManagement.backup.description")}
              </Text>
              <Button
                color="green"
                loading={backupMutation.isPending}
                onClick={() => backupMutation.mutate()}
              >
                {t("dataManagement.backup.action")}
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper className="sas-card" p="lg">
            <Stack gap="md">
              <Title order={4}>{t("dataManagement.exportJson.title")}</Title>
              <Text c="dimmed" size="sm">
                {t("dataManagement.exportJson.description")}
              </Text>
              <Select
                label={t("dataManagement.exportJson.entity")}
                data={entityOptions(JSON_ENTITIES)}
                value={jsonEntity}
                onChange={(v) => setJsonEntity((v as ExportEntity) ?? "all")}
              />
              <Button
                color="green"
                variant="light"
                loading={exportJsonMutation.isPending}
                onClick={() => exportJsonMutation.mutate(jsonEntity)}
              >
                {t("dataManagement.exportJson.action")}
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper className="sas-card" p="lg">
            <Stack gap="md">
              <Title order={4}>{t("dataManagement.exportCsv.title")}</Title>
              <Text c="dimmed" size="sm">
                {t("dataManagement.exportCsv.description")}
              </Text>
              <Select
                label={t("dataManagement.exportCsv.entity")}
                data={entityOptions(CSV_ENTITIES)}
                value={csvEntity}
                onChange={(v) => setCsvEntity((v as ExportEntity) ?? "fields")}
              />
              <Button
                color="green"
                variant="light"
                loading={exportCsvMutation.isPending}
                onClick={() => exportCsvMutation.mutate(csvEntity)}
              >
                {t("dataManagement.exportCsv.action")}
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper className="sas-card" p="lg">
            <Stack gap="md">
              <Title order={4}>{t("dataManagement.import.title")}</Title>
              <Text c="dimmed" size="sm">
                {t("dataManagement.import.description")}
              </Text>
              <FileInput
                label={t("dataManagement.import.selectFile")}
                placeholder={t("dataManagement.import.dropzone")}
                accept="application/json,.json"
                value={importFile}
                onChange={setImportFile}
              />
              {importFile ? (
                <Text size="sm">
                  {t("dataManagement.import.fileSelected", {
                    name: importFile.name,
                    size: formatFileSize(importFile.size),
                  })}
                </Text>
              ) : null}
              <Button
                color="green"
                disabled={!importFile}
                onClick={() => setConfirmOpen(true)}
              >
                {t("dataManagement.import.action")}
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {importResult ? (
        <Paper className="sas-card" p="lg" mt="lg">
          <Stack gap="sm">
            <Title order={4}>{t("dataManagement.import.success")}</Title>
            <Text>{t("dataManagement.import.created", { count: importResult.created })}</Text>
            <Text>{t("dataManagement.import.updated", { count: importResult.updated })}</Text>
            <Text>{t("dataManagement.import.skipped", { count: importResult.skipped })}</Text>
            {importResult.warnings.length > 0 ? (
              <Alert color="yellow" title={t("dataManagement.import.warnings")}>
                <List size="sm">
                  {importResult.warnings.map((warning) => (
                    <List.Item key={warning}>{warning}</List.Item>
                  ))}
                </List>
              </Alert>
            ) : null}
          </Stack>
        </Paper>
      ) : null}

      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t("dataManagement.import.confirmTitle")}
        centered
      >
        <Text mb="lg">
          {t("dataManagement.import.confirmMessage", { name: importFile?.name ?? "" })}
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setConfirmOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button color="green" loading={importMutation.isPending} onClick={handleImportConfirm}>
            {t("common.confirm")}
          </Button>
        </Group>
      </Modal>
    </>
  );
}
