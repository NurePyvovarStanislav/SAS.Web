import { Badge, Paper, Skeleton, Table, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { sensorsApi } from "../../api/sensorsApi";
import { queryKeys } from "../../app/queryClient";
import { useAuth } from "../../auth/AuthContext";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import { formatDateTime } from "../../utils/dateFormat";
import { formatSensorType } from "../../utils/enumFormat";
import { localeSort } from "../../utils/localeSort";
import { getApiErrorMessage } from "../../utils/apiError";

export default function UserSensorsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fieldId = user?.fieldId ?? null;

  const sensorsQuery = useQuery({
    queryKey: queryKeys.sensors(fieldId ?? "none"),
    queryFn: () => sensorsApi.getSensorsByField(fieldId!),
    enabled: Boolean(fieldId),
  });

  if (!fieldId) {
    return (
      <>
        <PageHeader title={t("sensors.title")} />
        <EmptyState
          title={t("dashboard.noFieldAssigned")}
          description={t("dashboard.noFieldDescription")}
        />
      </>
    );
  }

  if (sensorsQuery.error) {
    return (
      <>
        <PageHeader title={t("sensors.title")} />
        <ErrorState
          message={getApiErrorMessage(sensorsQuery.error, t)}
          onRetry={() => void sensorsQuery.refetch()}
        />
      </>
    );
  }

  const sensors = [...(sensorsQuery.data ?? [])].sort((a, b) =>
    localeSort(a.name, b.name, i18n.language),
  );

  return (
    <>
      <PageHeader title={t("sensors.title")} />

      {sensorsQuery.isLoading ? (
        <Skeleton height={200} radius="md" />
      ) : sensors.length === 0 ? (
        <EmptyState title={t("sensors.empty")} />
      ) : (
        <Paper className="sas-card sas-table-scroll" p="md">
          <Table highlightOnHover striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("sensors.name")}</Table.Th>
                <Table.Th>{t("sensors.type")}</Table.Th>
                <Table.Th>{t("sensors.status")}</Table.Th>
                <Table.Th>{t("sensors.minValue")}</Table.Th>
                <Table.Th>{t("sensors.maxValue")}</Table.Th>
                <Table.Th>{t("sensors.installedAt")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sensors.map((sensor) => {
                const isActive = sensor.status.toLowerCase() === "active";
                return (
                  <Table.Tr
                    key={sensor.sensorId}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(`/app/sensors/${sensor.sensorId}/measurements`)
                    }
                  >
                    <Table.Td>
                      <Text fw={500}>{sensor.name}</Text>
                    </Table.Td>
                    <Table.Td>{formatSensorType(sensor.sensorType, t)}</Table.Td>
                    <Table.Td>
                      <Badge color={isActive ? "green" : "gray"} variant="light">
                        {t(`status.${sensor.status}`, { defaultValue: sensor.status })}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{sensor.minValue}</Table.Td>
                    <Table.Td>{sensor.maxValue}</Table.Td>
                    <Table.Td>
                      {formatDateTime(sensor.installedAt, i18n.language)}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </>
  );
}
