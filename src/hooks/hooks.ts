"use client";

import type { AppContextValue, ModalContextValue } from "@/typing/interfaces";
import { useState, useEffect, useContext, useRef } from "react";
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



interface UseOutsideClickProps {
  targetRef: React.RefObject<HTMLElement | null>;
  onOutsideClick: (event: globalThis.MouseEvent) => void;
  componentIsActive?: boolean;
}

const useOutsideClick = ({targetRef, onOutsideClick, componentIsActive = true,}: UseOutsideClickProps) => {
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
  useOutsideClick,
  useIsFirefox
};