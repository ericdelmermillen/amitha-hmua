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
    scrollYPos, 
    getPrevScrollYPosValue,
    handleIsOnSamePage,
    handleNavigateHome,
    setNavSelectValue,
    setShowNavSelectOptions,
    setShowSideNav,
    tags
    } = useAppContext();

  const pathname = usePathname();
  const isOnHome = pathname === "/work";

  const handleIsOnHome = (e: MouseEvent<HTMLAnchorElement>) => {
    setNavSelectValue(null);
    setShowNavSelectOptions(false);
    handleIsOnSamePage(e);
    setShowSideNav(false);
  };

  return (
    <nav 
      id="nav"
      className={`nav ${getPrevScrollYPosValue() < scrollYPos && scrollYPos > 50 ? "hide" : ""}`}
    >
      <div className="nav__content">

        <ClientLink 
          href="/work" 
          scroll={false}
          onClick={isOnHome ? handleIsOnHome : () => handleNavigateHome}
        >
          <div className="nav__logo">
            <Logo className={"nav__logo--icon"}/>
          </div>
        </ClientLink>

        <ul className="nav__links">

          <NavSelect selectOptions={tags} />

          {navPages.map(({ href, modifierClass, pageName, icon: Icon }) => href.startsWith("/") 
            
            ? (
              <li key={href} className={`nav__link nav__link${modifierClass}`}>
                <ClientLink 
                  href={href}
                  onClick={pathname === href
                    ? handleIsOnSamePage
                    : undefined
                  }
                >
                  {pageName}
                </ClientLink>
              </li>
              ) 
            : (
              <li
                key={href}
                className="nav__link nav__link--instagram"
              >
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`nav__link nav__link${modifierClass}`}
                >
                  {Icon && <Icon className="nav__link--instagram" />}
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
  );
};

export default Nav;