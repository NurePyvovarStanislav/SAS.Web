import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import uk from "./locales/uk.json";
import en from "./locales/en.json";

const storedLanguage = localStorage.getItem("sas.language") ?? "uk";

void i18n.use(initReactI18next).init({
  resources: {
    uk: { translation: uk },
    en: { translation: en },
  },
  lng: storedLanguage,
  fallbackLng: "uk",
  interpolation: {
    escapeValue: false,
  },
});

function applyDocumentLocale(language: string): void {
  document.documentElement.lang = language;
  document.documentElement.dir = i18n.dir(language);
}

applyDocumentLocale(storedLanguage);

i18n.on("languageChanged", (language) => {
  localStorage.setItem("sas.language", language);
  applyDocumentLocale(language);
});

export default i18n;
