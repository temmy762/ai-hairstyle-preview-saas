export type SalonTheme = {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textSecondary: string;
  border: string;
  cardBg: string;
  gradientFrom: string;
  gradientTo: string;
  shadowColor: string;
};

export const barbershopTheme: SalonTheme = {
  primary: "#1e293b", // Slate 800 (dark blue-gray)
  primaryHover: "#0f172a", // Slate 900
  primaryLight: "#334155", // Slate 700
  secondary: "#3b82f6", // Blue 500
  accent: "#60a5fa", // Blue 400
  background: "#f8fafc", // Slate 50
  text: "#0f172a", // Slate 900
  textSecondary: "#64748b", // Slate 500
  border: "#cbd5e1", // Slate 300
  cardBg: "#ffffff",
  gradientFrom: "#1e293b",
  gradientTo: "#0f172a",
  shadowColor: "rgba(30, 41, 59, 0.3)",
};

export const hairsalonTheme: SalonTheme = {
  primary: "#be185d", // Pink 700
  primaryHover: "#9f1239", // Pink 800
  primaryLight: "#db2777", // Pink 600
  secondary: "#a855f7", // Purple 500
  accent: "#c084fc", // Purple 400
  background: "#fdf4ff", // Fuchsia 50
  text: "#831843", // Pink 900
  textSecondary: "#9d174d", // Pink 800
  border: "#f9a8d4", // Pink 300
  cardBg: "#ffffff",
  gradientFrom: "#be185d",
  gradientTo: "#9f1239",
  shadowColor: "rgba(190, 24, 93, 0.3)",
};

export function getThemeForSalonType(type: "barbershop" | "hairsalon"): SalonTheme {
  return type === "barbershop" ? barbershopTheme : hairsalonTheme;
}

export function applyTheme(theme: SalonTheme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--salon-primary", theme.primary);
  root.style.setProperty("--salon-primary-hover", theme.primaryHover);
  root.style.setProperty("--salon-primary-light", theme.primaryLight);
  root.style.setProperty("--salon-secondary", theme.secondary);
  root.style.setProperty("--salon-accent", theme.accent);
  root.style.setProperty("--salon-background", theme.background);
  root.style.setProperty("--salon-text", theme.text);
  root.style.setProperty("--salon-text-secondary", theme.textSecondary);
  root.style.setProperty("--salon-border", theme.border);
  root.style.setProperty("--salon-card-bg", theme.cardBg);
  root.style.setProperty("--salon-gradient-from", theme.gradientFrom);
  root.style.setProperty("--salon-gradient-to", theme.gradientTo);
  root.style.setProperty("--salon-shadow", theme.shadowColor);
}
