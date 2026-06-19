import { getIntlLocale } from "./dateFormat";

export function localeSort(
  first: string,
  second: string,
  language: string,
): number {
  return new Intl.Collator(getIntlLocale(language), {
    sensitivity: "base",
    numeric: true,
  }).compare(first, second);
}

export function localeSortBy<T>(
  items: T[],
  selector: (item: T) => string,
  language: string,
): T[] {
  return [...items].sort((a, b) =>
    localeSort(selector(a), selector(b), language),
  );
}
