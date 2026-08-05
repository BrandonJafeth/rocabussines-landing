export const SUPPORTED_LANGS = ["es", "en"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: Lang = "es";
export const LANG_COOKIE = "roca_lang";

export function isLang(value: string | null | undefined): value is Lang {
  return value === "es" || value === "en";
}
