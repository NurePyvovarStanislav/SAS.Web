import { AppShell, Burger, Button, Drawer, Group, ScrollArea, Text } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconLogout } from "@tabler/icons-react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../auth/AuthContext";
import { LanguageSwitcher } from "../components/common/LanguageSwitcher";
import { AppLogo } from "../components/layout/AppLogo";
import { UserNavigation } from "../components/layout/UserNavigation";

export default function UserLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [opened, { toggle, close }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const topBar = (
    <Group justify="space-between" h="100%" px="md" wrap="nowrap">
      <Group gap="sm">
        {isMobile ? <Burger opened={opened} onClick={toggle} size="sm" /> : null}
        <AppLogo to="/app" />
      </Group>
      <Group gap="sm" wrap="nowrap">
        <LanguageSwitcher />
        <Text size="sm" visibleFrom="xs">
          {user?.fullName}
        </Text>
        <Button
          variant="subtle"
          color="gray"
          size="compact-sm"
          leftSection={<IconLogout size={16} />}
          onClick={logout}
        >
          {t("nav.logout")}
        </Button>
      </Group>
    </Group>
  );

  const nav = <UserNavigation onNavigate={close} />;

  if (isMobile) {
    return (
      <>
        <AppShell header={{ height: 60 }} padding="md" className="sas-shell">
          <AppShell.Header className="sas-topbar">{topBar}</AppShell.Header>
          <AppShell.Main>
            <Outlet />
          </AppShell.Main>
        </AppShell>
        <Drawer opened={opened} onClose={close} title={t("nav.dashboard")} padding="md">
          {nav}
        </Drawer>
      </>
    );
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: "sm" }}
      padding="md"
      className="sas-shell"
    >
      <AppShell.Header className="sas-topbar">{topBar}</AppShell.Header>
      <AppShell.Navbar p="md" className="sas-sidebar">
        <ScrollArea>{nav}</ScrollArea>
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
