"use client";

import { usePathname, useRouter } from "next/navigation";
import { 
  type MouseEvent, 
  useState,  
  useRef, 
  useEffect, 
  createContext 
} from "react";
import { 
  type AppContextValue, 
  type ChooserItem, 
  type ContextProviderProps, 
  type ShootEntity,
  type ShootSummary,
} from "@/typing/interfaces";
import { type TypeOptions, toast } from "react-toastify";
import { checkUserSession, logoutUser } from "@/actions/authActions";
import { getAllTags } from "@/actions/tagActions";
import { isModifiedClick, normalizeCasing, scrollToTop, syncChoosers } from "@/utils/utils";

const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);
const APP_ISLOADING_DELAY = Number(process.env.NEXT_PUBLIC_APP_ISLOADING_DELAY);

const AppContext = createContext<AppContextValue | undefined>(undefined);

const AppContextProvider = ({ children }: ContextProviderProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const [ scrollYPos, setScrollYPos ] = useState(0);
  const [ appIsLoading, setAppIsLoading ] = useState(true)
  
  const [ showSideNav, setShowSideNav ] = useState(false);
  
  const [ selectedTag, setSelectedTag ] = useState<ShootEntity | null>(null);
  const [ navSelectValue, setNavSelectValue ] = useState<string | null>(null);
  const [ showNavSelectOptions, setShowNavSelectOptions ] = useState(false);
  
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);
  
  const [ tags, setTags ] = useState<ShootEntity[]>([]);
  const [ tagChoosers, setTagChoosers ] = useState<ChooserItem[]>([{ number: 1, id: null, name: null}]);
  
  const [ shoots, setShoots ] = useState<ShootSummary[]>([]);
  const [ shouldUpdateShoots, setShouldUpdateShoots ] = useState(false);
  const [ currentShootsPage, setCurrentShootsPage ] = useState(1);
  const [ finalShootsPageLoaded, setFinalShootsPageLoaded ] = useState(false);
  
  const [ shouldRefreshTags, setShouldRefreshTags ] = useState(true);
  const [ shouldRefreshModels, setShouldRefreshModels ] = useState(true);
  const [ shouldRefreshPhotographers, setShouldRefreshPhotographers ] = useState(true);

  const [ shootOrderIsEditable, setShootOrderIsEditable ] = useState(false);
  
  const prevScrollYPosRef = useRef<number | null>(null);

  const [ showFloatingButton, setShowFloatingButton ] = useState<boolean>(
    !pathname.includes("edit") && !pathname.includes("add")
  );
    
  const getPrevScrollYPosValue = () => prevScrollYPosRef.current ?? 0;

  const handleSideNavLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(e)) {
      return;
    }
    
    handleClearAppState();
  };

  const handleSetShowSideNavFalse = () => {
    setShowSideNav(false);
  };

  const handleRefreshShoots = () => {
    setShoots([]);
    setFinalShootsPageLoaded(false);
    setCurrentShootsPage(1);
    setShouldUpdateShoots(true);
  };

  const handleNavigateToAddShoot = () => {
    setShouldRefreshModels(true);
    setShouldRefreshPhotographers(true);
    handleClearAppState();
    router.push("/shoot/add");
  };

  const handleNavigateToEditShoot = (id: number | null) => {
    setNavSelectValue(null);
    setShouldRefreshModels(true);
    setShouldRefreshPhotographers(true);
    router.push(`/shoot/edit/${id}`);
  };

  const handleNavigateHome = (tagObj?: ShootEntity) => {
    if (!tagObj) {
      router.push("/work");
    } else if (tagObj) {
      router.push(`/work?tag=${normalizeCasing(tagObj.name)}`);
    }
  };

  const handleIsOnSamePage = (e?: MouseEvent<HTMLElement>) => {
    if (e && isModifiedClick(e)) {
      return;
    }
    
    setAppIsLoading(true);
    scrollToTop();
    handleClearAppState();
  };

  const handleLogoutUser = async (
    messageOrEvent?: MouseEvent<HTMLElement> | string,
    messageType: TypeOptions = "success"
  ) => {
    const finalMessage =
      typeof messageOrEvent === "string" && messageOrEvent.length > 0
        ? messageOrEvent
        : "Logging you out...";

    try {
      const response = await logoutUser(finalMessage);

      if (response.success) {
        toast(response.message, { type: messageType });
        handleClearAppState(true);
        handleRefreshShoots();

        if (pathname === "/work") {
          router.refresh();
        } else {
          router.replace("/work");
        }
        
      } else {
        console.error(response.message);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Network or client error during logout:", error);
    }
  };

  const handleClearAppState = (logOutUser = false) => {
    setAppIsLoading(true);

    if (logOutUser) {
      setIsLoggedIn(false);
    }
    
    setTagChoosers([{ number: 1, id: null, name: null }]);
    setNavSelectValue(null);
    setShowNavSelectOptions(false);
    setShootOrderIsEditable(false);
    setShouldUpdateShoots(true);
    setFinalShootsPageLoaded(false);
    setCurrentShootsPage(1);

    setTimeout(() => {
      setShowSideNav(false);
      setAppIsLoading(false);
    }, MIN_LOADING_INTERVAL * 2);
  };

  // useEffect to grab tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await getAllTags();

        if (response?.success && Array.isArray(response.tags)) {
          setTags(response.tags);
          setTagChoosers(prev => syncChoosers(prev, response.tags));
        } else {
          throw new Error(response?.message || "Failed to retrieve tags");
        }
      } catch (error: any) {
        console.error("Error fetching tags:", error);
        toast.error(error.message)
      } finally {
        setShouldRefreshTags(false);
      }
    };

    if (shouldRefreshTags) {
      fetchTags();
    }
  }, [shouldRefreshTags]);

  // useEffect to catch auth failures triggered by middleware redirect
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const match = document.cookie.match(/(?:^|; )\s*auth_flash=([^;]*)/);

    if (match && match[1] === "expired") {
      // Immediately clear the cookie so it only triggers once
      document.cookie = "auth_flash=; path=/; max-age=0";
      handleLogoutUser("Authentication failed. Logging you out...", "error");
    }
  }, [pathname]);

  // useEffect to turn off appIsLoading on page load or after navigation
  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => {
        setAppIsLoading(false);
      }, APP_ISLOADING_DELAY);
    };

    // what is the readyState on the document?
    if (document.readyState === "complete") {
      scrollToTop();
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, [pathname]);

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
          setShowNavSelectOptions(false);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // useEffect to update showFloatingButton on page navigation
  useEffect(() => {
    if (!pathname.includes("edit") && !pathname.includes("add") && !pathname.includes("login")) {
      setShowFloatingButton(true);
    } else {
      setShowFloatingButton(false);
    }
  }, [pathname]);

  // useEffect to check user session and set isLoggedIn state
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { isAuthenticated } = await checkUserSession();
        setIsLoggedIn(isAuthenticated);
      } catch (error) {
        console.error("Session check failed:", error);
        setIsLoggedIn(false);
      }
    };

    verifySession();
  }, []);

  const contextValues: AppContextValue = {
    // auth & session
    isLoggedIn, 
    setIsLoggedIn,
    handleLogoutUser,
    // route & app loading state
    appIsLoading, 
    setAppIsLoading,
    handleClearAppState,
    handleNavigateHome,
    handleNavigateToAddShoot,
    handleNavigateToEditShoot,
    handleIsOnSamePage,
    // ui navigation & drawers
    showSideNav, 
    setShowSideNav,
    handleSetShowSideNavFalse,
    handleSideNavLinkClick,
    showFloatingButton, 
    setShowFloatingButton,
    // nav select & tag filtering
    navSelectValue, 
    setNavSelectValue,
    showNavSelectOptions, 
    setShowNavSelectOptions,
    selectedTag, 
    setSelectedTag,
    // scroll position tracking
    scrollYPos, 
    setScrollYPos,
    getPrevScrollYPosValue,
    // tags data
    tags, 
    setTags,
    tagChoosers, 
    setTagChoosers,
    shouldRefreshTags,
    setShouldRefreshTags,
    // shoots data & pagination
    shoots, 
    setShoots,
    currentShootsPage, 
    setCurrentShootsPage,
    finalShootsPageLoaded, 
    setFinalShootsPageLoaded,
    shouldUpdateShoots, 
    setShouldUpdateShoots,
    shootOrderIsEditable, 
    setShootOrderIsEditable,
    handleRefreshShoots,
    // related entity refresh flags
    shouldRefreshModels, 
    setShouldRefreshModels,
    shouldRefreshPhotographers, 
    setShouldRefreshPhotographers,
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