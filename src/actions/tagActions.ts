"use server";

import { pool } from "@/db/dbClient";
import { RowDataPacket } from "mysql2";
import { Tag } from "@/typing/interfaces";

interface TagRow extends RowDataPacket {
  id: number;
  tag_name: string;
}

interface GetAllTagsResponse {
  success: boolean;
  message: string;
  tags: Tag[];
}

interface AddTagResponse {
  success: boolean;
  message: string;
  tags?: Tag[];
}


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

const editTagByID = () => {
  console.log("Editing your tag...")
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