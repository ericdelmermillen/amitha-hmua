"use client";

import type { AppContextValue, ModalContextValue } from "@/typing/interfaces";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "@/contexts/AppContext";
import { ModalContext } from "@/contexts/ModalContext";
import { checkIfIsFirefox } from "@/utils/utils";

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

const useIsFirefox = () => {
  const [ isFirefox, setIsFirefox ] = useState(false);

  useEffect(() => {
    setIsFirefox(checkIfIsFirefox());
  }, []);

  return isFirefox;
};

export { 
  useAppContext,
  useModalContext,
  useIsFirefox
};