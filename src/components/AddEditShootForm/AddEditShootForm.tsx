"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { EntryNameType } from "@/typing/types";
import { ChooserEntry } from "@/typing/interfaces";

// import { 
//   addModel, 
//   deleteModelByID, 
//   editModelByID, 
//   getAllModels 
// } from "@/actions/modelActions";
// import { 
//   addPhotographer, 
//   deletePhotographerByID, 
//   editPhotographerByID, 
//   getAllPhotographers 
// } from "@/actions/photographerActions";
// import { 
//   addTag, 
//   deleteTagByID, 
//   editTagByID, 
//   getAllTags 
// } from "@/actions/tagActions";

// import { toast } from "react-toastify";
import AddIcon from "@/assets/icons/AddIcon";
import CustomSelect from "../CustomSelect/CustomSelect";
import ShootDatePicker from "../ShootDatePicker/ShootDatePicker";
import "./AddEditShootForm.scss"

const AddEditShootForm = () => {
  const params = useParams();
  const isEditMode = Boolean(params?.id);
  const shootID = params?.id as string | undefined;

  const [ shootDate, setShootDate ] = useState<Date | null>(new Date());
  const [ rawDate, setRawDate ] = useState<Date | null>(null);

  const [ tagChooserIDs, setTagChooserIDs ] = useState<ChooserEntry[]>([{ chooserNo: 1, tagID: null, tagName: null}]);

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


  return (
    <form className="addEditShootForm">

      <h1 className="addEditShootForm__heading">
        {/* {isEditMode ? `Edit Shoot ${shootID} : "Add New Shoot`} */}
        {isEditMode ? `Edit Shoot ${shootID}` : "Add New Shoot"}
      </h1>

      <div className="addEditShootForm__date-container">

        {isEditMode

          ? <label className="addEditShootForm__label addEditShootForm__label--datePicker">
              Edit Shoot Date
            </label>
          : <label className="addEditShootForm__label addEditShootForm__label--datePicker">
              Enter Shoot Date
            </label>
        }

        <div className="addEditShootForm__icon-container">
          <ShootDatePicker
            shootDate={shootDate}
            setShootDate={setShootDate}
            className={"addEditShootForm__calendarIcon"}
            rawDate={rawDate}
          />
        </div>
      </div>

      <div className="addEditShootForm__tagChoosers">
        <h3 className='addEditShootForm__label'>
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
        </h4>

        <CustomSelect 
          chooserType={"Tag"}
          entryNameType={"tag_name"}
          // chooserNo={chooser.chooserNo}
          chooserNo={1}
          // chooserName={chooser.tagName}
          chooserName={"tag"}
          // chooserIDs={tagChooserIDs}
          chooserIDs={[]}
          setChooserIDs={setTagChooserIDs}
          selectOptions={[]}
        />

      </div>
        
    </form>
  );
};

export default AddEditShootForm;