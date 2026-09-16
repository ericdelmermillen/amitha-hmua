"use client";

import type { AppContextValue, ModalContextValue } from "@/typing/interfaces";
import { useContext } from "react";
import { AppContext } from "@/contexts/AppContext";
import { ModalContext } from "@/contexts/ModalContext";

const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

const useModalContext = (): ModalContextValue => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalContext must be used within a ModalContextProvider");
  }
  return context;
};

export { 
  useAppContext,
  useModalContext,
};