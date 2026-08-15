"use client";

import { 
  type MouseEvent, 
  useState,  
  useRef, 
  useEffect, 
  createContext 
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppContextValue, ContextProviderProps } from "@/typing/interfaces";
import { isModifiedClick, normalizeCasing, scrollToTop } from "@/utils/utils";
import { Tag } from "@/typing/interfaces";
import { toast } from "react-toastify";

const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);
const APP_ISLOADING_DELAY = Number(process.env.NEXT_PUBLIC_APP_ISLOADING_DELAY);
const NAV_CLICK_DELAY = Number(process.env.NEXT_PUBLIC_NAV_CLICK_DELAY);


// need to get this from tagActions and store in state
const tags = [
  {id: 1, tagName: "COMMERCIAL"},
  {id: 2, tagName: "CREATIVE"},
  {id: 3, tagName: "STYLING"},
  {id: 4, tagName: "BEAUTY"},
  {id: 5, tagName: "WIGS"},
  {id: 6, tagName: "GROOMING"},
  {id: 7, tagName: "THEATER"},
  {id: 8, tagName: "CELEBRITIES"},
  {id: 9, tagName: "BRIDAL"},
  {id: 10, tagName: "FASHION"},
  {id: 11, tagName: "COSPLAY"},
  {id: 12, tagName: "DRAG"},
]

const AppContext = createContext<AppContextValue | undefined>(undefined);

const AppContextProvider = ({ children }: ContextProviderProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const [ scrollYPos, setScrollYPos ] = useState(0);
  const [ appIsLoading, setAppIsLoading ] = useState(true)
  
  const [ showSideNav, setShowSideNav ] = useState(false);
  const [ showTouchOffDiv, setShowTouchOffDiv ] = useState(false);
  
  const [ selectedTag, setSelectedTag ] = useState<Tag | null>(null);
  
  const [ selectValue, setSelectValue ] = useState<string | null>(null);
  const [ showNavSelectOptions, setShowNavSelectOptions ] = useState(false);
  
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);

  const [ shootOrderIsEditable, setShootOrderIsEditable ] = useState(false);
  
  const prevScrollYPosRef = useRef<number | null>(null);

  const [ showFloatingButton, setShowFloatingButton ] = useState<boolean>(
    !pathname.includes("edit") && !pathname.includes("add")
  );
    
  const getPrevScrollYPosValue = () => prevScrollYPosRef.current ?? 0;


  const handleNavigateToAddShoot = () => {
    setSelectedTag(null);
    setSelectValue(null);
    router.push("/shoot/add");
  };

  const handleTouchOffDiv = () => {
    setShowTouchOffDiv(false);
    setShowSideNav(false);
    setShowNavSelectOptions(false);
  };

  const handleNavigateHome = (tagObj?: Tag) => {   
    if (!tagObj) {
      router.push("/work");
      setSelectedTag(null);
    } else if (tagObj) {
      router.push(`/work?tag=${normalizeCasing(tagObj.tagName)}`);
    };
    setShootOrderIsEditable(false);

    // won't need this; will be set to false when page content loads
    setTimeout(() => {
      setAppIsLoading(false);
    }, MIN_LOADING_INTERVAL);
  };
  
  const handleToggleSideNav = () => setShowSideNav(prev => !prev);

  const handleSetShowSideNavFalse = () => {
    setShowSideNav((prev) => {
      if (prev === false) {
        return prev;
      }
      
      return false;
    });
  };
  
  const handleNavLinkClick = () => {
    setShowTouchOffDiv(false);
    setAppIsLoading(true);
    setSelectedTag(null);
    setSelectValue(null);
    setShowNavSelectOptions(false);
    setShowTouchOffDiv(false);
    setShowSideNav(false);
};

  const handleSideNavLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(e)) {
      return;
    };
    
    setAppIsLoading(true)

    setTimeout(() => {
     requestAnimationFrame(() => handleSetShowSideNavFalse());
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

  const handleIsOnSamePage = () => {
    setShowTouchOffDiv(false);
    setShowNavSelectOptions(false);

    setTimeout(() => {
      setShowSideNav(false);
      setAppIsLoading(false);
    }, NAV_CLICK_DELAY);

    setTimeout(() => {
      scrollToTop();
    }, MIN_LOADING_INTERVAL);
  };

  const handleLogoutUser = () => {
    console.log("Logout?")
    setIsLoggedIn(false);
    setShowSideNav(false);
    toast.success("Logging you out...")
    router.push("/work");
  }

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
          
          handleSetShowSideNavFalse();
          setShowTouchOffDiv(false);
          setShowNavSelectOptions(false);
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
    isLoggedIn, 
    setIsLoggedIn,
    scrollYPos, 
    setScrollYPos,
    getPrevScrollYPosValue,
    showSideNav, 
    setShowSideNav,
    handleToggleSideNav,
    handleNavLinkClick,
    handleSetShowSideNavFalse,
    handleSideNavLinkClick,
    handleIsOnCurrentPage,
    handleNavigateHome,
    handleIsOnSamePage,
    selectValue, 
    setSelectValue,
    selectedTag, 
    setSelectedTag,
    handleTouchOffDiv,
    showTouchOffDiv, 
    setShowTouchOffDiv,
    showNavSelectOptions, 
    setShowNavSelectOptions,
    tags,
    handleLogoutUser,
    shootOrderIsEditable, 
    setShootOrderIsEditable,
    showFloatingButton, 
    setShowFloatingButton,
    handleNavigateToAddShoot
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