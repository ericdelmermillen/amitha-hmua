"use client";

import { addTag, deleteTagByID, editTagByID } from "@/actions/tagActions";
import AddEditShootForm from "@/components/AddEditShootForm/AddEditShootForm";
import "./AddShootPage.scss";


const tagNumber = 35
const newTagName = "ZYZ";

const AddShootPage = () => {

  const handleAddTag = async () => {
    const response = await addTag(newTagName);
    console.log(response)
  }

  const handleEditTagByID = async () => {
    const response = await editTagByID(tagNumber, newTagName);
    console.log(response)
  }

  const handleDeletetTagByID = async () => {
    const response = await deleteTagByID(tagNumber);
    console.log(response)
  }

  return (
    <div className="addShootPage">
      <div className="addShootPage__inner">
        <AddEditShootForm />

        <br></br>

        <button onClick={handleAddTag}>
          Add Tag {newTagName}
        </button>
        <br></br>
        <br></br>

        <button onClick={handleEditTagByID}>
          Edit Tag {tagNumber}; New Tag Name {newTagName}
        </button>
    
        <br></br>
        <br></br>

        <button onClick={handleDeletetTagByID}>
          Delete Tag {tagNumber}
        </button>
      </div>
    </div>
  );
};

export default AddShootPage;