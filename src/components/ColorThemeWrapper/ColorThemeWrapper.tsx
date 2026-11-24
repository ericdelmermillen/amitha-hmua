"use client";

import { ThemeProvider } from "next-themes";
import { type ChildrenProps } from "@/typing/interfaces";

const ColorThemeWrapper = ({ children }: ChildrenProps) => {
  return (
    <ThemeProvider
      attribute="data-color-mode"
      defaultTheme="system"
      enableSystem
    >
      {children}
    </ThemeProvider>
  );
};

export default ColorThemeWrapper;