"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppContext } from "@/hooks/hooks";
import { useRouter } from "next/navigation";
import { BioData, InputPhoto } from "@/typing/interfaces";
import { getBio, updateBio } from "@/actions/bioActions";
import { toast } from "react-toastify";
import Compressor from "compressorjs";
import PhotoInput from "@/components/PhotoInput/PhotoInput";
import "./EditBioPage.scss";

const EditBioPage = () => {
  const router = useRouter();

  const { setAppIsLoading } = useAppContext();

  const [bioData, setBioData] = useState<BioData | null>(null);

  const [inputPhotos, setInputPhotos] = useState<InputPhoto[]>([
    {
      photoNo: 1,
      photoPreview: null,
      photoData: null,
      displayOrder: 1
    }
  ]);

  const [newBioName, setNewBioName] = useState("");
  const [newBioText, setNewBioText] = useState("");

  useEffect(() => {
    const loadBio = async () => {
      try {
        const response = await getBio();

        if (!response.success || !response.data) {
          throw new Error(response.message ?? "Failed to load bio");
        }

        setBioData(response.data);

        setNewBioName(response.data.bioName);
        setNewBioText(response.data.bioText);

        setInputPhotos([
          {
            photoNo: 1,
            photoPreview: response.data.bioImgURL ?? null,
            photoData: null,
            displayOrder: 1
          }
        ]);

      } catch (error) {
        console.error(error);
        toast.error("Failed to load bio page");
      }
    };

    loadBio();
  }, []);

  const handleBioCaptionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewBioName(e.target.value);
  };

  const handleBioTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNewBioText(e.target.value);
  };

  const handleImageChange = useCallback(async (
    e: React.ChangeEvent<HTMLInputElement>,
    inputNo: number
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const compressedImage = await new Promise<File>((resolve, reject) => {
        new Compressor(file, {
          quality: 0.8,
          maxWidth: 1200,
          maxHeight: 900,

          success(result) {
            resolve(result as File);
          },

          error(error) {
            reject(error);
          }
        });
      });

      const compressedImageUrl = URL.createObjectURL(compressedImage);

      setInputPhotos(prev =>
        prev.map(photo =>
          photo.photoNo === inputNo
            ? {
                ...photo,
                photoPreview: compressedImageUrl,
                photoData: compressedImage
              }
            : photo
        )
      );

    } catch (error) {
      console.error("Image compression failed:", error);
      toast.error("Unable to process image");
    }

  }, []);

  const handleCancel = () => {
    router.push("/bio");
  };

  const handleSubmitBioUpdate = async (
     e: React.SubmitEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!newBioName.trim()) {
      toast.error("Bio name cannot be left blank");
      return;
    }

    if (!newBioText.trim()) {
      toast.error("Bio text cannot be left blank");
      return;
    }

    if (!bioData?.bioImgURL) {
      toast.error("Bio image missing");
      return;
    }

    try {
      setAppIsLoading(true);

      const imageName = bioData.bioImgURL.split("/").pop();

      if (!imageName) {
        throw new Error("Unable to determine image name");
      }

      const response = await updateBio({
        bio_name: newBioName,
        bio_img_url: imageName,
        bio_text: newBioText,
        updated_Photo: false
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      toast.success("Bio page updated");

      router.push("/bio");

    } catch (error) {
      console.error("Failed to update bio:", error);
      toast.error("Error updating bio page");

    } finally {
      setAppIsLoading(false);
    }
  };

  return (
    <div className="editBioPage">
      <div className="editBioPage__inner">

        <h1 className="editBioPage__heading">
          Edit Your Bio
        </h1>

        <form
          className="editBioPage__form"
          onSubmit={handleSubmitBioUpdate}
        >

          <div className="editBioPage__hero-section">

            <div className="editBioPage__photoUpload">

              <div className="editBioPage__photoInput">
                <PhotoInput
                  shootPhoto={inputPhotos[0]}
                  setShootPhotos={setInputPhotos}
                  handleImageChange={handleImageChange}
                />
              </div>

            </div>

            <input
              type="text"
              className="editBioPage__bio-caption"
              value={newBioName}
              onChange={handleBioCaptionChange}
            />

          </div>

          <div className="editBioPage__text-section">

            <textarea
              className="editBioPage__bio-text"
              value={newBioText}
              onChange={handleBioTextChange}
            />

          </div>

          <div className="editBioPage__button-container">

            <button
              type="button"
              className="editBioPage__button"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="editBioPage__button"
            >
              Update
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default EditBioPage;