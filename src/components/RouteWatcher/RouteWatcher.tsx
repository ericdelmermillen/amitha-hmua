"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useAppContext } from "@/hooks/hooks";
import { scrollToTop } from "@/utils/utils";

const APP_ISLOADING_DELAY = parseInt(process.env.NEXT_PUBLIC_APP_ISLOADING_DELAY || "500", 10);

const Watcher = () => {
  const { setAppIsLoading } = useAppContext();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => {
        setAppIsLoading(false);
      }, APP_ISLOADING_DELAY);
    };

    if (document.readyState === "complete") {
      scrollToTop();
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => {
        window.removeEventListener("load", handleLoad);
      };
    }
  }, [pathname, searchParams, setAppIsLoading]);
  return null;
};

const RouteWatcher = () => {
  return (
    <Suspense fallback={null}>
      <Watcher />
    </Suspense>
  );
};

export default RouteWatcher;