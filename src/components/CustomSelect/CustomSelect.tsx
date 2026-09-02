"use client";

import { useSearchParams } from "next/navigation";
import { type MouseEvent, type TransitionEvent, useEffect, useState } from "react";
import { useAppContext } from "@/hooks/hooks";
import { NavSelectProps, Tag } from "@/typing/interfaces";
import { normalizeCasing } from "@/utils/utils";
import DeleteIcon from "@/assets/icons/DeleteIcon";
import DownIcon from "@/assets/icons/DownIcon";
import EditIcon from "@/assets/icons/EditIcon";
import "./CustomSelect.scss";

const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);

const CustomSelect = ({ selectOptions }: NavSelectProps) => {
  const {
    setSelectedTag,
    selectValue, 
    setSelectValue,
    // setAppIsLoading,
    setShowTouchOffDiv
  } = useAppContext();
  
  console.log(selectValue)
  
  const searchParams = useSearchParams();

  const chooserType = "tag"

  const [ showSelectOptions, setShowSelectOptions ] = useState(false);

  const handleTopRowClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    console.log("Down arrow click")

    setShowSelectOptions(prev => {
      const next = !prev
      
      // if (next) {
      //   setShowTouchOffDiv(true)
      // }
      
      return next;
    });
  };

  const handleUpdateSelectValue = (option: Tag) => {
    setSelectValue(option.tagName);
    setShowSelectOptions(false);
    setShowTouchOffDiv(false);    
    setSelectedTag(option);
  };

  const handleTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    requestAnimationFrame(() => {
      const nodes = document.querySelectorAll(".customSelect__inner");
      
      for (const node of nodes) {
        if (!showSelectOptions) {
          node.scrollTop = 0;
        }
      }
    })
  };


  const handleDeleteEntry = (e: MouseEvent<HTMLElement>, id: number) => {
    e.preventDefault();
    e.stopPropagation();

    console.log(`option.id ${id}`);
    console.log(`Delete ${chooserType} ${id}?`);
  };
  
  const handleEditEntry = (e: MouseEvent<HTMLElement>, id: number) => {
    e.preventDefault();
    e.stopPropagation();

    console.log(`Edit ${chooserType} ${id}?`);
  };

  const handleTouchOff = () => {
    console.log("touch off")
    setShowSelectOptions(false);
  }
  

  return (
    <>
    <div className={`customSelect ${showSelectOptions ? "tall" : "short"}`}>
      <div 
        className={`customSelect__inner ${showSelectOptions ? "tall" : ""}`}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className={`customSelect__select ${showSelectOptions ? "tall" : ""}`} >
          <div 
            className="customSelect__selectValue"
            onClick={(e) => handleTopRowClick(e)}
          >
            <span 
              className={`customSelect__default-option 
              ${(!showSelectOptions && !selectValue) 
                || (showSelectOptions && !selectValue) 
                || (showSelectOptions && selectValue)
                ? "show" 
                : "hide"}`}
            >
              --Select {normalizeCasing(chooserType)}--
            </span>
            <span 
              className={`customSelect__default-option 
              ${
                (showSelectOptions && !selectValue) || (!showSelectOptions && selectValue) 
                ? "show" 
                : "hide"}`}
            >
              {selectValue && selectValue}
            </span>
            <div 
              className="customSelect__down"
            >
              <DownIcon 
                className={"customSelect__down-icon"}
                strokeClassName={"customSelect__down-stroke"}
              />
            </div>
          </div>

          {selectOptions.map(option => 
            <div 
              className="customSelect__option"
              key={option.id} 
              onClick={() => handleUpdateSelectValue(option)}
            >
              <button 
                className="customSelect__inline-button customSelect__inline-button--delete"
                onClick={(e) => handleDeleteEntry(e, option.id)}
              >
                <DeleteIcon 
                  className={"customSelect__icon customSelect__icon--delete"}
                  strokeClassName={"customSelect__icon-stroke"}
                />
              </button>
              {`${option.tagName}`}
              <button 
                className="customSelect__inline-button customSelect__inline-button--edit"
                onClick={(e) => handleEditEntry(e, option.id)}
              >
                <EditIcon 
                  className={"customSelect__icon customSelect__icon--edit"}
                  strokeClassName={"customSelect__icon-stroke"}
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    <div 
      className={`customSelect__touchOffDiv ${showSelectOptions 
        ? "show"
        : ""}`}
      onClick={handleTouchOff}
      ></div>
    </>
  );
};

export default CustomSelect;