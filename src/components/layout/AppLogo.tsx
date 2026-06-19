import { Group, Text, ThemeIcon } from "@mantine/core";
import { IconPlant2 } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface AppLogoProps {
  to: string;
}

export function AppLogo({ to }: AppLogoProps) {
  const { t } = useTranslation();

  return (
    <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
      <Group gap="xs" wrap="nowrap">
        <ThemeIcon size="lg" radius="md" color="green" variant="filled">
          <IconPlant2 size={20} />
        </ThemeIcon>
        <div>
          <Text fw={700} size="sm" lh={1.2}>
            SAS
          </Text>
          <Text size="xs" c="dimmed" lh={1.2}>
            {t("app.subtitle")}
          </Text>
        </div>
      </Group>
    </Link>
  );
}
