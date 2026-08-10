"use client";

import { useState, DragEvent } from "react";
import { useAppContext } from "@/hooks/hooks";
import { checkIfIsFirefox } from "@/utils/utils";
// import DeleteIcon from "@/assets/icons/DeleteIcon"
// import EditIcon from "@/assets/icons/EditIcon";
import "./Shoot.scss";

const isFirefox = checkIfIsFirefox();

const Shoot = ({ 
  // shootID, 
  // displayOrder,
  // thumbnailURL, 
  // models, 
  // photographers, 
  // isOnShootDetails,
  // handleNewShootId,
  // isOrderEditable, 
  // handleShootDragStart,
  // handleDropShootTarget
}) => {

  const { 
    isLoggedIn, 
    // handleDeleteOrEditClick
  } = useAppContext();

  const [ imageIsLoaded, setIsImagedLoaded ] = useState(false);

  const handleUpdateImageIsLoaded = () => {
    setIsImagedLoaded(true);
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div 
      // draggable={isOrderEditable}
      // className={isOrderEditable 
      //   ? "shoot draggable" 
      //   : "shoot"}
      // onDragStart={isOrderEditable && !isFirefox
      //   ? () => handleShootDragStart(shootID)
      //   : undefined}
      // onMouseDown={isOrderEditable && isFirefox
      //   ? () => handleShootDragStart(shootID)
      //   : undefined}
      // onDragOver={isOrderEditable
      //   ? handleDragOver
      //   : undefined}
      // onDrop={isOrderEditable
      //   ? () => handleDropShootTarget(shootID, displayOrder)
      //   : undefined}
      // onClick={() => handleNewShootId(shootID)}
    >
      
      <div className="shoot__overlay"></div>
      
      {/* {isLoggedIn && !isOnShootDetails && !isOrderEditable

        ? <div 
            className="shoot__delete-btn"
            // onClick={(e) => handleDeleteOrEditClick(e, "Delete", shootID)}
          >
            <DeleteIcon
              // onClick={(e) => handleDeleteOrEditClick(e, "Delete", shootID)}
              className={"shoot__delete-btn--icon"}
            />
          </div>

        : null
        
      } */}

      {/* {isLoggedIn && !isOnShootDetails && !isOrderEditable

        ? <div 
            className="shoot__edit-btn"
            // onClick={(e) => handleDeleteOrEditClick(e, "Edit", shootID)}
          >
            <EditIcon
              // onClick={(e) => handleDeleteOrEditClick(e, "Edit", shootID)}
              className={"shoot__edit-btn--icon"}
            />
          </div>

        : null
        
      } */}

      {/* <img 
        draggable={isOrderEditable}
        className={`shoot__img ${imageIsLoaded ? "show" : ""}`}
        src={thumbnailURL} 
        alt={`Thumbnail for "${shootID}" shoot`}
        onLoad={handleUpdateImageIsLoaded}
        onDragStart={isOrderEditable 
          ? (e) => handleShootDragStart(e, shootID) 
          : undefined}
      /> */}

      <div 
        // className={`shoot__info ${!isOnShootDetails ? "show" : ""}`}
        className={`shoot__info`}
      >
        {/* <p className="shoot__models">
          <span className="models__label">
            {models.length > 1 
              ? "Models: " 
              : "Model: "}
          </span>
          {models.length > 1 ? models.join(", ") : models}
        </p> */}
        {/* <p className="shoot__photographers">
          <span className="photographers__label">   
            Photos
          </span>
            {photographers.length > 1 
              ? photographers.join(", ") 
              : photographers}
        </p> */}
      </div>

    </div>
  )};

export default Shoot;