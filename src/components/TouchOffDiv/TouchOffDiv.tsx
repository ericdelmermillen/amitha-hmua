"use client";

import { useAppContext } from "@/hooks/hooks";
import "./TouchOffDiv.scss";

const TouchOffDiv = () => {
  const { 
    handleTouchOffDiv, 
    showTouchOffDiv 
  } = useAppContext();

  if (!showTouchOffDiv) {
    return null;
  }

  return (
    <div className={`touchOffDiv ${showTouchOffDiv ? "show" : ""}`} onClick={handleTouchOffDiv}/>
  );
};

export default TouchOffDiv;