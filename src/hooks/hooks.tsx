"use client";

import { 
  type AppContextValue, 
  type AuthContextValue,
  type ModalContextValue, 
  type UseOutsideClickProps 
} from "@/typing/interfaces";
import { useEffect, useContext, useRef } from "react";
import { AppContext } from "@/contexts/AppContext";
import { ModalContext } from "@/contexts/ModalContext";
import { AuthContext } from "@/contexts/AuthContext";

const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthContextProvider");
  }
  return context;
};

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

const useOutsideClick = ({ 
  targetRef, 
  onOutsideClick, 
  componentIsActive = true 
}: UseOutsideClickProps) => {
  const handlerRef = useRef(onOutsideClick);
  handlerRef.current = onOutsideClick;

  useEffect(() => {
    if (!componentIsActive) {
      return;
    }

    const handleDocumentClick = (e: globalThis.MouseEvent) => {
      const container = targetRef.current;
      if (!container) {
        return;
      }

      const isInside = e.composedPath().includes(container);
      if (!isInside) {
        handlerRef.current(e);
      }
    };

    window.addEventListener("click", handleDocumentClick, { capture: true });

    return () => {
      window.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, [componentIsActive, targetRef]);
};

export { 
  useAuthContext,
  useAppContext,
  useModalContext,
  useOutsideClick
};