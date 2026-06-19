import {
  IconAlertTriangle,
  IconDashboard,
  IconDeviceAnalytics,
  IconMapPin,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

export function UserNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();

  const items = [
    { to: "/app", label: t("nav.dashboard"), icon: IconDashboard, end: true },
    { to: "/app/field", label: t("nav.myField"), icon: IconMapPin },
    { to: "/app/sensors", label: t("nav.sensors"), icon: IconDeviceAnalytics },
    { to: "/app/alerts", label: t("nav.alerts"), icon: IconAlertTriangle },
  ];

  return (
    <nav>
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) => `sas-nav-link${isActive ? " sas-nav-active" : ""}`}
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
