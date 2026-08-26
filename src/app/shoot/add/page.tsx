"use client";

import AddEditShootForm from "@/components/AddEditShootForm/AddEditShootForm";
import "./AddShootPage.scss";

import { addTag } from "@/actions/tagActions";

const newTagName = "XyZ"

const AddShootPage = () => {

  const handleAddTag = async () => {
    const response = await addTag(newTagName);
    console.log(response)
  }

  return (
    <div className="addShootPage">
      <div className="addShootPage__inner">
        <AddEditShootForm />

        <button
          onClick={handleAddTag}
        >
          Add Shoot {newTagName}
        </button>
      </div>
    </div>
  );
};

export default AddShootPage;