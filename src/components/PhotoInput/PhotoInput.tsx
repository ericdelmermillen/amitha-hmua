"use client";

import Image from "next/image";
import { 
  ChangeEvent,
  DragEvent, 
  MouseEvent, 
  useEffect, 
  useRef, 
  useState 
} from "react";
import { PhotoInputProps } from "@/typing/interfaces";
import { checkIfIsFirefox } from "@/utils/utils";
import PhotoPlaceholder from "@/assets/icons/PhotoPlaceholder";
import "./PhotoInput.scss";

const isFirefox = checkIfIsFirefox();
const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL);

const PhotoInput = ({ 
  shootPhoto, 
  setShootPhotos, 
  handleImageChange,
  handleInputDragStart,
  handleDropInputTarget
}: PhotoInputProps) => {

  const [ showImage, setShowImage ] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputNo = shootPhoto.photoNo;
  const displayOrder = shootPhoto.displayOrder;

  const handleFileInputChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {

      await handleImageChange(e, shootPhoto.photoNo);
      
      setTimeout(() => {
        setShowImage(true);
      }, MIN_LOADING_INTERVAL);
    };
  };

  const handleClearInput = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    setShootPhotos(prevShootPhotos => {
      const updatedPhotos = prevShootPhotos.map(shootPhoto => {
        if (shootPhoto.photoNo === inputNo) {
          return {
            ...shootPhoto,
            photoPreview: null,
            photoData: null
          };
        }

        return shootPhoto;
      });

    return updatedPhotos;
  });

  setShowImage(false);
};

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleImageLoad = () => {
    setShowImage(true);
  };

  // useEffect to clean up blob data
  useEffect(() => {
    return () => {
      if (shootPhoto.photoPreview && shootPhoto.photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(shootPhoto.photoPreview);
      }
    };
  }, [shootPhoto.photoPreview]);
  
  return (
    <div 
      className="photoInput"
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
      draggable
    >
      <div 
        className={`photoInput__box ${showImage 
          ? "disabled" 
          : ""}`}
        draggable
      >

        {shootPhoto.photoPreview && shootPhoto.photoPreview.startsWith("blob:") 
        
        ? (
            <img
              className={`photoInput__image ${showImage ? "inFront" : ""}`}
              src={shootPhoto.photoPreview}
              onLoad={handleImageLoad}
              alt="Photo preview"
              draggable
            />
          ) 
        : shootPhoto.photoPreview ? 
          (
            <Image
              className={`photoInput__image ${showImage ? "inFront" : ""}`}
              src={shootPhoto.photoPreview}
              alt="Photo preview"
              onLoad={handleImageLoad}
              draggable
              fill
            />
          ) 
        : null}
          
        <PhotoPlaceholder
          className={`photoInput__placeholder ${showImage ? "behind" : ""}`}
          strokeClassName="photoInput__placeholderStroke"
        />
        <div
          className={`photoInput__clearButton ${showImage ? "show" : ""}`}
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
  )};

export default PhotoInput;
