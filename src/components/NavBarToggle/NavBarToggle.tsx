"use client";

import { useAppContext } from "../../hooks/hooks";
import "./NavBarToggle.scss";

const NavBarToggle = () => {
  const { 
    showSideNav, 
    handleToggleSideNav,
    setShowTouchOffDiv
  } = useAppContext();

  const handleToggle = () => {
    setShowTouchOffDiv(true);
    handleToggleSideNav();
  };

  return (
    <>
      <button 
        type="button"
        className={`navBarToggle ${showSideNav ? "open" : ""}`}
        aria-label="Toggle Menu"
        onClick={handleToggle}
      >
        <div className="navBarToggle__icon"></div>
        <div className="navBarToggle__icon"></div>
        <div className="navBarToggle__icon"></div>
      </button>
    </>
  );
};

export default NavBarToggle;
  