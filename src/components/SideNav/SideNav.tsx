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

const NAV_CLICK_DELAY = Number(process.env.NEXT_PUBLIC_NAV_CLICK_DELAY);

const SideNav = () => {
  const { 
    showSideNav, 
    setShowSideNav,
    handleNavLinkClick,
    handleIsOnSamePage,
    tags
  } = useAppContext();
  
  const pathname = usePathname();

  const handleSetShowSideNav = () => {
    setShowSideNav(false);
  };

  const handleSideNavLinkClick = () => {
    handleNavLinkClick();
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

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [showSideNav, setShowSideNav]);

  return (
    <div className={`sideNav ${showSideNav ? "show" : ""}`}>
      <div className="sideNav__inner">

        <div 
          className="sideNav__close-button" 
          onClick={handleSetShowSideNav}
        >
          <div className="sideNav__close-icon"></div>
          <div className="sideNav__close-icon"></div>
        </div>
        
        <div className="sideNav__menu">
          <ul className="sideNav__links">
            <li className="sideNav__link">
              <NavSelect 
                selectOptions={tags} 
                modifierClass="side-nav"
              />
            </li>

            {navPages.map((page) => page.href.startsWith("/") 
            
              ? (
                <li 
                  key={page.href} 
                  className={`sideNav__link sideNav__link"${page.modifierClass}`}
                  onClick={pathname !== page.href
                    ? handleSideNavLinkClick
                    : handleIsOnSamePage
                  }
                >
                  <ClientLink href={page.href}>
                    {page.pageName}
                  </ClientLink>
                </li>
                ) 
              : (
                  <li 
                    className={`sideNav__link sideNav__link${page.modifierClass}`}
                    key={page.href}
                  >
                    <a href={page.href} target="_blank" rel="noopener noreferrer">
                      {page.pageName}
                    </a>
                  </li>
                )
            )}

            <div className="sideNav__logOut">
              <ClientButton 
                text="Logout"
                variant="rounded"
                buttonType="logOut"
              />
            </div>
            <li className="sideNav__colorModeToggler">
              <ColorModeToggle inputId={"sideNavColorModeToggle"} />
            </li>
          </ul>

        </div>
      </div>
    </div>
  )};

export default SideNav;