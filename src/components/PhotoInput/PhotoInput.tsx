"use client";

import { 
  ChangeEvent,
  DragEvent, 
  MouseEvent, 
  useEffect, 
  useRef, 
  useState 
} from "react";
import { PhotoInputProps } from "@/typing/interfaces";
import { useIsFirefox } from "@/hooks/hooks";
import PhotoPlaceholder from "@/assets/icons/PhotoPlaceholder";
import "./PhotoInput.scss";

const MIN_LOADING_INTERVAL = parseInt(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL || "250", 10);

// *** revisit placeholders once I implement suspense

const PhotoInput = ({ 
  shootPhoto, 
  setShootPhotos, 
  handleImageChange,
  handleInputDragStart,
  handleDropInputTarget
}: PhotoInputProps) => {

  const [ showImage, setShowImage ] = useState(false);
  const isFirefox = useIsFirefox();

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
      
      e.target.value = "";
    }
  };

  const handleClearInput = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setShootPhotos(prevPhotos => {
      const updatedPhotos = prevPhotos.map(shootPhoto => {
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
    const previewToRevoke = shootPhoto.photoPreview;

    return () => {
      if (previewToRevoke?.startsWith("blob:")) {
        URL.revokeObjectURL(previewToRevoke);
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
      <div className={`photoInput__box ${showImage ? "disabled" : ""}`} 
      // draggable
      >

        {shootPhoto.photoPreview 

          ? <img
              className={`photoInput__image ${showImage ? "inFront" : ""}`}
              src={shootPhoto.photoPreview}
              alt="Photo preview"
              onLoad={handleImageLoad}
            />
          : null

        }
          
        <PhotoPlaceholder
          className={`photoInput__placeholder ${showImage ? "behind" : ""}`}
          strokeClassName="photoInput__placeholderStroke"
        />
        <div
          className={`photoInput__clearButton ${showImage ? "show" : ""}`}
          onClick={handleClearInput}
          // onMouseDown is attempt to prevent click hijacking
          onMouseDown={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          draggable={false}
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
  );
};

export default PhotoInput;
