"use client";

import { useAppContext } from "@/hooks/hooks";
import "./NavBarToggle.scss";

const NavBarToggle = () => {
  const { 
    showSideNav, 
    setShowSideNav, 
  } = useAppContext();

  const handleToggle = () => setShowSideNav(prev => !prev);

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