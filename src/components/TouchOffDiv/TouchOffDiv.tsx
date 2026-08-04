"use client";

import { useAppContext } from "@/hooks/hooks";
import "./TouchOffDiv.scss";

const TouchOffDiv = () => {
  const { 
    handleTouchOffDiv, 
    showTouchOffDiv 
  } = useAppContext();

  return (
    <>
      <div className={`touchOffDiv ${showTouchOffDiv ? "show" : ""}`} onClick={handleTouchOffDiv}></div> 
    </>
  );
};

export default TouchOffDiv;