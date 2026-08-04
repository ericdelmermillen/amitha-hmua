"use client";

import { type MouseEvent } from "react";
import { useAppContext } from "@/hooks/hooks";
import { usePathname } from "next/navigation";
import { navPages } from "@/constants/navPages";
import ClientButton from "../ClientButton/ClientButton";
import ClientLink from "../ClientLink/ClientLink";
import ColorModeToggle from "../ColorModeToggle/ColorModeToggle";
import Logo from "@/assets/icons/Logo";
import NavBarToggle from "@/components/NavBarToggle/NavBarToggle";
import NavSelect from "@/components/NavSelect/NavSelect"
import "./Nav.scss";

const Nav = () => {
  const { 
    // setAppIsLoading, 
    scrollYPos, 
    getPrevScrollYPosValue,
    handleNavLinkClick, 
    handleIsOnCurrentPage,
    handleIsOnSamePage,
    setSelectedTag,
    setSelectValue,
    setShowNavSelectOptions,
    tags
     } = useAppContext();

  const pathname = usePathname();
  const isOnHome = pathname === "/work";

  const handleIsOnHome = (e: MouseEvent<HTMLAnchorElement>) => {
    setSelectedTag(null);
    setSelectValue(null);
    setShowNavSelectOptions(false);
    handleIsOnCurrentPage(e);
  };

  return (
    <>
      <nav 
        id="nav"
        className={`nav ${getPrevScrollYPosValue() < scrollYPos && scrollYPos > 50 
          ? "hide" 
          : ""}`
      }>
        <div className="nav__content">

          <ClientLink 
            href="/work" 
            scroll={false}
            onClick={isOnHome ? handleIsOnHome : handleNavLinkClick}
          >
            <div className="nav__logo">
              <Logo className={"nav__logo--icon"}/>
            </div>
          </ClientLink>

          <ul className="nav__links">

            <NavSelect 
              selectOptions={tags}
            />

            {navPages.map((page) => page.href.startsWith("/") 
              
              ? (
                <li key={page.href} className={`nav__link nav__link${page.modifierClass}`}>
                  <ClientLink 
                    href={page.href}
                    onClick={pathname !== page.href
                      ? handleNavLinkClick
                      : handleIsOnSamePage}
                  >
                    {page.pageName}
                  </ClientLink>
                </li>
                ) 
              : (
                <li
                  key={page.href}
                  className="nav__link nav__link--instagram"
                >
                  <a
                    href={page.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`nav__link nav__link${page.modifierClass}`}
                  >
                    {page.icon && <page.icon className="nav__link--instagram" />}
                  </a>
                </li>
                )
            )}
            
            <li className="nav__link nav__link--colorMode">
              <ColorModeToggle inputId={"navColorModeToggle"}/>
            </li>

          </ul>
          <div className="nav__logOut">
            <ClientButton 
              text="Logout"
              variant="rounded"
              buttonType="logOut"
              />
          </div>
          <NavBarToggle />
        </div>
      </nav>
    </>
  );
};

export default Nav;