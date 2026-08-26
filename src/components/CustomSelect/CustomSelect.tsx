"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import { useAppContext, useModalContext } from "@/hooks/hooks";
import { 
  CustomSelectProps,
  SelectOption, 
 } 
from "@/typing/interfaces";
import { 
  type EntryNameType ,
  type ModalActionType 
} from "@/typing/types";
import DeleteIcon from "@/assets/icons/DeleteIcon";
import DownIcon from "@/assets/icons/DownIcon";
import EditIcon from "@/assets/icons/EditIcon";
import "./CustomSelect.scss";


 
const CustomSelect = ({ 
  chooserNo,
  chooserName,
  chooserType, 
  chooserIDs,
  setChooserIDs,
  selectOptions, 
  entryNameType
 }: CustomSelectProps) => {
  
  const {
    // setShowPhotogModelTagModal,
    // setSelectedPhotogModelTag,
  } = useAppContext();
  
  const {
    // ({ e, action, entityType, entityName = null, entityID = null }: ModalData)
    handleOpenModal
  } = useModalContext();

  const [ selectValue, setSelectValue ] = useState(null);
  const [ showOptions, setShowOptions ] = useState(false);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const handleToggleShowOptions = () => {
    setShowOptions(!showOptions);
  };

  const alreadySelected = (chooserID: number) => {
    const entryID = `${chooserType.toLowerCase()}ID`;

    for(const chooser of chooserIDs) {
      if(chooser[entryID] === chooserID) {
        return true;
      };
    };
  };
  
  const handleTouchOff = () => {
    setShowOptions(false);

    // Reset scroll position to top
    if(innerRef.current) {
      innerRef.current.scrollTop = 0;
    };
  };

  // const handleOptionClick = (e, option, modalType, entryType) => {
  const handleOptionClick = (
    e: MouseEvent<HTMLDivElement>, 
    option: SelectOption | null, 
    modalType: ModalActionType, 
    entryType?: EntryNameType
  ) => {
  
    if(modalType !== "Add") {
      e.stopPropagation();
      // setSelectedPhotogModelTag(option);
    } 
    // else {
    //   if(entryType === "photographer_name") {
    //     setSelectedPhotogModelTag({id: null, photographer_name: null});
    //   } else if(entryType === "model_name") {
    //     setSelectedPhotogModelTag({id: null, model_name: null});
    //   } else if(entryType === "tag_name") {
    //     setSelectedPhotogModelTag({id: null, tag_name: null});
    //   };
    // };
    // setShowPhotogModelTagModal({modalType: modalType});
  };

  const handleUpdateSelectValue = (option: SelectOption) => {
  // setSelectValue(option.photographer_name || option.model_name || option.tag_name);

  setChooserIDs(prevChooserIDs => {
    return prevChooserIDs.map(chooserID => {
      if (chooserID.chooserNo !== chooserNo) {
        return chooserID;
      };

      if (chooserType === "Photographer") {
        return {
          ...chooserID,
          photographerID: option.id,
          photographerName: option.photographer_name
        };
      } else if (chooserType === "Model") {
        return {
          ...chooserID,
          modelID: option.id,
          modelName: option.model_name
        };
      } else if (chooserType === "Tag") {
        return {
          ...chooserID,
          tagID: option.id,
          tagName: option.tag_name
        };
      };

      return chooserID;
    });
  });

  setShowOptions(false);

  // Reset scroll position to top
  if (innerRef.current) {
    innerRef.current.scrollTop = 0;
  };
};


  useEffect(() => {
    // if (chooserName) {
    //   setSelectValue(chooserName);
    // };
    // console.log(chooserName)
  }, [chooserName]);
  
  return (
    <>
      <div className={`customSelect ${showOptions ? "tall" : "short"}`}>
        <div 
          ref={innerRef}
          className={`customSelect__inner ${showOptions ? "tall" : ""}`}
        >

          <div className={`customSelect__select ${showOptions ? "tall" : ""}`} >
            <div 
              className={`customSelect__selectValue ${!showOptions ? "short" : ""}`} 
              onClick={handleToggleShowOptions}
            >
              <span 
                className={`customSelect__default-option 
                ${(!showOptions && !selectValue) 
                  || (showOptions && !selectValue) 
                  || (showOptions && selectValue)
                    ? "show" 
                    : "hide"}`}
              >
                --Select {chooserType}--
              </span>
              <span 
                className={`customSelect__default-option 
                  ${
                    (showOptions && !selectValue) || (!showOptions && selectValue) 
                    ? "show" 
                    : "hide"}`}
              >
                {selectValue}
              </span>
              <div className="down">
                <DownIcon 
                  className={"down__icon"}
                  strokeClassName={"down__stroke"}
                />
              </div>
            </div>

            {selectOptions.map(option => 
              <div 
                className={`customSelect__option ${showOptions && alreadySelected(option.id)
                  ? "show disabled"
                  : showOptions
                  ? "show"
                  : ""}`} 
                key={option.id} onClick={() => handleUpdateSelectValue(option)}
              >
                {option.photographer_name || option.model_name || option.tag_name}
                <div 
                  className="customSelect__option--edit-icon"
                  onClick={(e) => handleOptionClick(e, option, "Edit")}
                >
                  <EditIcon 
                    className={"editSvg"}
                    strokeClassName={"editStroke"}
                  />
                </div>
                <div 
                  className="customSelect__option--delete-icon"
                  onClick={(e) => handleOptionClick(e, option, "Delete")}
                >
                  <DeleteIcon 
                    className={"deleteSvg"}
                    strokeClassName={"deleteStroke"}
                  />
                </div>
              </div>
            )}
            
            <div 
              className="customSelect__option customSelect__option--addNew"
              onClick={(e) => handleOptionClick(e, null, "Add", entryNameType)}
            >
              Add New Entry
            </div>
          </div>
        </div>
      </div>
      <div 
        className={`customSelect__touchOffDiv ${showOptions 
          ? "show"
          : ""}`}
        onClick={handleTouchOff}
      ></div>
    </>
  );
};

export default CustomSelect;
