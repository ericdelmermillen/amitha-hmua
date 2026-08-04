"use client";

import { SideNavProps } from "@/typing/interfaces";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/hooks/hooks";
import { navPages } from "@/constants/navPages";
import ClientButton from "../ClientButton/ClientButton";
import ColorModeToggle from "../ColorModeToggle/ColorModeToggle";
import ClientLink from "../ClientLink/ClientLink";
import NavSelect from "../NavSelect/NavSelect";
import "./SideNav.scss";


// useEffect to close the sideNav when the user comes back from instagram

const NAV_CLICK_DELAY = Number(process.env.NEXT_PUBLIC_NAV_CLICK_DELAY);

const SideNav = ({ handleLogOut }: SideNavProps) => {
  const { 
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
                    className="sideNav__link sideNav__link--instagram"
                    key={page.href}
                  >
                    <a 
                      href={page.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
    </>
  )};

export default SideNav;