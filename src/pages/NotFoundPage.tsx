import { Button, Container, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconHomeOff } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

export default function NotFoundPage() {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin } = useAuth();

  const homePath = !isAuthenticated ? "/login" : isAdmin ? "/admin" : "/app";

  return (
    <Container size="sm" py={80}>
      <Stack align="center" gap="md">
        <ThemeIcon size={72} radius="xl" color="green" variant="light">
          <IconHomeOff size={36} />
        </ThemeIcon>
        <Title order={1}>404</Title>
        <Title order={3}>{t("notFound.title")}</Title>
        <Text c="dimmed" ta="center">
          {t("notFound.description")}
        </Text>
        <Button component={Link} to={homePath} color="green">
          {t("notFound.goHome")}
        </Button>
      </Stack>
    </Container>
  );
}
