/** DINARO Design System: non-financial presentation preferences only. */
export type DinaroTheme = "dark" | "light";
export type DinaroDensity = "detailed" | "comfortable";
export interface DesignPreferences {
  theme: DinaroTheme;
  glass: number;
  density: DinaroDensity;
}
export const DESIGN_STORAGE_KEY = "dinaro.design.v1";
export const DEFAULT_DESIGN_PREFERENCES: Readonly<DesignPreferences> = Object.freeze({
  theme: "dark", glass: 35, density: "detailed"
});
export function clampGlass(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_DESIGN_PREFERENCES.glass;
  return Math.min(100, Math.max(0, Math.round(value)));
}
export function normalizeDesignPreferences(value: unknown): DesignPreferences {
  const raw = value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    theme: raw.theme === "light" ? "light" : "dark",
    glass: clampGlass(raw.glass),
    density: raw.density === "comfortable" ? "comfortable" : "detailed"
  };
}
export function glassStyleValues(glass: unknown): { blur: string; opacity: string } {
  const value = clampGlass(glass);
  return { blur: String(Math.round(value * 0.18)) + "px", opacity: (1 - value * 0.0022).toFixed(3) };
}
