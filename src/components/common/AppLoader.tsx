import { Center, Loader, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

export function AppLoader() {
  const { t } = useTranslation();

  return (
    <Center mih="40vh">
      <Stack align="center" gap="sm">
        <Loader color="green" size="lg" />
        <Text c="dimmed" size="sm">
          {t("common.loading")}
        </Text>
      </Stack>
    </Center>
  );
}
