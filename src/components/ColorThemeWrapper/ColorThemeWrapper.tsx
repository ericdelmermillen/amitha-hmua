"use client";

import { type ChildrenProps } from "@/typing/interfaces";
import { ThemeProvider } from "next-themes";

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