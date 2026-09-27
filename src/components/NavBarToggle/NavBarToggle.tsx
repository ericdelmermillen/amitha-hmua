"use client";

import { useAppContext } from "@/hooks/hooks";
import "./NavBarToggle.scss";

const NavBarToggle = () => {
  const { 
    showSideNav, 
    handleToggleSideNav,
    setShowTouchOffDiv
  } = useAppContext();

  const handleToggle = () => {
    setShowTouchOffDiv(prev => !prev);
    handleToggleSideNav();
    console.log("navBarToggle")
  };

  return (
    <button 
      className={`navBarToggle ${showSideNav ? "open" : ""}`}
      onClick={handleToggle}
      type="button"
    >
      <div className="navBarToggle__icon"></div>
      <div className="navBarToggle__icon"></div>
      <div className="navBarToggle__icon"></div>
    </button>
  );
};

export default NavBarToggle;