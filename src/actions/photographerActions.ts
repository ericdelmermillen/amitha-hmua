"use server";

import { pool } from "@/db/dbClient";
import { 
  AddPhotographerResponse, 
  DeletePhotographerResponse, 
  EditPhotographerResponse, 
  GetAllPhotographersResponse, 
  Photographer, 
  PhotographerRow, 
  PhotographerShoot, 
  ShootLinkRow
} from "@/typing/interfaces";
import { ResultSetHeader } from "mysql2";

// getAllPhotographers
const getAllPhotographers = async (): Promise<GetAllPhotographersResponse> => {
  try {
    const [rows] = await pool.query<PhotographerRow[]>(
      "SELECT id, name FROM photographers ORDER BY name ASC"
    );

    const formattedPhotographers: Photographer[] = rows.map((row) => {
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
  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      success: false,
      message: "Photographer name is required",
    };
  }

  try {
    const [existing] = await pool.query<PhotographerRow[]>(
      "SELECT id, name FROM photographers WHERE name = ? LIMIT 1",
      [trimmedName]
    );

    if (existing.length > 0) {
      return {
        success: false,
        message: "A photographer with that name already exists",
      };
    }

    await pool.query(
      "INSERT INTO photographers (name) VALUES (?)",
      [trimmedName]
    );

    const [rows] = await pool.query<PhotographerRow[]>(
      "SELECT id, name FROM photographers ORDER BY name ASC"
    );

    const formattedPhotographers: Photographer[] = rows.map((row) => {
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
const editPhotographerByID = async (id: number, newname: string): Promise<EditPhotographerResponse> => {
  const parsedID = parseInt(String(id), 10);
  const trimmedName = newname.trim();

  if (isNaN(parsedID) || parsedID <= 0) {
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
    const [existing] = await pool.query<PhotographerRow[]>(
      "SELECT id, name FROM photographers WHERE id = ? LIMIT 1",
      [parsedID]
    );

    if (existing.length === 0) {
      return {
        success: false,
        message: `Photographer with ID ${parsedID} does not exist`,
      };
    }

    const [duplicate] = await pool.query<PhotographerRow[]>(
      "SELECT id, name FROM photographers WHERE id != ? AND name = ? LIMIT 1",
      [parsedID, trimmedName]
    );

    if (duplicate.length > 0) {
      return {
        success: false,
        message: `Photographer name "${trimmedName}" already exists`,
      };
    }

    await pool.query(
      "UPDATE photographers SET name = ? WHERE id = ?",
      [trimmedName, parsedID]
    );

    const [updatedRows] = await pool.query<PhotographerRow[]>(
      "SELECT id, name FROM photographers WHERE id = ? LIMIT 1",
      [parsedID]
    );

    const formattedPhotographer: Photographer = {
      id: updatedRows[0].id,
      name: updatedRows[0].name,
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
  const parsedID = parseInt(String(id), 10);

  if (isNaN(parsedID) || parsedID <= 0) {
    return {
      success: false,
      message: "Valid photographer ID is required",
    };
  }

  try {
    const [shootLinks] = await pool.query<ShootLinkRow[]>(
      "SELECT shoot_id FROM shoot_photographers WHERE photographer_id = ?",
      [parsedID]
    );

    if (shootLinks.length > 0) {
      const photographerShoots: PhotographerShoot[] = shootLinks.map((s) => {
        return {
          shoot_id: s.shoot_id,
        };
      });

      return {
        success: false,
        message: "Photographer cannot be deleted because they appear in existing shoot(s)",
        photographerShoots,
      };
    }

    const [existing] = await pool.query<PhotographerRow[]>(
      "SELECT id, name FROM photographers WHERE id = ? LIMIT 1",
      [parsedID]
    );

    if (existing.length === 0) {
      return {
        success: false,
        message: `Photographer number ${parsedID} does not exist`,
      };
    }

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM photographers WHERE id = ?",
      [parsedID]
    );

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: `Photographer number ${parsedID} not deleted`,
      };
    }

    const [rows] = await pool.query<PhotographerRow[]>(
      "SELECT id, name FROM photographers ORDER BY name ASC"
    );

    const formattedPhotographers: Photographer[] = rows.map((row) => {
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