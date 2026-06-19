import { Select } from "@mantine/core";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  return (
    <Select
      aria-label={t("nav.language")}
      data={[
        { value: "uk", label: t("language.uk") },
        { value: "en", label: t("language.en") },
      ]}
      value={i18n.language.startsWith("en") ? "en" : "uk"}
      onChange={(value) => {
        if (value) {
          void i18n.changeLanguage(value);
        }
      }}
      w={140}
      size="sm"
    />
  );
}
