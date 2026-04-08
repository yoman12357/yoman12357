export const THEME_STORAGE_KEY = "calendar-theme-preference";

export type AppTheme = "light" | "dark";

export function isAppTheme(value: string | null | undefined): value is AppTheme {
  return value === "light" || value === "dark";
}

export function resolveAppTheme(
  value: string | null | undefined,
): AppTheme {
  return isAppTheme(value) ? value : "light";
}
