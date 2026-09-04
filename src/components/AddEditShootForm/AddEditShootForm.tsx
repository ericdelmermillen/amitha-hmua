"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { EntryNameType } from "@/typing/types";
import { 
  // ChooserEntry, 
  Model, 
  Photographer 
} from "@/typing/interfaces";


// *** define choosers and map through choosers for each of models, photographers and tags to return appropriate CustomSelects for each

import { 
  getAllModels,
  // addModel, 
  // deleteModelByID, 
  // editModelByID, 
} from "@/actions/modelActions";
import { 
  // addPhotographer, 
  // deletePhotographerByID, 
  // editPhotographerByID, 
  getAllPhotographers 
} from "@/actions/photographerActions";
// import { 
//   addTag, 
//   deleteTagByID, 
//   editTagByID, 
//   getAllTags 
// } from "@/actions/tagActions";

// import { toast } from "react-toastify";
import { useAppContext } from "@/hooks/hooks";
// import AddIcon from "@/assets/icons/AddIcon";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
// import ShootDatePicker from "../ShootDatePicker/ShootDatePicker";
import { toast } from "react-toastify";
import "./AddEditShootForm.scss"

const AddEditShootForm = () => {
  const params = useParams();
  // const isEditMode = Boolean(params?.id);
  // const shootID = params?.id as string | undefined;

  const { 
    tags,
    shouldRefreshModels, 
    setShouldRefreshModels,
    shouldRefreshPhotographers, 
    setShouldRefreshPhotographers
   } = useAppContext()

  // const [ shootDate, setShootDate ] = useState<Date | null>(new Date());
  // const [ rawDate, setRawDate ] = useState<Date | null>(null);

  const [ modelChoosers, setModelChoosers ] = useState([{ chooserNo: 1, modelID: null, modelName: null}]);
  const [ models, setModels ] = useState<Model[]>([]);

  const [ photographerChoosers, setphotographerChoosers ] = useState([{ chooserNo: 1, modelID: null, modelName: null}]);
  const [ photographers, setPhotographers ] = useState<Photographer[]>([]);


  const handleAddCustomSelect = (selectedEntry: EntryNameType) => {
    const selectedEntryType = selectedEntry === "photographer_name"
      ? "photographer"
      : selectedEntry === "model_name"
      ? "model"
      : "tag";

      

    // const hasNullPhotographerChooser = photographerChooserIDs.some(chooser => chooser.photographerID === null);

    // const hasNullModelChooser = modelChooserIDs.some(chooser => chooser.modelID === null);

    // const hasNullTagChooser = tagChooserIDs.some(chooser => chooser.tagID === null);
      
    // if(selectedEntryType === "photographer" && !hasNullPhotographerChooser) {

    //   const maxChooserNo = Math.max(...photographerChooserIDs.map(chooser => chooser.chooserNo));

    //   const newChooser = { chooserNo: maxChooserNo + 1, photographerID: null, photographerName: null};

    //   return setPhotographerChooserIDs(prevChooserIDs => [...prevChooserIDs, newChooser]);
      
    // } else if(selectedEntryType === "model" && !hasNullModelChooser) {

    //   const maxChooserNo = Math.max(...modelChooserIDs.map(chooser => chooser.chooserNo));

    //   const newChooser = { chooserNo: maxChooserNo + 1, modelID: null, modelName: null};

    //   return setModelChooserIDs(prevChooserIDs => [...prevChooserIDs, newChooser]);

    // } else if(selectedEntryType === "tag" && !hasNullTagChooser) {

    //   const maxChooserNo = Math.max(...tagChooserIDs.map(chooser => chooser.chooserNo));

    //   const newChooser = { chooserNo: maxChooserNo + 1, tagID: null, tagName: null};

    //   return setTagChooserIDs(prevChooserIDs => [...prevChooserIDs, newChooser]);
    // };

    // return toast.error(`Please select a ${selectedEntryType} before adding a new one`);
  };

  // useEffect to fetch models
  useEffect(() => {
    const handleGetAllModels = async () => {
      try {
        const response = await getAllModels();

        if (response?.success && Array.isArray(response.models)) {
          setModels(response.models);
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

      <CustomSelect 
        // selectOptions={selectOptions}
        selectOptions={tags}
        entityType={"tag"}
      />
      
      <CustomSelect 
        // selectOptions={selectOptions}
        selectOptions={models}
        entityType={"model"}
      />
      
      <CustomSelect 
        // selectOptions={selectOptions}
        selectOptions={photographers}
        entityType={"photographer"}
      />

      {/* <CustomSelect 
        // selectOptions={selectOptions}
        selectOptions={models}
      /> */}

      {/* <h1 className="addEditShootForm__heading">
        {isEditMode ? `Edit Shoot ${shootID}` : "Add New Shoot"}
      </h1> */}

      <div className="addEditShootForm__date-container">

        {/* {isEditMode

          ? <label className="addEditShootForm__label addEditShootForm__label--datePicker">
              Edit Shoot Date
            </label>
          : <label className="addEditShootForm__label addEditShootForm__label--datePicker">
              Enter Shoot Date
            </label>
        } */}

        {/* <div className="addEditShootForm__icon-container">
          <ShootDatePicker
            shootDate={shootDate}
            setShootDate={setShootDate}
            className={"addEditShootForm__calendarIcon"}
            rawDate={rawDate}
          />
        </div> */}
      </div>

      <div className="addEditShootForm__tagChoosers">
        {/* <h3 className='addEditShootForm__label'>
          Choose At Least One Tag
        </h3>
        <h4 
          className="addEditShootForm__textButton"
          onClick={() => handleAddCustomSelect("tag_name")}
        >
          Add Tag 
          <span className='addEditShootForm__textButton-icon'>
            <AddIcon 
              className={"addEditShootForm__add-icon"}
              strokeClassName={"addEditShootForm__add-stroke"}
            />
          </span>
        </h4> */}



      </div>
        
    </form>
  );
};

export default AddEditShootForm;