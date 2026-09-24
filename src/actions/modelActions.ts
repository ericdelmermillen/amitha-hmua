"use server";

import { 
  type AddModelResponse, 
  type DeleteModelResponse, 
  type EditModelResponse, 
  type GetAllModelsResponse, 
  type ShootLinkRow, 
  type ShootEntity, 
  type EntityRow, 
} from "@/typing/interfaces";
import { pool } from "@/db/dbClient_pg";
import { verifyAndRefreshSession } from "@/utils/tokenUtils";

// getAllModels
const getAllModels = async (): Promise<GetAllModelsResponse> => {
  await verifyAndRefreshSession();

  try {
    const { rows } = await pool.query<EntityRow>(
      "SELECT id, name FROM model ORDER BY name ASC"
    );

    const formattedModels: ShootEntity[] = rows.map(row => {
      return {
        id: row.id,
        name: row.name,
      };
    });

    return {
      success: true,
      message: "Models fetched successfully",
      models: formattedModels,
    };
  } catch (error) {
    console.error("Error fetching models:", error);
    return {
      success: false,
      message: "Failed to fetch models",
      models: [],
    };
  }
};

// addModel
const addModel = async (name: string): Promise<AddModelResponse> => {
  await verifyAndRefreshSession();

  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      success: false,
      message: "Model name is required",
    };
  }

  try {
    const { rows: inserted } = await pool.query<EntityRow>(
      "INSERT INTO model (name) VALUES ($1) ON CONFLICT (LOWER(name)) DO NOTHING RETURNING id, name",
      [trimmedName]
    );

    if (inserted.length === 0) {
      return {
        success: false,
        message: "A model with that name already exists",
      };
    }

    const { rows } = await pool.query<EntityRow>(
      "SELECT id, name FROM model ORDER BY name ASC"
    );

    const formattedModels: ShootEntity[] = rows.map(row => {
      return {
        id: row.id,
        name: row.name,
      };
    });

    return {
      success: true,
      message: "Model added successfully",
      models: formattedModels,
    };
  } catch (error) {
    console.error("Error adding model:", error);
    return {
      success: false,
      message: "Failed to add model",
    };
  }
};

// editModelByID
const editModelByID = async (id: number, name: string): Promise<EditModelResponse> => {
  await verifyAndRefreshSession();

  const parsedID = parseInt(String(id), 10);
  const trimmedName = name.trim();

  if (Number.isNaN(parsedID) || parsedID <= 0) {
    return {
      success: false,
      message: "Valid model ID is required",
    };
  }

  if (!trimmedName) {
    return {
      success: false,
      message: "Model name is required",
    };
  }

  try {
    const { rows: duplicate } = await pool.query<EntityRow>(
      "SELECT id, name FROM model WHERE LOWER(name) = LOWER($1) AND id != $2 LIMIT 1",
      [trimmedName, parsedID]
    );

    if (duplicate.length > 0) {
      return {
        success: false,
        message: `Model name "${trimmedName}" already exists`,
      };
    }

    const { rows: updated } = await pool.query<EntityRow>(
      "UPDATE model SET name = $1 WHERE id = $2 RETURNING id, name",
      [trimmedName, parsedID]
    );

    if (updated.length === 0) {
      return {
        success: false,
        message: `Model with ID ${parsedID} does not exist`,
      };
    }

    const formattedModel: ShootEntity = {
      id: updated[0].id,
      name: updated[0].name,
    };

    return {
      success: true,
      message: `Model with ID ${parsedID} updated successfully`,
      updatedModel: formattedModel,
    };
  } catch (error) {
    console.error("Error updating model:", error);
    return {
      success: false,
      message: "Failed to update model",
    };
  }
};

// deleteModelByID
const deleteModelByID = async (id: number): Promise<DeleteModelResponse> => {
  await verifyAndRefreshSession();

  const parsedID = parseInt(String(id), 10);

  if (Number.isNaN(parsedID) || parsedID <= 0) {
    return {
      success: false,
      message: "Valid model ID is required",
    };
  }

  try {
    const { rows: shoots } = await pool.query<ShootLinkRow>(
      "SELECT shoot_id FROM shoot_model WHERE model_id = $1",
      [parsedID]
    );

    if (shoots.length > 0) {
      return {
        success: false,
        message: "Model cannot be deleted because they appear in existing shoot(s)",
      };
    }

    const { rows: deleted } = await pool.query<EntityRow>(
      "DELETE FROM model WHERE id = $1 RETURNING id, name",
      [parsedID]
    );

    if (deleted.length === 0) {
      return {
        success: false,
        message: `Model number ${parsedID} does not exist`,
      };
    }

    const { rows } = await pool.query<EntityRow>(
      "SELECT id, name FROM model ORDER BY name ASC"
    );

    const formattedModels: ShootEntity[] = rows.map(row => {
      return {
        id: row.id,
        name: row.name,
      };
    });

    return {
      success: true,
      message: "Model deleted successfully",
      models: formattedModels,
    };
  } catch (error) {
    console.error("Error deleting model:", error);
    return {
      success: false,
      message: "Failed to delete model",
    };
  }
};

export {
  getAllModels,
  addModel,
  editModelByID,
  deleteModelByID
};
