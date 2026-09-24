"use server";

import { 
  type AddTagResponse, 
  type DeleteTagResponse, 
  type EditTagResponse, 
  type GetAllTagsResponse, 
  type ShootLinkRow, 
  type ShootEntity, 
  type EntityRow, 
} from "@/typing/interfaces";
import { pool } from "@/db/dbClient_pg";
import { verifyAndRefreshSession } from "@/utils/tokenUtils";

// getAllTags
const getAllTags = async (): Promise<GetAllTagsResponse> => {
  try {
    const { rows } = await pool.query<EntityRow>(
      "SELECT id, name FROM tag ORDER BY name ASC"
    );

    const formattedTags: ShootEntity[] = rows.map(row => {
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
  await verifyAndRefreshSession();

  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      success: false,
      message: "Tag name is required",
    };
  }

  try {
    const { rows: inserted } = await pool.query<EntityRow>(
      "INSERT INTO tag (name) VALUES ($1) ON CONFLICT (LOWER(name)) DO NOTHING RETURNING id, name",
      [trimmedName]
    );

    if (inserted.length === 0) {
      return {
        success: false,
        message: "A tag with that name already exists",
      };
    }

    const { rows } = await pool.query<EntityRow>(
      "SELECT id, name FROM tag ORDER BY name ASC"
    );

    const formattedTags: ShootEntity[] = rows.map(row => {
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
  await verifyAndRefreshSession();

  const parsedID = parseInt(String(id), 10);
  const trimmedName = name.trim();

  if (Number.isNaN(parsedID) || parsedID <= 0) {
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
    const { rows: duplicate } = await pool.query<EntityRow>(
      "SELECT id, name FROM tag WHERE LOWER(name) = LOWER($1) AND id != $2 LIMIT 1",
      [trimmedName, parsedID]
    );
    

    if (duplicate.length > 0) {
      return {
        success: false,
        message: `Tag name "${trimmedName}" already exists`,
      };
    }

    const { rows: updated } = await pool.query<EntityRow>(
      "UPDATE tag SET name = $1 WHERE id = $2 RETURNING id, name",
      [trimmedName, parsedID]
    );

    if (updated.length === 0) {
      return {
        success: false,
        message: `Tag with ID ${parsedID} does not exist`,
      };
    }

    const formattedTag: ShootEntity = {
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
  await verifyAndRefreshSession();

  const parsedID = parseInt(String(id), 10);

  if (Number.isNaN(parsedID) || parsedID <= 0) {
    return {
      success: false,
      message: "Valid tag ID is required",
    };
  }

  try {
    const { rows: shoots } = await pool.query<ShootLinkRow>(
      "SELECT shoot_id FROM shoot_tag WHERE tag_id = $1",
      [parsedID]
    );

    if (shoots.length > 0) {
      return {
        success: false,
        message: "Tag cannot be deleted because it appears in existing shoot(s)",
      };
    }

    const { rows: deleted } = await pool.query<EntityRow>(
      "DELETE FROM tag WHERE id = $1 RETURNING id, name",
      [parsedID]
    );

    if (deleted.length === 0) {
      return {
        success: false,
        message: `Tag number ${parsedID} does not exist`,
      };
    }

    const { rows } = await pool.query<EntityRow>(
      "SELECT id, name FROM tag ORDER BY name ASC"
    );

    const formattedTags: ShootEntity[] = rows.map(row => {
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