import { Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconDatabaseOff } from "@tabler/icons-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="sas-empty-state">
      <Stack align="center" gap="sm">
        <ThemeIcon size={56} radius="xl" color="green" variant="light">
          <IconDatabaseOff size={28} />
        </ThemeIcon>
        <Title order={4}>{title}</Title>
        {description ? (
          <Text c="dimmed" maw={480}>
            {description}
          </Text>
        ) : null}
        {action}
      </Stack>
    </div>
  );
}
