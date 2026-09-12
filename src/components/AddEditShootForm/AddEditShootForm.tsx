"use client";

import { useParams } from "next/navigation";
import { ChooserItem, InputPhoto, ShootEntity } from "@/typing/interfaces";
import { EntryNameType } from "@/typing/types";
import { useState, useEffect, ChangeEvent, SubmitEvent } from "react";
import { useAppContext } from "@/hooks/hooks";
import { getAllModels } from "@/actions/modelActions";
import { getAllPhotographers } from "@/actions/photographerActions";
import { getShootByID, addShoot, editShootByID } from "@/actions/shootActions";
import { getSignedURL } from "@/actions/s3Actions";
import { normalizeCasing, staggerToastsByN, syncChoosers } from "@/utils/utils";
import { toast } from "react-toastify";
import AddIcon from "@/assets/icons/AddIcon";
import Compressor from "compressorjs";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import MinusIcon from "@/assets/icons/MinusIcon";
import ShootDatePicker from "@/components/ShootDatePicker/ShootDatePicker";
import PhotoInput from "@/components/PhotoInput/PhotoInput";
import "./AddEditShootForm.scss"

const SHOOTS_DIRNAME = process.env.NEXT_PUBLIC_AWS_SHOOTS_DIRNAME || "shootimages";
const numberOfPhotoUploads = 10;

const AddEditShootForm = () => {
  const params = useParams();
  const isEditMode = Boolean(params?.id);
  const shootID = params?.id as string | undefined;

  const { 
    setAppIsLoading,
    tags,
    tagChoosers,
    setTagChoosers,
    shouldRefreshModels, 
    setShouldRefreshModels,
    shouldRefreshPhotographers, 
    setShouldRefreshPhotographers,
    handleNavigateHome
   } = useAppContext();

  const [ shootDate, setShootDate ] = useState<Date | null>(new Date());
  const [ rawDate, setRawDate ] = useState<Date | null>(null);

  const [ models, setModels ] = useState<ShootEntity[]>([]);
  const [ modelChoosers, setModelChoosers ] = useState<ChooserItem[]>([{ number: 1, id: null, name: null}]);

  const [ photographers, setPhotographers ] = useState<ShootEntity[]>([]);
  const [ photographerChoosers, setPhotographerChoosers ] = useState<ChooserItem[]>([{ number: 1, id: null, name: null}]);

  const [ shootPhotos, setShootPhotos ] = useState<InputPhoto[]>(
    Array.from({ length: numberOfPhotoUploads }, (_, idx) => ({
      photoNo: idx + 1,
      photoPreview: null,
      photoData: null,
      displayOrder: idx + 1
    }))
  );
  
  const handleAddCustomSelect = (entryType: EntryNameType, choosers: ChooserItem[]) => {
    const hasNullChooser = choosers.some(chooser => chooser.id === null);

    if (hasNullChooser) {
      return toast.error(`Select a ${normalizeCasing(entryType ?? "")} before adding another one`)
    }

    const maxChooserNo = Math.max(...choosers.map(chooser => chooser.number));    

    if (entryType === "tag") {
      const newChooser = { number: maxChooserNo + 1, id: null, name: null }
      setTagChoosers(prev => [...prev, newChooser]);
    } else if (entryType === "model") {
      const newChooser = { number: maxChooserNo + 1, id: null, name: null }
      setModelChoosers(prev => [...prev, newChooser]);
    } else if (entryType === "photographer") {
      const newChooser = { number: maxChooserNo + 1, id: null, name: null }
      setPhotographerChoosers(prev => [...prev, newChooser]);
    }
  };

  const handleRemoveSelect = (chooserType: EntryNameType, number: number) => {
    const resetChooser = [{ number: 1, id: null, name: null }];

    if (chooserType === "tag") {
      setTagChoosers((prev) => 
      prev.filter(chooser => chooser.number !== number).length > 0
        ? prev.filter((chooser) => chooser.number !== number)
        : resetChooser
      );
    } else if (chooserType === "model") {
      setModelChoosers(prev => 
      prev.filter(chooser => chooser.number !== number).length > 0
        ? prev.filter(chooser => chooser.number !== number)
        : resetChooser
      );
    } else if (chooserType === "photographer") {
      setPhotographerChoosers(prev => 
      prev.filter(chooser => chooser.number !== number).length > 0
        ? prev.filter(chooser => chooser.number !== number)
        : resetChooser
      );
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>, inputNo: number) => {
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

      setShootPhotos(prev =>
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
    } finally {
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    let errors = 0;
    
    if (!shootDate) {
      staggerToastsByN("Please select a shoot date", "error", errors);
      errors++;
    }

    const selectedTagIDs = tagChoosers
      .filter((chooser) => chooser.id !== null)
      .map((chooser) => chooser.id as number);

    if (selectedTagIDs.length === 0) {
      staggerToastsByN("Select at least one tag", "error", errors);
      errors++;
    }

    const selectedModelIDs = modelChoosers
      .filter((chooser) => chooser.id !== null)
      .map((chooser) => chooser.id as number);

    if (selectedModelIDs.length === 0) {
      staggerToastsByN("Select at least one model", "error", errors);
      errors++;
    }

    const selectedPhotographerIDs = photographerChoosers
      .filter((chooser) => chooser.id !== null)
      .map((chooser) => chooser.id as number);

    if (selectedPhotographerIDs.length === 0) {
      staggerToastsByN("Select at least one photographer", "error", errors);
      errors++;
    }

    const photos = shootPhotos.filter((photo) => photo.photoPreview !== null || photo.photoData !== null);

    if (photos.length === 0) {
      staggerToastsByN("Upload at least one photo", "error", errors);
      errors++;
    }
    
    if (errors > 0 || !shootDate) {
      return;
    }

    try {
      const photoUrls: string[] = [];

      for (const photo of photos) {
        if (photo.photoData) {
          // Case 1: Newly uploaded file
          const signedUrlRes = await getSignedURL(SHOOTS_DIRNAME);

          if (!signedUrlRes?.success || !signedUrlRes?.url) {
            throw new Error(signedUrlRes?.error || "Failed to generate upload URL");
          }

          const response = await fetch(signedUrlRes.url, {
            method: "PUT",
            headers: {
              "Content-Type": photo.photoData.type || "image/jpeg",
            },
            body: photo.photoData,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload photo #${photo.photoNo} to S3`);
          }

          const cleanUrl = signedUrlRes.url.split("?")[0];
          const objectName = cleanUrl.split(`${SHOOTS_DIRNAME}/`)[1] || "";

          if (!objectName) {
            throw new Error("Unable to parse uploaded image key");
          }

          photoUrls.push(objectName);
        } else if (photo.photoPreview) {
          // Case 2: Retained existing photo
          const cleanUrl = photo.photoPreview.split("?")[0];
          let objectName = cleanUrl;

          if (cleanUrl.includes(`${SHOOTS_DIRNAME}/`)) {
            objectName = cleanUrl.split(`${SHOOTS_DIRNAME}/`)[1] || "";
          }

          if (!objectName) {
            throw new Error("Unable to parse retained image filename");
          }

          photoUrls.push(objectName);
        }
      }

      const year = shootDate.getFullYear();
      const month = String(shootDate.getMonth() + 1).padStart(2, "0");
      const day = String(shootDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      const payload = {
        shoot_date: formattedDate,
        tag_ids: selectedTagIDs,
        photographer_ids: selectedPhotographerIDs,
        model_ids: selectedModelIDs,
        photo_urls: photoUrls,
      };

      let response;

      if (isEditMode) {
        const parsedShootID = parseInt(shootID as string, 10);

        if (isNaN(parsedShootID)) {
          throw new Error("Invalid shoot ID");
        }

        response = await editShootByID(parsedShootID, payload);
      } else {
        response = await addShoot(payload);
      }

      if (!response?.success) {
        throw new Error(response?.message || `Failed to ${isEditMode ? "update" : "add"} shoot`);
      }

      toast.success(`Shoot ${isEditMode ? "updated" : "added"} successfully`);
      handleNavigateHome();
    } catch (error: any) {
      console.error(`Shoot ${isEditMode ? "update" : "submit"} failed:`, error);
      toast.error(error?.message || `Error ${isEditMode ? "updating" : "submitting"} shoot`);
    }
  };

  const handleCancel = () => {
    handleNavigateHome();
    toast.info("Cancelling...");
  };

  // useEffect to fetch models
  useEffect(() => {
    const handleGetAllModels = async () => {
      try {
        const response = await getAllModels();

        if (response?.success && Array.isArray(response.models)) {
          setModels(response.models);
          setModelChoosers(prev => syncChoosers(prev, response.models));
        } else {
          throw new Error(response?.message || "Failed to retrieve models");
        }
      } catch (error: any) {
        console.error("Error fetching models:", error);
        toast.error(error?.message || "Failed to retrieve models");
      } finally {
        setShouldRefreshModels(false);
      }
    };

    if (shouldRefreshModels) {
      handleGetAllModels();
    }
  }, [shouldRefreshModels]);

  // useEffect to fetch photographers
  useEffect(() => {
    const handleGetAllPhotographers = async () => {
      try {
        const response = await getAllPhotographers();

        if (response?.success && Array.isArray(response.photographers)) {
          setPhotographers(response.photographers);
          setPhotographerChoosers(prev => syncChoosers(prev, response.photographers));
        } else {
          throw new Error(response?.message || "Failed to retrieve photographers");
        }
      } catch (error: any) {
        console.error("Error fetching photographers:", error);
        toast.error(error?.message || "Failed to retrieve photographers");
      } finally {
        setShouldRefreshPhotographers(false);
      }
    };

    if (shouldRefreshPhotographers) {
      handleGetAllPhotographers();
    }
  }, [shouldRefreshPhotographers]);

    // useEffect to fetch shoot data and populate form in edit mode
  useEffect(() => {
    if (!isEditMode || !shootID) {
      return;
    }

    const fetchShoot = async () => {
      setAppIsLoading(true);
      try {
        const parsedShootID = parseInt(shootID, 10);

        if (isNaN(parsedShootID)) {
          throw new Error("Invalid shoot ID");
        }

        const response = await getShootByID(parsedShootID);

        if (!response?.success || !response.data) {
          throw new Error(response?.message ?? "Failed to load shoot");
        }

        const data = response.data;

        if (data.shoot_date) {
          // probably broken. Fix after getting shoot publishing working
          const [year, month, day] = data.shoot_date.split("-").map(Number);
          // Note: month index is 0-based (month - 1)
          const parsedDate = new Date(year, month - 1, day);
          
          setShootDate(parsedDate);
          setRawDate(parsedDate);
        }

        if (data.tag_ids?.length > 0) {
          setTagChoosers(
            data.tag_ids.map((id, idx) => ({
              number: idx + 1,
              id,
              name: data.tags[idx] ?? null,
            }))
          );
        }

        if (data.model_ids?.length > 0) {
          setModelChoosers(
            data.model_ids.map((id, idx) => ({
              number: idx + 1,
              id,
              name: data.models[idx] ?? null,
            }))
          );
        }

        if (data.photographer_ids?.length > 0) {
          setPhotographerChoosers(
            data.photographer_ids.map((id, idx) => ({
              number: idx + 1,
              id,
              name: data.photographers[idx] ?? null,
            }))
          );
        }

        setShootPhotos(
          Array.from({ length: numberOfPhotoUploads }, (_, idx) => {
            const existingPhoto = data.photo_urls?.find(
              (p) => p.display_order === idx + 1
            ) ?? data.photo_urls?.[idx];

            return {
              photoNo: idx + 1,
              photoPreview: existingPhoto?.photo_url ?? null,
              photoData: null,
              displayOrder: idx + 1,
            };
          })
        );
      } catch (error: any) {
        console.error("Error loading shoot:", error);
        toast.error(error?.message || "Failed to load shoot details");
      } finally {
        setAppIsLoading(false);
      }
    };

    fetchShoot();
  }, [isEditMode, shootID]);

  return (
    <form 
      className="addEditShootForm"
      onSubmit={handleSubmit}
    >
      <h1 className="addEditShootForm__heading">
        {isEditMode ? `Edit Shoot ${shootID}` : "Add New Shoot"}
      </h1>

      <div className="addEditShootForm__date-container">

        <label 
          htmlFor="shootDate"
          className="addEditShootForm__label addEditShootForm__label--datePicker"
        >
          {`${isEditMode ? "Edit Shoot Date" : "Enter Shoot Date"}`}
        </label>

        <div className="addEditShootForm__icon-container">
          <ShootDatePicker
            id="shootDate"
            shootDate={shootDate}
            setShootDate={setShootDate}
            className={"addEditShootForm__calendarIcon"}
            rawDate={rawDate}
          />
        </div>
      </div>

      <div className="addEditShootForm__choosers addEditShootForm__choosers--tags">
        <label className="addEditShootForm__label">
          Choose At Least One Tag
        </label>
        <button 
          className="addEditShootForm__textButton"
          onClick={() => handleAddCustomSelect("tag", tagChoosers)}
          type="button"
        >
          Add Tag 
          <span className="addEditShootForm__textButton-icon">
            <AddIcon 
              className={"addEditShootForm__add-icon"}
              strokeClassName={"addEditShootForm__add-stroke"}
            />
          </span>
        </button>

        {tagChoosers.map(({ number, name }) => 
          
          <div key={number} className="addEditShootForm__selector addEditShootForm__selector--tags" >
            <CustomSelect 
              entityType={"tag"}
              selectOptions={tags}
              selectValue={name}
              chooserNumber={number}
              selectChoosers={tagChoosers}
              setSelectChoosers={setTagChoosers}
            />

            <span 
              className={`addEditShootForm__selector-removeIcon ${tagChoosers.length > 1 ? "show" : ""}`}
              onClick={tagChoosers.length > 1
                ? () => handleRemoveSelect("tag", number)
                : undefined
              }
            >
              <MinusIcon className={"addEditShootForm__minus-icon"} />
            </span>  
          </div>
        
        )}

      </div>

      <div className="addEditShootForm__photoUploads">
        <h3 className="addEditShootForm__photos-heading">
          Select up to 10 Photos
        </h3>
        
        <div className="addEditShootForm__photoInputs">

          {shootPhotos.map(photo => 

            <div key={photo.photoNo} className="addEditShootForm__photoInput">
              <PhotoInput
                shootPhoto={photo}
                setShootPhotos={setShootPhotos}
                handleImageChange={handleImageChange}
              />
            </div>
            
          )}

        </div>
        <p className="addEditShootForm__photos-explainer">
          *All shoots need at least one photo
        </p>
      </div>

      <div className="addEditShootForm__modelsAndphotographers-container">

        <div className="addEditShootForm__choosers addEditShootForm__choosers--models">
          <label className="addEditShootForm__label">
            Choose At Least One Model
          </label>

          <button
            className="addEditShootForm__textButton"
            onClick={() => handleAddCustomSelect("model", modelChoosers)}
            type="button"
          >
            Add Model
            <span className="addOrEditShootForm__textButton-icon">
              <AddIcon 
                className={"addEditShootForm__add-icon"}
                strokeClassName={"addEditShootForm__add-stroke"}
              />
            </span>
          </button>

          {modelChoosers.map(({ number, name }) => 
            
            <div key={number} className="addEditShootForm__selector addEditShootForm__selector--models" >
              <CustomSelect 
                entityType={"model"}
                selectOptions={models}
                selectValue={name}
                chooserNumber={number}
                selectChoosers={modelChoosers}
                setSelectChoosers={setModelChoosers}
              />

              <span 
                className={`addEditShootForm__selector-removeIcon ${modelChoosers.length > 1 ? "show" : ""}`}
                onClick={modelChoosers.length > 1
                  ? () => handleRemoveSelect("model", number)
                  : undefined
                }
              >
                <MinusIcon className={"addEditShootForm__minus-icon"} />
              </span>  
            </div>
          
          )}

        </div>

        <div className="addEditShootForm__choosers addEditShootForm__choosers--photographers">
          <label className="addEditShootForm__label">
            Choose At Least One Photographer
          </label>

          <button 
            className="addEditShootForm__textButton"
            onClick={() => handleAddCustomSelect("photographer", photographerChoosers)}
            type="button"
          >
            Add Photographer
            <span className="addOrEditShootForm__textButton-icon">
              <AddIcon 
                className={"addEditShootForm__add-icon"}
                strokeClassName={"addEditShootForm__add-stroke"}
              />
            </span>
          </button>

          {photographerChoosers.map(({ number, name }) => 
            
            <div key={number} className="addEditShootForm__selector addEditShootForm__selector--photographers" >
              <CustomSelect 
                entityType={"photographer"}
                selectOptions={photographers}
                selectValue={name}
                chooserNumber={number}
                selectChoosers={photographerChoosers}
                setSelectChoosers={setPhotographerChoosers}
              />

              <span 
                className={`addEditShootForm__selector-removeIcon ${photographerChoosers.length > 1 ? "show" : ""}`}
                onClick={photographerChoosers.length > 1
                  ? () => handleRemoveSelect("photographer", number)
                  : undefined
                }
              >
                <MinusIcon className={"addEditShootForm__minus-icon"} />
              </span>  
            </div>
          
          )}

        </div>

        
      </div>

      <div className="addEditShootForm__button-container">

        <button
          className="addEditShootForm__button addEditShootForm__button--submit" 
          type="submit"
        >
          {isEditMode ? "Update" : "Submit"}      
        </button>
        <button
          className="addEditShootForm__button addEditShootForm__button--cancel" 
          onClick={handleCancel}
          type="button"
        >
          Cancel
        </button>
      </div>

    </form>
  );
};

export default AddEditShootForm;