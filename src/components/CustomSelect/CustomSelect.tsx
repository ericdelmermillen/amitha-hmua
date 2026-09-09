"use client";

import { type MouseEvent, type TransitionEvent, useState } from "react";
import { useAppContext, useModalContext } from "@/hooks/hooks";
import { CustomSelectProps, SelectOption, ShootEntity } from "@/typing/interfaces";
import { normalizeCasing } from "@/utils/utils";
import DeleteIcon from "@/assets/icons/DeleteIcon";
import DownIcon from "@/assets/icons/DownIcon";
import EditIcon from "@/assets/icons/EditIcon";
import "./CustomSelect.scss";

const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);

const CustomSelect = ({ selectOptions, entityType, selectValue, chooserNumber, selectChoosers, setSelectChoosers }: CustomSelectProps) => {
  const {
    // 
    setAppIsLoading,
    setShowTouchOffDiv,
    appIsLoading
  } = useAppContext();

  const { handleOpenModal } = useModalContext()

  const [ showSelectOptions, setShowSelectOptions ] = useState(false);

  const handleTopRowClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    if (appIsLoading) {
      return
    }

    setShowSelectOptions(prev => {
      const next = !prev
      
      // if (next) {
      //   setShowTouchOffDiv(true)
      // }
      
      return next;
    });
  };

  const handleUpdateSelectValue = (option: ShootEntity) => {
    setSelectChoosers((prevChoosers) => {
      return prevChoosers.map((chooser) => {
        if (chooser.number === chooserNumber) {
          return {
            ...chooser,
            id: option.id,
            name: option.name,
          };
        }
        return chooser;
      });
    });
    setShowSelectOptions(false);
    setShowTouchOffDiv(false);

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
  
  const handleAddNewOption = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    handleOpenModal({e, action: "add", entityType: entityType, entityName: null, entityID: null})
    console.log(`Add new ${normalizeCasing(entityType)} option?`);
  };
    
  const handleEditEntry = (e: MouseEvent<HTMLElement>, option: SelectOption) => {
    e.preventDefault();
    e.stopPropagation();

    // console.log(option)
    handleOpenModal({e, action: "edit", entityType: entityType, entityName: option.name, entityID: option.id})

    // console.log(`Edit ${normalizeCasing(entityType)} ${option.id}?`);
  };


  const handleDeleteEntry = (e: MouseEvent<HTMLElement>, option: SelectOption) => {
    e.preventDefault();
    e.stopPropagation();

    console.log(entityType)
    if (entityType === "model") {
      handleOpenModal({e, action: "delete", entityType: entityType, entityName: option.name, entityID: option.id})
    } else if (entityType === "photographer") {
      handleOpenModal({e, action: "delete", entityType: entityType, entityName: option.name, entityID: option.id})
    } else if (entityType === "tag") {
      handleOpenModal({e, action: "delete", entityType: entityType, entityName: option.name, entityID: option.id})
    }  

  };

  const handleTouchOff = () => {
    console.log("touch off")
    setShowSelectOptions(false);
    setAppIsLoading(false)
  };
  

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
              --Select {normalizeCasing(entityType)}--
            </span>
            <span 
              className={`customSelect__default-option 
              ${
                (showSelectOptions && !selectValue) || (!showSelectOptions && selectValue) 
                ? "show" 
                : "hide"}`}
            >
              {selectValue && normalizeCasing(selectValue ?? "")}
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

          {selectOptions.map((option) => {
          
            const isOptionSelected = selectChoosers?.some(
              (chooser) => chooser.name?.toLowerCase() === option.name?.toLowerCase()
            );

            return (
              <div 
                className={`customSelect__option`}
                key={option.id} 
                onClick={isOptionSelected ? undefined : () => handleUpdateSelectValue(option)}
              >
                <button 
                  className="customSelect__inline-button customSelect__inline-button--delete"
                  onClick={(e) => handleDeleteEntry(e, option)}
                >
                  <DeleteIcon 
                    className={"customSelect__icon customSelect__icon--delete"}
                    strokeClassName={"customSelect__icon-stroke"}
                  />
                </button>
                <span className={`customSelect__option-value ${isOptionSelected ? "disabled" : ""}`}>
                  {normalizeCasing(option.name ?? "")}
                </span>
                <button 
                  className="customSelect__inline-button customSelect__inline-button--edit"
                  onClick={(e) => handleEditEntry(e, option)}
                >
                  <EditIcon 
                    className={"customSelect__icon customSelect__icon--edit"}
                    strokeClassName={"customSelect__icon-stroke"}
                  />
                </button>
              </div>
            );
          })}     

          <div 
            className="customSelect__option customSelect__option--add"
            onClick={(e) => handleAddNewOption(e)}
          >
            Add New Entry
          </div>
        </div>
      </div>
    </div>
    <div 
      className={`customSelect__touchOffDiv ${showSelectOptions ? "show" : ""}`} 
      onClick={handleTouchOff}
    ></div>
    </>
  );
};

export default CustomSelect;