"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "@/hooks/hooks";
import "./IsLoading.scss";

const APP_ISLOADING_DELAY = parseInt(process.env.NEXT_PUBLIC_APP_ISLOADING_DELAY || "300", 10);

const IsLoading = () => {
  const { appIsLoading } = useAppContext();

  const [ isVisible, setIsVisible ] = useState(false);
  const [ show, setShow ] = useState(false);

  // useEffect to handle visibility of isLoading
  useEffect(() => {
    let rafID: number;

    if (appIsLoading) {
      setIsVisible(true);

      rafID = requestAnimationFrame(() => {
        setShow(true);
      });

      return () => {
        cancelAnimationFrame(rafID);
      };
    }

    setShow(false);

    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, APP_ISLOADING_DELAY);

    return () => {
      clearTimeout(timeout);
    };
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