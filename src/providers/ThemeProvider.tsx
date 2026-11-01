"use client";

import { ContextProviderProps } from "@/typing/interfaces";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const ThemeProvider = ({ children }: ContextProviderProps) => {
  return (
    <NextThemesProvider
      attribute="data-color-mode"
      defaultTheme="system"
    >
      {children}
    </NextThemesProvider>
  );
};

export { ThemeProvider };