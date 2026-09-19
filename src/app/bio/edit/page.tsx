"use client";

import { 
  ChangeEvent, 
  SubmitEvent, 
  useState, 
  useRef,
  useEffect, 
  useCallback, 
} from "react";
import { useRouter } from "next/navigation";
import { InputPhoto } from "@/typing/interfaces";
import { useAppContext } from "@/hooks/hooks";
import { getBio, updateBio } from "@/actions/bioActions";
import { getSignedURL } from "@/actions/s3Actions";
import { staggerToastsByN } from "@/utils/utils";
import { toast } from "react-toastify";
import Compressor from "compressorjs";
import PhotoInput from "@/components/PhotoInput/PhotoInput";
import "./EditBioPage.scss";

const BIO_DIRNAME = process.env.NEXT_PUBLIC_AWS_BIO_DIRNAME || "bioimages";
const MIN_LOADING_INTERVAL = Number(process.env.NEXT_PUBLIC_MIN_LOADING_INTERVAL) || 250;

const EditBioPage = () => {
  const { setAppIsLoading } = useAppContext();

  const [ bioName, setBioName ] = useState("");
  const [ bioText, setBioText ] = useState("");
  const [ cancelling, setCancelling ] = useState(false);

  const [ inputPhoto, setInputPhoto ] = useState<InputPhoto[]>([
    {
      photoNo: 1,
      photoPreview: null,
      photoData: null,
      displayOrder: 1
    }
  ]);

  const cancelTimerRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  const handleBioNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBioName(e.target.value);
  };

  const handleBioTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setBioText(e.target.value);
  };

  const handleImageChange = useCallback(async (
    e: ChangeEvent<HTMLInputElement>,
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

      setInputPhoto(prev =>
        prev.map(photo => {
          if (photo.photoNo === inputNo) {
            if (photo.photoPreview && photo.photoPreview.startsWith("blob:")) {
              URL.revokeObjectURL(photo.photoPreview);
            }
            return {
              ...photo,
              photoPreview: compressedImageUrl,
              photoData: compressedImage
            };
          }
          return photo;
        })
      );
    } catch (error) {
      console.error("Image compression failed:", error);
      toast.error("Unable to process image");
    } finally {
      e.target.value = "";
    }
  }, []);

  // const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    let errors = 0;

    if (!bioName.trim()) {
      staggerToastsByN("Bio name cannot be left blank", "error", errors);
      errors++;
    }

    if (!bioText.trim()) {
      staggerToastsByN("Bio text cannot be left blank", "error", errors);
      errors++;
    }

    if (!inputPhoto[0]?.photoPreview) {
      staggerToastsByN("Bio image missing", "error", errors);
      errors++;
    }

    if (errors > 0) {
      return;
    }

    try {
      setAppIsLoading(true);

      const targetPhoto = inputPhoto[0];
      let newImageName = "";
      let isPhotoUpdated = false;

      // 1. Check if a new compressed image file was selected
      if (targetPhoto.photoData) {
        // Fetch presigned URL from S3 server action
        const signedUrlRes = await getSignedURL(BIO_DIRNAME);

        if (!signedUrlRes.success || !signedUrlRes.url) {
          throw new Error(signedUrlRes.error || "Failed to generate S3 upload URL");
        }

        // Upload compressed image directly to S3
        const uploadRes = await fetch(signedUrlRes.url, {
          method: "PUT",
          headers: {
            "Content-Type": targetPhoto.photoData.type || "image/jpeg",
          },
          body: targetPhoto.photoData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload image to S3");
        }

        // Extract clean object key/filename from the upload URL (strip query params)
        const uploadedFullUrl = signedUrlRes.url.split("?")[0];
        newImageName = uploadedFullUrl.split(`${BIO_DIRNAME}/`)[1] || "";
        
        isPhotoUpdated = true;

      } else if (targetPhoto?.photoPreview) {
        // Step 2: Existing photo retained -> Extract filename directly from photoPreview URL
        const cleanUrl = targetPhoto.photoPreview.split("?")[0];
        newImageName = cleanUrl.split(`${BIO_DIRNAME}/`)[1] || "";
      }

      if (!newImageName) {
        throw new Error("Unable to determine image filename");
      }

      // 3. Update database via server action
      const response = await updateBio({
        bio_name: bioName,
        bio_img_url: newImageName,
        bio_text: bioText,
        updated_Photo: isPhotoUpdated,
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      toast.success("Bio page updated");
      router.push("/bio");

    } catch (error) {
      
      const errorMessage = error instanceof Error ? error.message : "";

      // prevents the next error from showing in a toast
      if (errorMessage === "NEXT_REDIRECT" || errorMessage.includes("NEXT_REDIRECT")) {
        return;
      }

      console.error("Failed to update bio:", error);
      toast.error(errorMessage || "Error updating bio page");
    } finally {
      setAppIsLoading(false);
    }
  };

  // const handleCancel = () => {
  //   setAppIsLoading(true);
  //   setCancelling(true);
  //   setTimeout(() => {
  //     router.push("/bio");
  //   }, MIN_LOADING_INTERVAL);
  // };

  const handleCancel = () => {
    setAppIsLoading(true);
    setCancelling(true);
    cancelTimerRef.current = setTimeout(() => {
      router.push("/bio");
    }, MIN_LOADING_INTERVAL);
  };

  // useEffect to call for bioData to populate form
  useEffect(() => {
    const loadBio = async () => {
      try {
        const response = await getBio();

        if (!response.success || !response.data) {
          throw new Error(response.message ?? "Failed to load bio");
        }

        setBioName(response.data.bioName);
        setBioText(response.data.bioText);

        setInputPhoto([
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
      };
    };

    loadBio();
  }, []);

  // useEffect to clear timeout on handleCancel in case page is unmounted before it fires
  useEffect(() => {
    return () => {
      if (cancelTimerRef.current) {
        clearTimeout(cancelTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="editBioPage">
      <div className="editBioPage__inner">

        <h1 className="editBioPage__heading">
          Edit Your Bio
        </h1>

        <form className="editBioPage__form" onSubmit={handleSubmit}>

          <div className="editBioPage__hero-section">

            <div className="editBioPage__photoUpload">

              <div className="editBioPage__photoInput">
                <PhotoInput
                  shootPhoto={inputPhoto[0]}
                  setShootPhotos={setInputPhoto}
                  handleImageChange={handleImageChange}
                />
              </div>

            </div>

            <input
              type="text"
              className="editBioPage__bio-caption"
              value={bioName}
              onChange={handleBioNameChange}
            />

          </div>

          <div className="editBioPage__text-section">
            <textarea
              className="editBioPage__bio-text"
              value={bioText}
              onChange={handleBioTextChange}
            />
          </div>

          <div className="editBioPage__button-container">
            <button
              type="button"
              className={`editBioPage__button editBioPage__button--cancel ${cancelling ? "disabled" : ""}`}
              onClick={handleCancel}
              disabled={cancelling}
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