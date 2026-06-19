import { Button, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className="sas-empty-state">
      <Stack align="center" gap="sm">
        <ThemeIcon size={56} radius="xl" color="red" variant="light">
          <IconAlertTriangle size={28} />
        </ThemeIcon>
        <Title order={4}>{t("common.error")}</Title>
        <Text c="dimmed" maw={480}>
          {message}
        </Text>
        {onRetry ? (
          <Button variant="light" color="green" onClick={onRetry}>
            {t("common.retry")}
          </Button>
        ) : null}
      </Stack>
    </div>
  );
}
