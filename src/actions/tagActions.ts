"use server";

import { 
  AddTagResponse, 
  DeleteTagResponse, 
  EditTagResponse, 
  GetAllTagsResponse, 
  ShootLinkRow, 
  ShootRow, 
  Tag, 
  TagRow, 
  TagShoot
} from "@/typing/interfaces";
import { ResultSetHeader } from "mysql2";
import { pool } from "@/db/dbClient";


// getAllTags
const getAllTags = async (): Promise<GetAllTagsResponse> => {
  try {
    const [rows] = await pool.query<TagRow[]>(
      "SELECT id, name FROM tags ORDER BY name ASC"
    );

    const formattedTags: Tag[] = rows.map((row) => {
      return {
        id: row.id,
        name: row.name,
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
const addTag = async (name: string): Promise<AddTagResponse> => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      success: false,
      message: "Tag name is required",
    };
  }

  try {
    const [existing] = await pool.query<TagRow[]>(
      "SELECT id, name FROM tags WHERE name = ? LIMIT 1",
      [trimmedName]
    );

    if (existing.length > 0) {
      return {
        success: false,
        message: "A tag with that name already exists",
      };
    }

    await pool.query(
      "INSERT INTO tags (name) VALUES (?)",
      [trimmedName]
    );

    const [rows] = await pool.query<TagRow[]>(
      "SELECT id, name FROM tags ORDER BY name ASC"
    );

    const formattedTags: Tag[] = rows.map((row) => {
      return {
        id: row.id,
        name: row.name,
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
const editTagByID = async (id: number, name: string): Promise<EditTagResponse> => {
  const parsedID = parseInt(String(id), 10);
  const trimmedName = name.trim();

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
      "SELECT id, name FROM tags WHERE id = ? LIMIT 1",
      [parsedID]
    );

    if (existing.length === 0) {
      return {
        success: false,
        message: `Tag with ID ${parsedID} does not exist`,
      };
    }

    const [duplicate] = await pool.query<TagRow[]>(
      "SELECT id, name FROM tags WHERE name = ? AND id != ? LIMIT 1",
      [trimmedName, parsedID]
    );

    if (duplicate.length > 0) {
      return {
        success: false,
        message: `Tag name "${trimmedName}" already exists`,
      };
    }

    await pool.query(
      "UPDATE tags SET name = ? WHERE id = ?",
      [trimmedName, parsedID]
    );

    const [updated] = await pool.query<TagRow[]>(
      "SELECT id, name FROM tags WHERE id = ? LIMIT 1",
      [parsedID]
    );

    const formattedTag: Tag = {
      id: updated[0].id,
      name: updated[0].name,
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


// deleteTagByID
const deleteTagByID = async (id: number): Promise<DeleteTagResponse> => {
  const parsedID = parseInt(String(id), 10);

  if (isNaN(parsedID) || parsedID <= 0) {
    return {
      success: false,
      message: "Valid tag ID is required",
    };
  }

  try {
    const [links] = await pool.query<ShootLinkRow[]>(
      "SELECT shoot_id FROM shoot_tags WHERE tag_id = ?",
      [parsedID]
    );

    if (links.length > 0) {
      const shootIds = links.map((r) => {
        return r.shoot_id;
      });

      const [shootRows] = await pool.query<ShootRow[]>(
        "SELECT id FROM shoots WHERE id IN (?)",
        [shootIds]
      );

      const tagShoots: TagShoot[] = shootRows.map((s) => {
        return {
          shoot_id: s.id,
        };
      });

      return {
        success: false,
        message: "Tag cannot be deleted because it appears in existing shoot(s)",
        tagShoots,
      };
    }

    const [existing] = await pool.query<TagRow[]>(
      "SELECT id, name FROM tags WHERE id = ? LIMIT 1",
      [parsedID]
    );

    if (existing.length === 0) {
      return {
        success: false,
        message: `Tag number ${parsedID} does not exist`,
      };
    }

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM tags WHERE id = ?",
      [parsedID]
    );

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: `Tag number ${parsedID} not deleted`,
      };
    }

    const [rows] = await pool.query<TagRow[]>(
      "SELECT id, name FROM tags ORDER BY name ASC"
    );

    const formattedTags: Tag[] = rows.map((row) => {
      return {
        id: row.id,
        name: row.name,
      };
    });

    return {
      success: true,
      message: "Tag deleted successfully",
      tags: formattedTags,
    };
  } catch (error) {
    console.error("Error deleting tag:", error);
    return {
      success: false,
      message: "Failed to delete tag",
    };
  }
};

export {
  getAllTags,
  addTag,
  editTagByID,
  deleteTagByID
};