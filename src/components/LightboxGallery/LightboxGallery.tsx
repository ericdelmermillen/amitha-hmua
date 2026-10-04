"use client";

import Image from "next/image";
import { useState } from "react";
import { LightboxGalleryProps } from "@/typing/interfaces";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

const LightboxGallery = ({
  slides,
  priorityFirst = false,
  sizes = "100vw",
  imageClassName = "",
  containerClassName = "",
}: LightboxGalleryProps) => {
  const [index, setIndex] = useState<number>(-1);

  if (!slides || slides.length === 0) {
    return null;
  }

  const isSingle = slides.length <= 1;

  return (
    <>
      <div
        className={`lightboxGallery ${containerClassName}`.trim()}
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
        {slides.map((slide, idx) => {
          return (
            <div
              key={slide.src || idx}
              style={{ position: "relative", width: "100%", height: "100%", cursor: "pointer" }}
              onClick={() => {
                setIndex(idx);
              }}
            >
              <Image
                className={imageClassName}
                src={slide.src}
                alt={slide.alt ?? "Gallery preview image"}
                fill
                sizes={sizes}
                priority={priorityFirst && idx === 0}
              />
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
          buttonPrev: isSingle ? () => null : undefined,
          buttonNext: isSingle ? () => null : undefined,
          buttonZoom: () => null,
        }}
      />
    </>
  );
};

export default LightboxGallery;