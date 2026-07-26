"use client";

import { IsLoadingProps } from "@/typing/interfaces";
import "./IsLoading.scss";

const IsLoading = ({ id, modifierClass, initiallyShowing = false }: IsLoadingProps) => {

  return (
    <>
      <div 
        id={id} 
        className={`isLoading ${modifierClass} ${initiallyShowing ? "show" : ""}`}
      >
      </div>
    </>
  );
};

export default IsLoading;