"use server";

import { 
  type AddPhotographerResponse, 
  type DeletePhotographerResponse, 
  type EditPhotographerResponse, 
  type GetAllPhotographersResponse, 
  type ShootLinkRow, 
  type ShootEntity, 
  type EntityRow, 
} from "@/typing/interfaces";
import { pool } from "@/db/dbClient";
import { verifyAndRefreshSession } from "@/utils/tokenUtils";

// getAllPhotographers
const getAllPhotographers = async (): Promise<GetAllPhotographersResponse> => {
  await verifyAndRefreshSession();
  
  try {
    const { rows } = await pool.query<EntityRow>(
      "SELECT id, name FROM photographer ORDER BY name ASC"
    );

    const formattedPhotographers: ShootEntity[] = rows.map(row => {
      return {
        id: row.id,
        name: row.name,
      };
    });

    return {
      success: true,
      message: "Photographers fetched successfully",
      photographers: formattedPhotographers,
    };
  } catch (error) {
    console.error("Error fetching photographers:", error);
    return {
      success: false,
      message: "Failed to fetch photographers",
      photographers: [],
    };
  }
};

// addPhotographer
const addPhotographer = async (name: string): Promise<AddPhotographerResponse> => {
  await verifyAndRefreshSession();

  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      success: false,
      message: "Photographer name is required",
    };
  }

  try {
    const { rows: inserted } = await pool.query<EntityRow>(
      "INSERT INTO photographer (name) VALUES ($1) ON CONFLICT (LOWER(name)) DO NOTHING RETURNING id, name",
      [trimmedName]
    );

    if (inserted.length === 0) {
      return {
        success: false,
        message: "A photographer with that name already exists",
      };
    }

    const { rows } = await pool.query<EntityRow>(
      "SELECT id, name FROM photographer ORDER BY name ASC"
    );

    const formattedPhotographers: ShootEntity[] = rows.map(row => {
      return {
        id: row.id,
        name: row.name,
      };
    });

    return {
      success: true,
      message: "Photographer added successfully",
      photographers: formattedPhotographers,
    };
  } catch (error) {
    console.error("Error adding photographer:", error);
    return {
      success: false,
      message: "Failed to add photographer",
    };
  }
};

// editPhotographerByID
const editPhotographerByID = async (id: number, name: string): Promise<EditPhotographerResponse> => {
  await verifyAndRefreshSession();

  const parsedID = parseInt(String(id), 10);
  const trimmedName = name.trim();

  if (Number.isNaN(parsedID) || parsedID <= 0) {
    return {
      success: false,
      message: "Valid photographer ID is required",
    };
  }

  if (!trimmedName) {
    return {
      success: false,
      message: "Photographer name is required",
    };
  }

  try {
    const { rows: duplicate } = await pool.query<EntityRow>(
      "SELECT id, name FROM photographer WHERE LOWER(name) = LOWER($1) AND id != $2 LIMIT 1",
      [trimmedName, parsedID]
    );

    if (duplicate.length > 0) {
      return {
        success: false,
        message: `Photographer name "${trimmedName}" already exists`,
      };
    }

    const { rows: updated } = await pool.query<EntityRow>(
      "UPDATE photographer SET name = $1 WHERE id = $2 RETURNING id, name",
      [trimmedName, parsedID]
    );

    if (updated.length === 0) {
      return {
        success: false,
        message: `Photographer with ID ${parsedID} does not exist`,
      };
    }

    const formattedPhotographer: ShootEntity = {
      id: updated[0].id,
      name: updated[0].name,
    };

    return {
      success: true,
      message: `Photographer with ID ${parsedID} updated successfully`,
      updatedPhotographer: formattedPhotographer,
    };
  } catch (error) {
    console.error("Error updating photographer:", error);
    return {
      success: false,
      message: "Failed to update photographer",
    };
  }
};

// deletePhotographerByID
const deletePhotographerByID = async (id: number): Promise<DeletePhotographerResponse> => {
  await verifyAndRefreshSession();

  const parsedID = parseInt(String(id), 10);

  if (Number.isNaN(parsedID) || parsedID <= 0) {
    return {
      success: false,
      message: "Valid photographer ID is required",
    };
  }

  try {
    const { rows: shoots } = await pool.query<ShootLinkRow>(
      "SELECT shoot_id FROM shoot_photographer WHERE photographer_id = $1",
      [parsedID]
    );

    if (shoots.length > 0) {
      return {
        success: false,
        message: "Photographer cannot be deleted because they appear in existing shoot(s)",
      };
    }

    const { rows: deleted } = await pool.query<EntityRow>(
      "DELETE FROM photographer WHERE id = $1 RETURNING id, name",
      [parsedID]
    );

    if (deleted.length === 0) {
      return {
        success: false,
        message: `Photographer number ${parsedID} does not exist`,
      };
    }

    const { rows } = await pool.query<EntityRow>(
      "SELECT id, name FROM photographer ORDER BY name ASC"
    );

    const formattedPhotographers: ShootEntity[] = rows.map(row => {
      return {
        id: row.id,
        name: row.name,
      };
    });

    return {
      success: true,
      message: "Photographer deleted successfully",
      photographers: formattedPhotographers,
    };
  } catch (error) {
    console.error("Error deleting photographer:", error);
    return {
      success: false,
      message: "Failed to delete photographer",
    };
  }
};

export {
  getAllPhotographers,
  addPhotographer,
  editPhotographerByID,
  deletePhotographerByID
};