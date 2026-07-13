import type { Translations } from "./api/types";

export const getTranslation = (
  translations: Translations,
  code: string,
  field: string
): string => translations[code]?.[field] ?? "";

export const setTranslation = (
  translations: Translations,
  code: string,
  field: string,
  value: string
): Translations => ({
  ...translations,
  [code]: { ...translations[code], [field]: value }
});
