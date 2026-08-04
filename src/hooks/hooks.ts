"use client";

import type { AppContextValue } from "@/typing/interfaces";
import { useContext } from "react";
import { AppContext } from "@/contexts/AppContext";
import { ColorThemeContext } from "@/contexts/ColorThemeContext";

const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  };
  return context;
};

const useColorThemeContext = () => {
  const context = useContext(ColorThemeContext);
  if (!context) {
    throw new Error("useColorThemeContext must be used within a ColorThemeProvider");
  };
  return context;
};

export { 
  useAppContext,
  useColorThemeContext
}