"use client";

import { useSearchParams } from "next/navigation";
import { type MouseEvent, type TransitionEvent, useEffect } from "react";
import { useAppContext } from "@/hooks/hooks";
import { NavSelectProps, Tag } from "@/typing/interfaces";
import { scrollToTop } from "@/utils/utils";
import DownIcon from "@/assets/icons/DownIcon";
import "./NavSelect.scss";

const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);

const NavSelect = ({ selectOptions, modifierClass }: NavSelectProps) => {
  const {
    setSelectedTag,
    handleNavigateHome,
    setShowSideNav,
    selectValue, 
    setSelectValue,
    setAppIsLoading,
    setShowTouchOffDiv,
    showNavSelectOptions, 
    setShowNavSelectOptions,
  } = useAppContext();
  
  const searchParams = useSearchParams();

  const safeModifierClass = typeof modifierClass === "string" ? modifierClass : "";

  const handleTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    requestAnimationFrame(() => {
      const nodes = document.querySelectorAll(".navSelect__inner");
      
      for (const node of nodes) {
        if (!showNavSelectOptions) {
          node.scrollTop = 0;
        }
      }
    })
  };

  const handleDownArrowClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    console.log("Down arrow click")

    setShowNavSelectOptions(prev => {
      const next = !prev
      
      if (next) {
        setShowTouchOffDiv(true)
      }
      
      return next;
    });
  };

  const handleUpdateSelectValue = (option: Tag) => {
    setAppIsLoading(true);
    setSelectValue(option.tagName);
    setShowNavSelectOptions(false);
    setShowTouchOffDiv(false);    
    setSelectedTag(option);
    handleNavigateHome(option);
    
    setTimeout(() => {
      requestAnimationFrame(() => {
        setShowSideNav(false);
        scrollToTop();
      })
    }, MIN_LOADING_INTERVAL);
  };

  const handleTopOptionClick = () => {
    setShowSideNav(false);
    setShowNavSelectOptions(false);

    if (showNavSelectOptions) {
      setSelectValue(null);
      setTimeout(() => {
        handleNavigateHome();
      }, MIN_LOADING_INTERVAL);
      return 
    } 

    if (selectValue) {
      const foundOption = selectOptions.find(tag => tag.tagName === selectValue);
      setTimeout(() => {
        if (foundOption) {
          setSelectedTag(foundOption);
        }
        handleNavigateHome(foundOption);
      }, MIN_LOADING_INTERVAL);
    } 
    else if (!selectValue) {
      setTimeout(() => {
        handleNavigateHome();
      }, MIN_LOADING_INTERVAL);
    }
  };
  
// useEffect to keep select display value in sync with the active URL tag query param
  useEffect(() => {
    const locationTagName = searchParams.get("tag");
    setSelectValue(locationTagName ? locationTagName.toUpperCase() : null);
  }, [searchParams, setSelectValue]);
    

  return (
    <div className={`navSelect ${showNavSelectOptions ? "tall" : "short"}`}>
      <div 
        id="navSelectInner"
        onTransitionEnd={handleTransitionEnd}
        className={`navSelect__inner ${showNavSelectOptions ? "tall" : ""}`}
      >
        <div className={`navSelect__select ${showNavSelectOptions ? "tall" : ""}`} >
          <div 
            className={`navSelect__selectValue ${safeModifierClass} ${!showNavSelectOptions ? "short" : ""}`} 
              onClick={handleTopOptionClick}
          >
            <span 
              className={`navSelect__default-option 
              ${(!showNavSelectOptions && !selectValue) 
                || (showNavSelectOptions && !selectValue) 
                || (showNavSelectOptions && selectValue)
                ? "show" 
                : "hide"}`}
            >
              WORK
            </span>
            <span 
              className={`navSelect__default-option 
              ${
                (showNavSelectOptions && !selectValue) || (!showNavSelectOptions && selectValue) 
                ? "show" 
                : "hide"}`}
            >
              {selectValue ? `# ${selectValue}` : null}
            </span>
            <div 
              className="navSelect__down"
              onClick={(e) => handleDownArrowClick(e)}
            >
              <DownIcon 
                className={"navSelect__down-icon"}
                strokeClassName={"navSelect__down-stroke"}
              />
            </div>
          </div>

          {selectOptions.map(option => 
            <div 
              className="navSelect__option"
              key={option.id} 
              onClick={() => handleUpdateSelectValue(option)}
            >
              {`# ${option.tagName}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavSelect;
