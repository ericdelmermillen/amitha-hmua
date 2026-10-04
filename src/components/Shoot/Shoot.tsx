"use client";

import Image from "next/image";
import { useState, DragEvent } from "react";
import { ShootProps } from "@/typing/interfaces";
import { useAppContext, useIsFirefox, useModalContext } from "@/hooks/hooks";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import DeleteIcon from "@/assets/icons/DeleteIcon";
import EditIcon from "@/assets/icons/EditIcon";
import "./Shoot.scss";

const DND_OPACITY = Number(process.env.NEXT_PUBLIC_DND_OPACITY || "0.5");
console.log(DND_OPACITY)

const Shoot = ({ 
  shootID, 
  thumbnailURL, 
  models, 
  photographers, 
  isOnShootDetails,
  shootOrderIsEditable, 
}: ShootProps) => {

  const { isLoggedIn } = useAppContext();
  const { handleOpenModal } = useModalContext();

  const [ imageIsLoaded, setImageIsLoaded ] = useState(false);

const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: shootID,
    disabled: !shootOrderIsEditable || shootID === undefined,
  });
  
  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? DND_OPACITY : 1,
    zIndex: isDragging ? 999 : "auto",
    position: isDragging ? ("relative" as const) : undefined,

  };

  const handleUpdateImageIsLoaded = () => setImageIsLoaded(true);

  return (
    <div 
      className={shootOrderIsEditable ? "shoot draggable" : "shoot"}
      ref={setNodeRef}
      style={sortableStyle}
      {...attributes}
      {...listeners}
    >
      
      <div className="shoot__overlay"></div>
      
      {isLoggedIn && !isOnShootDetails && !shootOrderIsEditable

        ? 
          <>
            <div 
              className="shoot__deleteBtn"
              onClick={(e) => handleOpenModal({e, action: "delete", entityType: "shoot", entityID: shootID})}
            >
              <DeleteIcon className={"shoot__deleteBtn--icon"} />
            </div>

            <div 
              className="shoot__editBtn"
              onClick={(e) => handleOpenModal({e, action: "edit", entityType: "shoot", entityID: shootID})}
            >
              <EditIcon className={"shoot__editBtn--icon"} />
            </div>
          </>

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
                draggable={false}
                onLoad={handleUpdateImageIsLoaded}
                fill
              />
            ) 
        : null}
        
      </div>

      <div className={`shoot__info ${!isOnShootDetails ? "show" : ""}`}>
        <p className="shoot__models">
          <span className="shoot__models-label">
            {models && models.length > 1 ? "Models: " : "Model: "}
          </span>
          {models && models.length > 1 ? models.join(", ") : models}
        </p>
        <p className="shoot__photographers">
          <span className="shoot__photographers-label">   
            Photos:{" "}
          </span>
            {photographers && photographers.length > 0 ? photographers.join(", ") : ""}
        </p>
      </div>

    </div>
  );
};

export default Shoot;