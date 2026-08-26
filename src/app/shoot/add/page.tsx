"use client";

import { addTag, editTagByID } from "@/actions/tagActions";
import AddEditShootForm from "@/components/AddEditShootForm/AddEditShootForm";
import "./AddShootPage.scss";


const tagNumber = 34
const newTagName = "ZYZ";

const AddShootPage = () => {

  // const handleAddTag = async () => {
  //   const response = await addTag(newTagName);
  //   console.log(response)
  // }

  const handleEditTagByID = async () => {
    const response = await editTagByID(tagNumber, newTagName);
    console.log(response)
  }

  return (
    <div className="addShootPage">
      <div className="addShootPage__inner">
        <AddEditShootForm />

        <button
          onClick={handleEditTagByID}
        >
          Edit Tag {tagNumber}; new name: {newTagName}
        </button>
      </div>
    </div>
  );
};

export default AddShootPage;