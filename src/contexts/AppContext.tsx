"use client";

import { 
  type MouseEvent, 
  useState,  
  useRef, 
  useEffect, 
  createContext 
} from "react";
import { usePathname, useSearchParams,useRouter } from "next/navigation";
import { AppContextValue, ContextProviderProps, ShootSummary } from "@/typing/interfaces";
import { isModifiedClick, normalizeCasing, scrollToTop } from "@/utils/utils";
import { Tag } from "@/typing/interfaces";
import { type TypeOptions, toast } from "react-toastify";
import { checkUserSession, logoutUser } from "@/actions/authActions";
import { getAllTags } from "@/actions/tagActions";

const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);
const APP_ISLOADING_DELAY = Number(process.env.NEXT_PUBLIC_APP_ISLOADING_DELAY);
const NAV_CLICK_DELAY = Number(process.env.NEXT_PUBLIC_NAV_CLICK_DELAY);


const AppContext = createContext<AppContextValue | undefined>(undefined);

const AppContextProvider = ({ children }: ContextProviderProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [ scrollYPos, setScrollYPos ] = useState(0);
  const [ appIsLoading, setAppIsLoading ] = useState(true)
  
  const [ showSideNav, setShowSideNav ] = useState(false);
  const [ showTouchOffDiv, setShowTouchOffDiv ] = useState(false);
  
  const [ selectedTag, setSelectedTag ] = useState<Tag | null>(null);
  
  const [ selectValue, setSelectValue ] = useState<string | null>(null);
  const [ showNavSelectOptions, setShowNavSelectOptions ] = useState(false);
  
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);

  const [ tags, setTags ] = useState<Tag[]>([]);
  
  const [ shoots, setShoots ] = useState<ShootSummary[]>([]);
  const [ shouldUpdateShoots, setShouldUpdateShoots ] = useState(false);
  const [ currentShootsPage, setCurrentShootsPage ] = useState(1);
  const [ finalShootsPageLoaded, setFinalShootsPageLoaded ] = useState(false);
  
  const [ shouldRefreshTags, setShouldRefreshTags ] = useState(true);

  const [ shootOrderIsEditable, setShootOrderIsEditable ] = useState(false);
  
  const prevScrollYPosRef = useRef<number | null>(null);

  const [ showFloatingButton, setShowFloatingButton ] = useState<boolean>(
    !pathname.includes("edit") && !pathname.includes("add")
  );
    
  const getPrevScrollYPosValue = () => prevScrollYPosRef.current ?? 0;

  const handleRefreshShoots = () => {
    setShoots([]);
    setFinalShootsPageLoaded(false);
    setCurrentShootsPage(1);
    setShouldUpdateShoots(true);
  };

  const handleNavigateToAddShoot = () => {
    setAppIsLoading(true);
    setSelectedTag(null);
    setSelectValue(null);
    router.push("/shoot/add");
  };

  const handleNavigateToEditShoot = (id: number | null) => {
    setSelectedTag(null);
    setSelectValue(null);
    router.push(`/shoot/edit/${id}`);
  };

  const handleTouchOffDiv = () => {
    setShowTouchOffDiv(false);
    setShowSideNav(false);
    setShowNavSelectOptions(false);
    setAppIsLoading(false);
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
    // setShowTouchOffDiv(false);
    // setAppIsLoading(true);
    // setSelectedTag(null);
    // setSelectValue(null);
    // setShowNavSelectOptions(false);
    // setShowTouchOffDiv(false);
    // setShowSideNav(false);
    // setShouldUpdateShoots(true);
    handleClearAppState();
};

  const handleSideNavLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(e)) {
      return;
    };
    
    handleClearAppState();

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


  const handleLogoutUser = async (
    messageOrEvent?: unknown,
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
        router.replace("/work");
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
    
    setShowSideNav(false);
    setShowTouchOffDiv(false);
    setSelectedTag(null);
    setSelectValue(null);
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

        if (response.success) {
          const updatedTags = response.tags.map((tag) => (
            { ...tag,
              tagName: tag.tagName.toUpperCase()
          }));

          setTags(updatedTags);
        }
      } catch (error) {
        console.error("Error fetching tags in AppContext:", error);
      } finally {
        setShouldRefreshTags(false);
      }
    };

    if (shouldRefreshTags) {
      fetchTags();
    }
  }, [shouldRefreshTags]);

  // useEffect for tracking if user gets logged out on navigating to a protected rout and then redirected to /work?auth=false
  useEffect(() => {
    const authStatus = searchParams.get("auth");

    if (authStatus === "false") {
      handleLogoutUser("Authentication failed. Logging you out...", "error");
      // window.history.replaceState(null, "", pathname);
    }
  }, [searchParams, pathname]);


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

  // useEffect to update showFloatingButton on page navigation
  useEffect(() => {
    if (!pathname.includes("edit") && !pathname.includes("add")) {
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
        console.log(`isAuthenticated: ${isAuthenticated}`)
      } catch (error) {
        console.error("Session check failed:", error);
        setIsLoggedIn(false);
      }
    };

    verifySession();
  }, []);

  
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
    setTags,
    handleLogoutUser,
    shootOrderIsEditable, 
    setShootOrderIsEditable,
    showFloatingButton, 
    setShowFloatingButton,
    handleNavigateToAddShoot,
    handleNavigateToEditShoot,
    handleClearAppState,
    shouldRefreshTags,
    setShouldRefreshTags,
    shoots, 
    setShoots,
    shouldUpdateShoots, 
    setShouldUpdateShoots,
    currentShootsPage, 
    setCurrentShootsPage,
    finalShootsPageLoaded, 
    setFinalShootsPageLoaded,
    handleRefreshShoots
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