"use client";

import { useAppContext } from "@/hooks/hooks";
import { toast } from "react-toastify";
import { SideNavProps } from "@/typing/interfaces";
import ColorModeToggle from "../ColorModeToggle/ColorModeToggle";
// import NavSelect from "../NavSelect/NavSelect.jsx";
import { navPages } from "@/constants/navPages";
import "./SideNav.scss";
import ClientLink from "../ClientLink/ClientLink";

import { usePathname } from "next/navigation";
import NavSelect from "../NavSelect/NavSelect";


// useEffect to close the sideNav when the user comes back from instagram

const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);
const NAV_CLICK_DELAY = Number(process.env.NEXT_PUBLIC_NAV_CLICK_DELAY);

const SideNav = ({ handleLogOut }: SideNavProps) => {
  const { 
    isLoggedIn, 
    showSideNav, 
    setShowSideNav,
    handleNavLinkClick,
    handleIsOnSamePage,
    tags, 
    setShowTouchOffDiv
  } = useAppContext();
  
  const pathname = usePathname();
  // const navigate = useNavigate();

  const handleSetShowSideNav = () => {

    console.log("first")
    setShowSideNav(false);
  }

  const handleSideNavLinkClick = () => {
    handleNavLinkClick();
    setTimeout(() => {
      setShowSideNav(false);
    }, NAV_CLICK_DELAY);
  };


  const handleSideNavLogout = () => {
    setTimeout(() => {
      // handleLogOut();
    }, 500);
    setShowSideNav(false);
  };

  return (
    <>
      <div 
        className={`sideNav ${showSideNav 
          ? "show" 
          : ""}`}
      >
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
                <NavSelect selectOptions={tags} modifierClass="side-nav"/>
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
                  <ClientLink 
                    href={page.href}
                  >
                    {page.pageName}
                  </ClientLink>
                </li>
                ) 
              : (
                <li
                  key={page.href}
                  className="sideNav__link sideNav__link--instagram"
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



              {/* <li 
                className="sideNav__link"
                onClick={handleNavLinkBio}
              >
                BIO
              </li>
              <li 
                className="sideNav__link"
                onClick={handleNavLinkContact}
              >
                CONTACT
              </li>
              <a href="https://www.instagram.com/amitha_hmua/" target="_blank">
                <li 
                  className="sideNav__link"
                  onClick={() => setShowSideNav(false)}
                  >
                    INSTAGRAM
                </li>
              </a> */}
              {isLoggedIn &&
                <li className="sideNav__link">
                  <h4 
                    className="sideNav__logout"
                    onClick={handleSideNavLogout}
                  >
                    Logout
                  </h4>
                </li>
              }
              <li className="sideNav__colorModeToggler">
                <ColorModeToggle inputId={"sideNavColorModeToggle"} />
              </li>
            </ul>

          </div>

        </div>
      </div>
    </>
  )};

export default SideNav;