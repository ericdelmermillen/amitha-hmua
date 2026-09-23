"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAppContext } from "@/hooks/hooks";
import { navPages } from "@/constants/navPages";
import ClientButton from "@/components/ClientButton/ClientButton";
import ColorModeToggle from "@/components/ColorModeToggle/ColorModeToggle";
import ClientLink from "@/components/ClientLink/ClientLink";
import NavSelect from "@/components/NavSelect/NavSelect";
import "./SideNav.scss";

const NAV_CLICK_DELAY = parseInt(process.env.NEXT_PUBLIC_NAV_CLICK_DELAY || "250", 10);

const SideNav = () => {
  const { 
    showSideNav, 
    setShowSideNav,
    handleIsOnSamePage,
    tags
  } = useAppContext();
  
  const pathname = usePathname();

  const handleSetShowSideNav = () => {
    setShowSideNav(false);
  };

  const handleSideNavLinkClick = () => {
    setTimeout(() => {
      setShowSideNav(false);
    }, NAV_CLICK_DELAY);
  };

  // useEffect to close modal after user nagivates to another tab/window and then returns
  useEffect(() => {
    if (!showSideNav) {
      return;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setShowSideNav(false);
      };
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSideNav(false);
        console.log("esc")
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSideNav, setShowSideNav]);

  return (
    <div className={`sideNav ${showSideNav ? "show" : ""}`}>
      <div className="sideNav__inner">

        <button 
          className="sideNav__close-button" 
          onClick={handleSetShowSideNav}
          type="button"
        >
          <div className="sideNav__close-icon"></div>
          <div className="sideNav__close-icon"></div>
        </button>
        
        <div className="sideNav__menu">
          <ul className="sideNav__links">
            <li className="sideNav__link">
              <NavSelect 
                selectOptions={tags} 
                modifierClass="side-nav"
              />
            </li>

            {navPages.map(({ href, modifierClass, pageName }) => href.startsWith("/") 
            
              ? (
                <li 
                  key={href} 
                  className={`sideNav__link sideNav__link--${modifierClass}`}
                  onClick={pathname !== href
                    ? handleSideNavLinkClick
                    : handleIsOnSamePage
                  }
                >
                  <ClientLink href={href}>
                    {pageName}
                  </ClientLink>
                </li>
                ) 
              : (
                  <li 
                    className={`sideNav__link sideNav__link--${modifierClass}`}
                    key={href}
                  >
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {pageName}
                    </a>
                  </li>
                )
            )}

            <li className="sideNav__logOut">
              <ClientButton 
                text="Logout"
                variant="rounded"
                buttonType="logOut"
              />
            </li>
            <li className="sideNav__colorModeToggler">
              <ColorModeToggle inputId={"sideNavColorModeToggle"} />
            </li>
          </ul>

        </div>
      </div>
    </div>
  );
};

export default SideNav;