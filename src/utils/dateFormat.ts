export function getIntlLocale(language: string): string {
  return language.startsWith("en") ? "en-US" : "uk-UA";
}

export function formatDateTime(
  value: string | Date,
  language: string,
): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(getIntlLocale(language), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDate(value: string | Date, language: string): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(getIntlLocale(language), {
    dateStyle: "medium",
  }).format(date);
}

export function formatNumber(
  value: number,
  language: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(getIntlLocale(language), options).format(value);
}
