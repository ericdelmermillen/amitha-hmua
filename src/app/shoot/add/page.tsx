"use client";

import { addTag, deleteTagByID, editTagByID } from "@/actions/tagActions";
import { getAllModels, addModel, editModelByID, deleteModelByID } from "@/actions/modelActions";
import AddEditShootForm from "@/components/AddEditShootForm/AddEditShootForm";
import "./AddShootPage.scss";

// models
const modelNumber = 68
const newModelName = "Shit-head";

const tagNumber = 35
const newTagName = "ZYZ";

const AddShootPage = () => {

  // models
  const handleGetAllModels = async () => {
    const response = await getAllModels();
    console.log(response)
  };

  const handleAddModel = async () => {
    const response = await addModel(newModelName);
    console.log(response)
  };

  const handleEditModelByID = async () => {
    const response = await editModelByID(modelNumber, newModelName);
    console.log(response)
  };

  const handleDeleteModelByID = async () => {
    const response = await deleteModelByID(modelNumber);
    console.log(response)
  };

  // tags

  const handleAddTag = async () => {
    const response = await addTag(newTagName);
    console.log(response)
  }

  const handleEditTagByID = async () => {
    const response = await editTagByID(tagNumber, newTagName);
    console.log(response)
  }

  const handleDeleteTagByID = async () => {
    const response = await deleteTagByID(tagNumber);
    console.log(response)
  }

  return (
    <div className="addShootPage">
      <div className="addShootPage__inner">
        <AddEditShootForm />

        <br></br>

        <button onClick={handleGetAllModels}>
          Get All Models
        </button>

        <br></br>
        <br></br>

        <button onClick={handleAddModel}>
          Add Model {newModelName}
        </button>

        <br></br>
        <br></br>

        <button onClick={handleEditModelByID}>
          Edit Model {modelNumber}
        </button>

        <br></br>
        <br></br>

        <button onClick={handleDeleteModelByID}>
          Delete Model {modelNumber}
        </button>

        <br></br>
        <br></br>

        {/* <button onClick={handleAddTag}>
          Add Tag {newTagName}
        </button>

        <br></br>
        <br></br> */}

        {/* <button onClick={handleEditTagByID}>
          Edit Tag {tagNumber}; New Tag Name {newTagName}
        </button>
    
        <br></br>
        <br></br>

        <button onClick={handleDeleteTagByID}>
          Delete Tag {tagNumber}
        </button> */}
      </div>
    </div>
  );
};

export default AddShootPage;