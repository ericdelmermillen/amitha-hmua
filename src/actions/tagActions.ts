"use server";

import { GetAllTagsResponse, Tag, TagRow } from "@/typing/interfaces";
import { RowDataPacket } from "mysql2";
import { pool } from "@/db/dbClient";


interface AddTagResponse {
  success: boolean;
  message: string;
  tags?: Tag[];
}

interface EditTagResponse {
  success: boolean;
  message: string;
  updatedTag?: Tag;
}


// getAllTags
const getAllTags = async (): Promise<GetAllTagsResponse> => {
  try {
    const [rows] = await pool.query<TagRow[]>(
      "SELECT id, tag_name FROM tags ORDER BY tag_name ASC"
    );

    const formattedTags: Tag[] = rows.map((row) => {
      return {
        id: row.id,
        tagName: row.tag_name,
      };
    });

    return {
      success: true,
      message: "Tags fetched successfully",
      tags: formattedTags,
    };
  } catch (error) {
    console.error("Error fetching tags:", error);
    return {
      success: false,
      message: "Failed to fetch tags",
      tags: [],
    };
  }
};

// addTag
const addTag = async (tagName: string): Promise<AddTagResponse> => {
  const trimmedName = tagName.trim();

  if (!trimmedName) {
    return {
      success: false,
      message: "Tag name is required",
    };
  }

  try {
    const [existing] = await pool.query<TagRow[]>(
      "SELECT id, tag_name FROM tags WHERE tag_name = ? LIMIT 1",
      [trimmedName]
    );

    if (existing.length > 0) {
      return {
        success: false,
        message: "A tag with that name already exists",
      };
    }

    await pool.query(
      "INSERT INTO tags (tag_name) VALUES (?)",
      [trimmedName]
    );

    const [rows] = await pool.query<TagRow[]>(
      "SELECT id, tag_name FROM tags ORDER BY tag_name ASC"
    );

    const formattedTags: Tag[] = rows.map((row) => {
      return {
        id: row.id,
        tagName: row.tag_name,
      };
    });

    return {
      success: true,
      message: "Tag added successfully",
      tags: formattedTags,
    };
  } catch (error) {
    console.error("Error adding tag:", error);
    return {
      success: false,
      message: "Failed to add tag",
    };
  }
};

// editTagByID
const editTagByID = async (id: number, newTagName: string): Promise<EditTagResponse> => {
  const parsedID = parseInt(String(id), 10);
  const trimmedName = newTagName.trim();

  if (isNaN(parsedID) || parsedID <= 0) {
    return {
      success: false,
      message: "Valid tag ID is required",
    };
  }

  if (!trimmedName) {
    return {
      success: false,
      message: "Tag name is required",
    };
  }

  try {
    const [existing] = await pool.query<TagRow[]>(
      "SELECT id, tag_name FROM tags WHERE id = ? LIMIT 1",
      [parsedID]
    );

    if (existing.length === 0) {
      return {
        success: false,
        message: `Tag with ID ${parsedID} does not exist`,
      };
    }

    const [duplicate] = await pool.query<TagRow[]>(
      "SELECT id, tag_name FROM tags WHERE tag_name = ? AND id != ? LIMIT 1",
      [trimmedName, parsedID]
    );

    if (duplicate.length > 0) {
      return {
        success: false,
        message: `Tag name "${trimmedName}" already exists`,
      };
    }

    await pool.query(
      "UPDATE tags SET tag_name = ? WHERE id = ?",
      [trimmedName, parsedID]
    );

    const [updated] = await pool.query<TagRow[]>(
      "SELECT id, tag_name FROM tags WHERE id = ? LIMIT 1",
      [parsedID]
    );

    const formattedTag: Tag = {
      id: updated[0].id,
      tagName: updated[0].tag_name,
    };

    return {
      success: true,
      message: `Tag with ID ${parsedID} updated successfully`,
      updatedTag: formattedTag,
    };
  } catch (error) {
    console.error("Error updating tag:", error);
    return {
      success: false,
      message: "Failed to update tag",
    };
  }
};


const deleteTagByID = () => {
  console.log("Deleting your tag...")
};




export {
  getAllTags,
  addTag,
  editTagByID,
  deleteTagByID
};