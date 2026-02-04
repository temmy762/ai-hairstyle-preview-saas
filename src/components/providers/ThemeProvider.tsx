"use client";

import { useEffect } from "react";
import { applyTheme, getThemeForSalonType } from "@/lib/themes";

type ThemeProviderProps = {
  salonType: "barbershop" | "hairsalon";
  children: React.ReactNode;
};

export function ThemeProvider({ salonType, children }: ThemeProviderProps) {
  useEffect(() => {
    const theme = getThemeForSalonType(salonType);
    applyTheme(theme);
  }, [salonType]);

  return <>{children}</>;
}
