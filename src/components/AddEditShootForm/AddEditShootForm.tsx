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
import { useAppContext } from "@/hooks/hooks";
// import AddIcon from "@/assets/icons/AddIcon";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
// import ShootDatePicker from "../ShootDatePicker/ShootDatePicker";
import "./AddEditShootForm.scss"

const AddEditShootForm = () => {
  const params = useParams();
  const isEditMode = Boolean(params?.id);
  const shootID = params?.id as string | undefined;

  const { tags } = useAppContext()

  // const [ shootDate, setShootDate ] = useState<Date | null>(new Date());
  // const [ rawDate, setRawDate ] = useState<Date | null>(null);

  // const [ tagChooserIDs, setTagChooserIDs ] = useState<ChooserEntry[]>([{ chooserNo: 1, tagID: null, tagName: null}]);

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

  // const selectOptions = [
  //   {id: 1, tagName: "1st Option"},
  //   {id: 2, tagName: "2nd Option"},
  //   {id: 3, tagName: "3rd Option"},
  //   {id: 4, tagName: "4th Option"},
  //   {id: 5, tagName: "5th Option"},
  //   {id: 6, tagName: "6th Option"},
  //   {id: 7, tagName: "7th Option"},
  //   {id: 8, tagName: "8th Option"},
  //   {id: 9, tagName: "9th Option"},
  //   {id: 10, tagName: "10th Option"},
  //   {id: 11, tagName: "11th Option"},
  //   {id: 12, tagName: "12th Option"},
  //   {id: 13, tagName: "13th Option"},
  //   {id: 14, tagName: "14th Option"},
  //   {id: 15, tagName: "15th Option"},
  // ]

  return (
    <form className="addEditShootForm">

      <CustomSelect 
        // selectOptions={selectOptions}
        selectOptions={tags}
      />

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