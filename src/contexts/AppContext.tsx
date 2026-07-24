"use client";

import { 
  type Dispatch, 
  type SetStateAction,
  type MouseEvent,
  useState, 
  useRef, 
  useEffect, 
  createContext
 } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  addClassToDiv, 
  removeClassFromDiv, 
  scrollToTop, 
  isModifiedClick
 } from "@/utils/utils";
import { AppContextProviderProps, AppContextValue } from "@/typing/interfaces";
import { Tag } from "@/typing/interfaces";


const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);
const APP_ISLOADING_DELAY = Number(process.env.NEXT_PUBLIC_APP_ISLOADING_DELAY);

const AppContext = createContext<AppContextValue | undefined>(undefined);

const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [ appIsLoading, setAppIsLoading ] = useState(false);
  const [ scrollYPos, setScrollYPos ] = useState(0);


  const [ selectedTag, setSelectedTag ] = useState(null);
  const [ isOrderEditable, setIsOrderEditable ] = useState(false);


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
      };
      
      return false;
    });
  };

  const handleNavLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isModifiedClick(e)) {
      handleSetShowIsLoadingTrue(setAppIsLoading, "appIsLoading");
    };
  };

  const handleMobileNavLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(e)) {
      return;
    };
    
    handleSetShowIsLoadingTrue(setAppIsLoading, "appIsLoading");

    setTimeout(() => {
     requestAnimationFrame(() => handleSetShowMobileNavFalse());
    }, MIN_LOADING_INTERVAL * 1.5);
  };

  const handleSetShowIsLoadingTrue = (
    isLoadingStateSetter: Dispatch<SetStateAction<boolean>>,
  divId: string
  ) => {
    isLoadingStateSetter(true);

    removeClassFromDiv(divId, "hide");
    addClassToDiv(divId, "show");
  };
  
  const handleSetShowIsLoadingFalse = (
    isLoadingStateSetter: Dispatch<SetStateAction<boolean>>, divId: string) => {
    
    setTimeout(() => {
      removeClassFromDiv(divId, "show");
      isLoadingStateSetter(false);
    }, APP_ISLOADING_DELAY);

    setTimeout(() => {
      addClassToDiv(divId, "hide");
    }, APP_ISLOADING_DELAY * 2);
  };

  const handleIsOnCurrentPage = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(e)) {
      return;
    };

    // timeout test fix for not scrolling to top on home
    setTimeout(() => {
      scrollToTop();
    }, MIN_LOADING_INTERVAL);

    handleSetShowIsLoadingTrue(setAppIsLoading, "appIsLoading");

    setTimeout(() => {
      handleSetShowIsLoadingFalse(setAppIsLoading, "appIsLoading");
    }, APP_ISLOADING_DELAY);
  };

  // useEffect for updating of scrollYPos
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // 💡 Value Guard: Only trigger an update if the pixel position actually changed!
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
      };
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // Safe to leave empty now because everything uses functional updates
  
  // useEffect to turn off appIsLoading on page load after navigation
  useEffect(() => {
    const handleLoad = () => {
      handleSetShowIsLoadingFalse(setAppIsLoading, "appIsLoading");
    };

    if (document.readyState === "complete") {
      scrollToTop();
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    };
  }, [pathname]);


  const contextValues = {
    appIsLoading, 
    setAppIsLoading,
    handleSetShowIsLoadingTrue,
    handleSetShowIsLoadingFalse,
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