import {
  IconAlertTriangle,
  IconChartLine,
  IconDashboard,
  IconDatabase,
  IconDeviceAnalytics,
  IconMapPin,
  IconUsers,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

export function AdminNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();

  const items = [
    { to: "/admin", label: t("nav.dashboard"), icon: IconDashboard, end: true },
    { to: "/admin/users", label: t("nav.users"), icon: IconUsers },
    { to: "/admin/fields", label: t("nav.fields"), icon: IconMapPin },
    { to: "/admin/sensors", label: t("nav.sensors"), icon: IconDeviceAnalytics },
    {
      to: "/admin/measurements",
      label: t("nav.measurements"),
      icon: IconChartLine,
    },
    { to: "/admin/alerts", label: t("nav.alerts"), icon: IconAlertTriangle },
    { to: "/admin/data", label: t("nav.dataManagement"), icon: IconDatabase },
  ];

  return (
    <nav>
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          style={({ isActive }) => ({
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 8,
            marginBottom: 4,
            textDecoration: "none",
            color: isActive ? "var(--sas-dark-green)" : "var(--sas-text)",
            backgroundColor: isActive ? "var(--sas-light-green)" : "transparent",
            fontWeight: 500,
          })}
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
