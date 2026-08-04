"use client";

import { type MouseEvent, useState,  useRef, useEffect, createContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { scrollToTop, isModifiedClick, normalizeCasing } from "@/utils/utils";
import { AppContextProviderProps, AppContextValue } from "@/typing/interfaces";
import { Tag } from "@/typing/interfaces";
import { toast } from "react-toastify";

const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);
const APP_ISLOADING_DELAY = Number(process.env.NEXT_PUBLIC_APP_ISLOADING_DELAY);
const NAV_CLICK_DELAY = Number(process.env.NEXT_PUBLIC_NAV_CLICK_DELAY);

const AppContext = createContext<AppContextValue | undefined>(undefined);

const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [ scrollYPos, setScrollYPos ] = useState(0);

  const [ isOrderEditable, setIsOrderEditable ] = useState(false);
  
  const [ appIsLoading, setAppIsLoading ] = useState(true)
  
  const [ isLoggedIn, setIsLoggedIn ] = useState(true)
  
  const [ showSideNav, setShowSideNav ] = useState(false);
  const [ showTouchOffDiv, setShowTouchOffDiv ] = useState(false);
  
  const [ selectValue, setSelectValue ] = useState<string | null>(null);
  const [ showNavSelectOptions, setShowNavSelectOptions ] = useState(false);
  const [ selectedTag, setSelectedTag ] = useState<Tag | null>(null);

  const prevScrollYPosRef = useRef<number | null>(null);
  const getPrevScrollYPosValue = () => prevScrollYPosRef.current ?? 0;

  const pathname = usePathname();
  const router = useRouter();


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
    setIsOrderEditable(false);

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
    setAppIsLoading(true);
    setSelectedTag(null);
    setSelectValue(null);
    setShowNavSelectOptions(false);
    setShowTouchOffDiv(false);
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


    // const handleDeleteOrEditClick = (e, action, shoot_id = null) => {
    //   e.preventDefault();
    //   e.stopPropagation();
    //   setShowDeleteOrEditModal(true);
    //   setDeleteOrEditClickAction(action);
      
    //   if (shoot_id) {
    //     setSelectedShoot(shoot_id);
    //   };
    // };


    const handleEditBio = () => {
      // needs to open the modal in the appropriate mode only
      console.log("Edit Bio?")

    }

    const handleLogoutUser = () => {
      // needs to open the modal in the appropriate mode only
      console.log("Logout?")
      setIsLoggedIn(false);
      toast.success("Logging you out...")
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
    handleEditBio,
    handleLogoutUser
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