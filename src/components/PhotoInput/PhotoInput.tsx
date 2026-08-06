"use client";

import { DragEvent, MouseEvent, useRef, useState } from "react";
import { checkIfIsFirefox } from "@/utils/utils";
import PhotoPlaceholder from "@/assets/icons/PhotoPlaceholder";
import "./PhotoInput.scss";

const isFirefox = checkIfIsFirefox();

interface PhotoInputProps {

}

const PhotoInput = ({ 
  shootPhoto, 
  setShootPhotos, 
  handleImageChange,
  handleInputDragStart = null,
  handleDropInputTarget = null
}) => {

  const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);

  const [ showImage, setShowImage ] = useState(false);

  const inputNo = shootPhoto.photoNo;
  const displayOrder = shootPhoto.displayOrder;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if(file) {
      handleImageChange(e, shootPhoto.photoNo);
      setTimeout(() => {
        setShowImage(true);
      }, MIN_LOADING_INTERVAL);
    };
  };

  const handleClearInput = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setShowImage(false);
  
    setShootPhotos(prevShootPhotos => {
      return prevShootPhotos.map(shootPhoto => {
        if (shootPhoto.photoNo === inputNo) {
          return { ...shootPhoto, photoPreview: null, photoData: null };
        }
        return shootPhoto;
      });
    });
  };
  

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleImageLoad = () => {
    setShowImage(true);
  };
  
  return (
    <>
      <div 
        className="photoInput"
        draggable={true}
        onClick={showImage 
          ? undefined
          : handleFileInputChange}
        onDragStart={!isFirefox && handleInputDragStart
          ? () => handleInputDragStart(inputNo)
          : undefined}
        onMouseDown={isFirefox && handleInputDragStart
          ? () => handleInputDragStart(inputNo)
          : undefined}
        onDragOver={handleDragOver}
        onDrop={handleDropInputTarget
          ? () => handleDropInputTarget(inputNo, displayOrder)
          : undefined}
      >
        <div 
          className={`photoInput__box ${showImage 
            ? "disabled" 
            : ""}`}
          draggable={true}
        >
          <img
            className={`photoInput__image ${showImage 
              ? "inFront" 
              : ""}`}
            src={shootPhoto.photoPreview}
            onLoad={handleImageLoad} 
            draggable={true}
          />
          <PhotoPlaceholder
            className={`photoInput__placeholder ${showImage 
              ? "behind" 
              : ""}`}
            strokeClassName="photoInput__placeholderStroke"
          />
          <div
            className={`photoInput__clearButton ${showImage 
              ? "show" 
              : ""}`}
            onClick={handleClearInput}
          >
            <div className="photoInput__clear">
              <div className="photoInput__close-icon"></div>
              <div className="photoInput__close-icon"></div>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          id={`fileInput_${shootPhoto.photoNo}`}
          accept="image/jpeg, image/png"
          className="photoInput__fileInput"
          onChange={handleFileChange}
        />
      </div>
    </>
  )};

export default PhotoInput;
