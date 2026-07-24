"use client";

import type { ReactNode } from "react";
import { useAppContext } from "@/hooks/hooks";
import Instagram from "@/assets/icons/Instagram";
import Logo from "@/assets/icons/Logo";
import NavLink from "../NavLink/NavLink";
import "./Nav.scss";
import ColorModeToggle from "../ColorModeToggle/ColorModeToggle";


type NavProps = {
  children?: ReactNode;
};



const Nav = ({  }: NavProps) => {
    const { 
    // isLoggedIn, 
    // setShowSideNav,
    // scrollYPos, 
    // getPrevScrollYPosValue,
    // tags, 
    // handleNavigateHome,
    // handleSetShowSideNav,
    // handleNavLinkClick
   } = useAppContext();

  return (
    <>
      <nav id="nav" className="nav">
        <div className="nav__inner">

          <NavLink 
            href={'/work'}
            // onClick={handleHomeClick}
          >
            <div 
              className="nav__logo"
            > 
              <Logo className={"nav__logo--icon"}/>
            </div> 
          </NavLink>

          <ul className="nav__links">

          </ul>
            <NavLink 
              href={'/bio'}
              // onClick={handleNavLinkClick}
            >
              <li className="nav__link nav__link--bio">
                Bio
              </li>
            </NavLink>

            <NavLink 
              href={'/contact'}
              // onClick={handleNavLinkClick}
            >
              <li className="nav__link">
                Contact
              </li>
            </NavLink>
            <a href="https://www.instagram.com/amitha_hmua/" target="_blank">
              <li className="nav__link nav__link--instagram">
                <Instagram className="nav__link--instagram" />
              </li>
            </a>
            <li className="nav__link nav__link--colorMode">
              <ColorModeToggle inputId={"navColorModeToggle"}/>
            </li>
          
          <div 
            className="nav__toggle-button" 
            aria-label="Toggle Menu"
            // onClick={handleSetShowSideNav}
          >
            <div className="nav__toggle-icon"></div>
            <div className="nav__toggle-icon"></div>
            <div className="nav__toggle-icon"></div>
          </div>

        </div>
      </nav>
    </>
  );
};

export default Nav;