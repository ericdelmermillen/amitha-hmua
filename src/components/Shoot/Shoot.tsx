"use client";

import { useState, DragEvent, MouseEvent } from "react";
import { ShootProps } from "@/typing/interfaces";
import { useAppContext, useModalContext } from "@/hooks/hooks";
import { checkIfIsFirefox } from "@/utils/utils";
import DeleteIcon from "@/assets/icons/DeleteIcon"
import EditIcon from "@/assets/icons/EditIcon";
import Image from "next/image";
import "./Shoot.scss";

const isFirefox = checkIfIsFirefox();


const Shoot = ({ 
  shootID, 
  displayOrder,
  thumbnailURL, 
  models, 
  photographers, 
  isOnShootDetails,
  handleNewShootID,
  shootOrderIsEditable, 
  handleShootDragStart,
  handleDropShootTarget
}: ShootProps) => {

  const { 
    isLoggedIn, 
  } = useAppContext();
  
  const {  
    handleOpenModal
  } = useModalContext();

  const [ imageIsLoaded, setIsImagedLoaded ] = useState(false);

  const handleUpdateImageIsLoaded = () => {
    setIsImagedLoaded(true);
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div 
      draggable={shootOrderIsEditable}
      className={shootOrderIsEditable 
        ? "shoot draggable" 
        : "shoot"}
      onDragStart={shootOrderIsEditable && !isFirefox && handleShootDragStart && shootID !== undefined
        ? (e) => handleShootDragStart(e, shootID)
        : undefined}
      onMouseDown={shootOrderIsEditable && isFirefox && handleShootDragStart && shootID !== undefined
        ? (e) => handleShootDragStart(e, shootID)
        : undefined}
      onDragOver={shootOrderIsEditable
        ? handleDragOver
        : undefined}
      onDrop={shootOrderIsEditable && handleDropShootTarget && shootID !== undefined && displayOrder !== undefined
        ? (e) => handleDropShootTarget(shootID, displayOrder)
        : undefined}
      onClick={handleNewShootID && shootID !== undefined
        ? () => handleNewShootID(shootID)
        : undefined
      }
    >
      
      <div className="shoot__overlay"></div>
      
      {isLoggedIn && !isOnShootDetails && !shootOrderIsEditable

        ? <div 
            className="shoot__deleteBtn"
            onClick={(e) => handleOpenModal({e, action: "delete", entityType: "shoot", entityID: shootID})}
          >
            <DeleteIcon className={"shoot__deleteBtn--icon"} />
          </div>

        : null
        
      }

      {isLoggedIn && !isOnShootDetails && !shootOrderIsEditable

        ? <div 
            className="shoot__editBtn"
            onClick={(e) => handleOpenModal({e, action: "edit", entityType: "shoot", entityID: shootID})}
          >
            <EditIcon className={"shoot__editBtn--icon"} />
          </div>

        : null
        
      }

      <div className="shoot__imgBox">
            
        {thumbnailURL 
          ? (
              <Image
                className={`shoot__img ${imageIsLoaded ? "show" : ""}`}
                src={thumbnailURL}
                alt={`Thumbnail for shoot ${shootID ?? ""}`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                draggable={shootOrderIsEditable}
                onLoad={handleUpdateImageIsLoaded}
                onDragStart={
                  shootOrderIsEditable && handleShootDragStart && shootID !== undefined
                  ? (e) => handleShootDragStart(e, shootID)
                  : undefined
                }
                fill
              />
            ) 
        : null}
      </div>

      <div className={`shoot__info ${!isOnShootDetails ? "show" : ""}`}>
        <p className="shoot__models">
          <span className="models__label">
            {models && models.length > 1 
              ? "Models: " 
              : "Model: "}
          </span>
          {models && models.length > 1 
            ? models.join(", ") 
            : models}
        </p>
        <p className="shoot__photographers">
          <span className="photographers__label">   
            Photos
          </span>
            {photographers && photographers.length > 0
              ? photographers.join(", ")
              : ""}
        </p>
      </div>

    </div>
  )};

export default Shoot;