"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox, { type SlideImage } from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "./ShootPhotosGallery.scss";

interface PhotoItem {
  id: number | string;
  photo_url: string;
}

interface ShootPhotosGalleryProps {
  photos: PhotoItem[];
  formattedDate: string;
  models: string[];
  photographers: string[];
  shootID: number | string;
}

const ShootPhotosGallery = ({
  photos,
  formattedDate,
  models,
  photographers,
  shootID,
}: ShootPhotosGalleryProps) => {
  const [index, setIndex] = useState<number>(-1);

  const slides: SlideImage[] = photos.map((item, idx) => {
    return {
      src: item.photo_url,
      alt: `Photo ${idx + 1} from photo shoot ${shootID}`,
    };
  });

  const isSingle = slides.length <= 1;

  return (
    <>
      <div className="shootPhotosGallery">
        {photos.map(({ id, photo_url }, idx) => {
          return (
            <div key={id} className="shootPhotosGallery__photo-container">
              {idx === 0 && (
                <h4 className="shootPhotosGallery__date">{formattedDate}</h4>
              )}

              <div
                className="shootPhotosGallery__imageBox"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setIndex(idx);
                }}
              >
                <Image
                  className="shootPhotosGallery__image"
                  src={photo_url}
                  alt={`Photo ${idx + 1} from photo shoot ${shootID}`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={idx === 0}
                  fill
                />
              </div>

              {idx === 0 && (
                <div className="shootPhotosGallery__info">
                  <h3 className="shootPhotosGallery__models">
                    <span className="shootPhotosGallery__models-label">
                      {models.length > 1 ? "Models: " : "Model: "}
                    </span>
                    {models.join(", ")}
                  </h3>

                  <h3 className="shootPhotosGallery__photographers">
                    <span className="shootPhotosGallery__photographers-label">
                      Photos:{" "}
                    </span>
                    {photographers.join(", ")}
                  </h3>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => {
          setIndex(-1);
        }}
        slides={slides}
        plugins={[Zoom]}
        carousel={{ finite: isSingle }}
        render={{
          buttonPrev: isSingle ? () => { return null; } : undefined,
          buttonNext: isSingle ? () => { return null; } : undefined,
          buttonZoom: () => { return null; },
        }}
      />
    </>
  );
};

export default ShootPhotosGallery;