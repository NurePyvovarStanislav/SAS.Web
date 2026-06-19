import { Group, Stack, Title } from "@mantine/core";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" mb="lg" wrap="wrap">
      <Stack gap={4}>
        <Title order={2}>{title}</Title>
      </Stack>
      {actions}
    </Group>
  );
}
