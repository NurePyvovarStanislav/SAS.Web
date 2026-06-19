import { Badge } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface StatusBadgeProps {
  active: boolean;
}

export function StatusBadge({ active }: StatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <Badge color={active ? "green" : "gray"} variant="light">
      {active ? t("common.active") : t("common.inactive")}
    </Badge>
  );
}
