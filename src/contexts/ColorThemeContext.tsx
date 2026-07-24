"use client";

import { ColorMode } from "@/typing/types";
import {
  ColorThemeContextProps,
  ColorThemeContextValue,
} from "@/typing/interfaces";
import { useState, createContext, useEffect } from "react";

const ColorThemeContext = createContext<ColorThemeContextValue | undefined>(
  undefined
);

const ColorThemeProvider = ({
  children,
}: ColorThemeContextProps) => {

  const [ colorMode, setColorMode ] = useState<ColorMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const savedColorMode = localStorage.getItem("colorMode");

    return savedColorMode === "dark"
      ? "dark"
      : "light";
  });
  
  const toggleColorMode = () => {
    const newColorMode: ColorMode =
      colorMode === "light"
        ? "dark"
        : "light";

    setColorMode(newColorMode);

    localStorage.setItem(
      "colorMode",
      newColorMode
    );

    document.documentElement.setAttribute(
      "data-color-mode",
      newColorMode
    );
  };

  useEffect(() => {
    const savedMode = localStorage.getItem("colorMode") as ColorMode;
    if (savedMode && savedMode !== colorMode) {
      setColorMode(savedMode);
    }
  }, []);

  const contextValues: ColorThemeContextValue = {
    colorMode,
    setColorMode,
    toggleColorMode,
  };

  return (
    <ColorThemeContext.Provider value={contextValues}>
      {children}
    </ColorThemeContext.Provider>
  );
};

export {
  ColorThemeContext,
  ColorThemeProvider,
};