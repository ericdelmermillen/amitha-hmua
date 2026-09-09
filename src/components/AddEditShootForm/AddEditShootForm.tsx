"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { EntryNameType } from "@/typing/types";
import { 
  ChooserItem,
  // ChooserEntry, 
  ShootEntity, 
} from "@/typing/interfaces";


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
import AddIcon from "@/assets/icons/AddIcon";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import ShootDatePicker from "../ShootDatePicker/ShootDatePicker";
import { toast } from "react-toastify";
import { normalizeCasing } from "@/utils/utils";
import "./AddEditShootForm.scss"
import MinusIcon from "@/assets/icons/MinusIcon";

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
   } = useAppContext()

  const [ shootDate, setShootDate ] = useState<Date | null>(new Date());
  const [ rawDate, setRawDate ] = useState<Date | null>(null);


  // number to grab the chooser on updating value in select
  // id to access the model/tag/photographer via actions to update or delete
  const [ modelChoosers, setModelChoosers ] = useState<ChooserItem[]>([{ number: 1, id: null, name: null}]);
  const [ models, setModels ] = useState<ShootEntity[]>([]);

  const [ photographerChoosers, setPhotographerChoosers ] = useState<ChooserItem[]>([{ number: 1, id: null, name: null}]);
  const [ photographers, setPhotographers ] = useState<ShootEntity[]>([]);


  const handleAddCustomSelect = (entryType: EntryNameType, choosers: ChooserItem[]) => {
    const hasNullChooser = choosers.some(chooser => chooser.id === null);

    if (hasNullChooser) {
      return toast.error(`Select a ${normalizeCasing(entryType ?? "")} before adding another one`)
    }

    const maxChooserNo = Math.max(...choosers.map(chooser => chooser.number));    

    if (entryType === "tag") {
      const newChooser = { number: maxChooserNo + 1, id: null, name: null }
      setTagChoosers(prev => [...prev, newChooser]);
    }
  };

  const handleRemoveSelect = (chooserType: EntryNameType, number: number) => {
    const resetChooser = [{ number: 1, id: null, name: null }];

    if (chooserType === "tag") {
      setTagChoosers((prev) => 
      prev.filter((chooser) => chooser.number !== number).length > 0
        ? prev.filter((chooser) => chooser.number !== number)
        : resetChooser
      );
    } else if (chooserType === "model") {
      setModelChoosers((prev) => 
      prev.filter((chooser) => chooser.number !== number).length > 0
        ? prev.filter((chooser) => chooser.number !== number)
        : resetChooser
      );
    } else if (chooserType === "photographer") {
      setPhotographerChoosers((prev) => 
      prev.filter((chooser) => chooser.number !== number).length > 0
        ? prev.filter((chooser) => chooser.number !== number)
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

      <h1 className="addEditShootForm__heading">
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

      <div className="addEditShootForm__choosers addEditShootForm__choosers--tags">
        <h3 className='addEditShootForm__label'>
          Choose At Least One Tag
        </h3>
        <h4 
          className="addEditShootForm__textButton"
          onClick={() => handleAddCustomSelect("tag", tagChoosers)}
        >
          Add Tag 
          <span className='addEditShootForm__textButton-icon'>
            <AddIcon 
              className={"addEditShootForm__add-icon"}
              strokeClassName={"addEditShootForm__add-stroke"}
            />
          </span>
        </h4>

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
    </form>
  );
};

export default AddEditShootForm;