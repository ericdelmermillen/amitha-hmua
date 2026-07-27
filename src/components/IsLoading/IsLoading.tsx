"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "@/hooks/hooks";
import "./IsLoading.scss";

const APP_ISLOADING_DELAY = Number(process.env.NEXT_PUBLIC_APP_ISLOADING_DELAY);

const IsLoading = () => {
  const { appIsLoading } = useAppContext();

  const [ isVisible, setIsVisible ] = useState(false);
  const [ show, setShow ] = useState(false);

  useEffect(() => {
    if (appIsLoading) {
      setIsVisible(true);

      requestAnimationFrame(() => {
        setShow(true);
      });

      return;
    }

    setShow(false);

    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, APP_ISLOADING_DELAY);

    return () => clearTimeout(timeout);
  }, [appIsLoading]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      id="appIsLoading"
      className={`isLoading ${show ? "show" : ""}`}
    />
  );
};

export default IsLoading;