"use client";

import { type MouseEvent, useState,  useRef, useEffect, createContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { scrollToTop, isModifiedClick } from "@/utils/utils";
import { AppContextProviderProps, AppContextValue } from "@/typing/interfaces";
import { Tag } from "@/typing/interfaces";

const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);
const APP_ISLOADING_DELAY = Number(process.env.NEXT_PUBLIC_APP_ISLOADING_DELAY);

const AppContext = createContext<AppContextValue | undefined>(undefined);

const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [ scrollYPos, setScrollYPos ] = useState(0);

  const [ selectedTag, setSelectedTag ] = useState(null);
  const [ isOrderEditable, setIsOrderEditable ] = useState(false);

  const [ appIsLoading, setAppIsLoading ] = useState(true)

  // 
  const [ showMobileNav, setShowMobileNav ] = useState(false);

  const prevScrollYPosRef = useRef<number | null>(null);
  const getPrevScrollYPosValue = () => prevScrollYPosRef.current ?? 0;

  const pathname = usePathname();
  const router = useRouter();

  // { tag_name}


  const handleNavigateHome = (tagObj?: Tag) => {   
    if (!tagObj) {
      router.push("/work");
      setSelectedTag(null);
    } else if (tagObj) {
      router.push(`/work?tag=${tagObj.tagName}`);
    };
    setIsOrderEditable(false);
  };
  
  const handleToggleMobileNav = () => setShowMobileNav(prev => !prev);

  const handleSetShowMobileNavFalse = () => {
    setShowMobileNav((prev) => {
      if (prev === false) {
        return prev;
      }
      
      return false;
    });
  };

  const handleNavLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isModifiedClick(e)) {
      setAppIsLoading(true);
      console.log("click")
    };
  };

  const handleMobileNavLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(e)) {
      return;
    };
    
    setAppIsLoading(true)

    setTimeout(() => {
     requestAnimationFrame(() => handleSetShowMobileNavFalse());
    }, MIN_LOADING_INTERVAL * 1.5);
  };

  
  const handleIsOnCurrentPage = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(e)) {
      return;
    };

    setTimeout(() => {
      scrollToTop();
    }, MIN_LOADING_INTERVAL);

    setAppIsLoading(true);

    setTimeout(() => {
      setAppIsLoading(false);
    }, APP_ISLOADING_DELAY);
  };

  // useEffect for updating of scrollYPos
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          setScrollYPos((prev) => {
            if (prev === currentScrollY) {
              return prev;
            };

            prevScrollYPosRef.current = prev;
            return currentScrollY;
          });
          
          handleSetShowMobileNavFalse();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // useEffect to turn off appIsLoading on page load or after navigation
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
      return () => window.removeEventListener("load", handleLoad);
    }
  }, [pathname]);


  const contextValues = {
    appIsLoading, 
    setAppIsLoading,
    scrollYPos, 
    setScrollYPos,
    getPrevScrollYPosValue,
    showMobileNav, 
    setShowMobileNav,
    handleToggleMobileNav,
    handleNavLinkClick,
    handleSetShowMobileNavFalse,
    handleMobileNavLinkClick,
    handleIsOnCurrentPage,
    handleNavigateHome
  };

  return (
    <AppContext.Provider value={contextValues}>
      { children }
    </AppContext.Provider>
  );
};

export { 
  AppContext,
  AppContextProvider
};