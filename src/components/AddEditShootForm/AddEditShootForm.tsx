"use client";

import { useParams } from "next/navigation";
import { ChooserItem, ShootEntity, ShootPhoto } from "@/typing/interfaces";
import { EntryNameType } from "@/typing/types";
import { useState, useEffect } from "react";
import { useAppContext } from "@/hooks/hooks";
import { getAllModels } from "@/actions/modelActions";
import { getAllPhotographers } from "@/actions/photographerActions";
import { normalizeCasing, syncChoosers } from "@/utils/utils";
import { toast } from "react-toastify";
import AddIcon from "@/assets/icons/AddIcon";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import MinusIcon from "@/assets/icons/MinusIcon";
import ShootDatePicker from "../ShootDatePicker/ShootDatePicker";
import "./AddEditShootForm.scss"
import PhotoInput from "../PhotoInput/PhotoInput";

const numberOfPhotoUploads = 10;

const AddEditShootForm = () => {
  const params = useParams();
  const isEditMode = Boolean(params?.id);
  const shootID = params?.id as string | undefined;

  const { 
    tags,
    tagChoosers,
    setTagChoosers,
    shouldRefreshModels, 
    setShouldRefreshModels,
    shouldRefreshPhotographers, 
    setShouldRefreshPhotographers
   } = useAppContext();

  const [ shootDate, setShootDate ] = useState<Date | null>(new Date());
  const [ rawDate, setRawDate ] = useState<Date | null>(null);

  // number to grab the chooser on updating value in select
  // id to access the model/tag/photographer via actions to update or delete
  const [ models, setModels ] = useState<ShootEntity[]>([]);
  const [ modelChoosers, setModelChoosers ] = useState<ChooserItem[]>([{ number: 1, id: null, name: null}]);

  const [ photographers, setPhotographers ] = useState<ShootEntity[]>([]);
  const [ photographerChoosers, setPhotographerChoosers ] = useState<ChooserItem[]>([{ number: 1, id: null, name: null}]);


  // const [ shootPhotos, setShootPhotos ] = useState<ShootPhoto[]>(
  //   Array.from({ length: numberOfPhotoUploads }, (_, idx) => ({
  //     number: idx + 1,
  //     photoPreview: null,
  //     photoData: null,
  //     displayOrder: idx + 1
  //   }))
  // );
  
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


  return (
    <form className="addEditShootForm">
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

          {/* {shootPhotos.map(shootPhoto =>
          
            <div 
              className="addOrEditShoot__photoInput"
              key={shootPhoto.number}
            >                  
              <PhotoInput 
                key={shootPhoto.number}
                shootPhoto={shootPhoto}
                setShootPhotos={setShootPhotos}
                // handleImageChange={handleImageChange}
                // handleInputDragStart={handleInputDragStart}
                // handleDropInputTarget={handleDropInputTarget}
              />
            </div>

          )} */}
          

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

    </form>
  );
};

export default AddEditShootForm;