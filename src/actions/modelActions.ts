"use server";

import { pool } from "@/db/dbClient";
import { ResultSetHeader } from "mysql2";
import { 
  AddModelResponse, 
  DeleteModelResponse, 
  EditModelResponse, 
  GetAllModelsResponse, 
  Model, 
  ModelRow, 
  ModelShoot, 
  ShootLinkRow 
} from "@/typing/interfaces";

// getAllModels
const getAllModels = async (): Promise<GetAllModelsResponse> => {
  try {
    const [rows] = await pool.query<ModelRow[]>(
      "SELECT id, model_name FROM models ORDER BY model_name ASC"
    );

    const formattedModels: Model[] = rows.map((row) => {
      return {
        id: row.id,
        modelName: row.model_name,
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
const addModel = async (modelName: string): Promise<AddModelResponse> => {
  const trimmedName = modelName.trim();

  if (!trimmedName) {
    return {
      success: false,
      message: "Model name is required",
    };
  }

  try {
    const [existing] = await pool.query<ModelRow[]>(
      "SELECT id, model_name FROM models WHERE model_name = ? LIMIT 1",
      [trimmedName]
    );

    if (existing.length > 0) {
      return {
        success: false,
        message: "A model with that name already exists",
      };
    }

    await pool.query(
      "INSERT INTO models (model_name) VALUES (?)",
      [trimmedName]
    );

    const [rows] = await pool.query<ModelRow[]>(
      "SELECT id, model_name FROM models ORDER BY model_name ASC"
    );

    const formattedModels: Model[] = rows.map((row) => {
      return {
        id: row.id,
        modelName: row.model_name,
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
const editModelByID = async (id: number, newModelName: string): Promise<EditModelResponse> => {
  const parsedID = parseInt(String(id), 10);
  const trimmedName = newModelName.trim();

  if (isNaN(parsedID) || parsedID <= 0) {
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
    const [existing] = await pool.query<ModelRow[]>(
      "SELECT id, model_name FROM models WHERE id = ? LIMIT 1",
      [parsedID]
    );

    if (existing.length === 0) {
      return {
        success: false,
        message: `Model with ID ${parsedID} does not exist`,
      };
    }

    const [duplicate] = await pool.query<ModelRow[]>(
      "SELECT id, model_name FROM models WHERE model_name = ? AND id != ? LIMIT 1",
      [trimmedName, parsedID]
    );

    if (duplicate.length > 0) {
      return {
        success: false,
        message: `Model name "${trimmedName}" already exists`,
      };
    }

    await pool.query(
      "UPDATE models SET model_name = ? WHERE id = ?",
      [trimmedName, parsedID]
    );

    const [updatedRows] = await pool.query<ModelRow[]>(
      "SELECT id, model_name FROM models WHERE id = ? LIMIT 1",
      [parsedID]
    );

    const formattedModel: Model = {
      id: updatedRows[0].id,
      modelName: updatedRows[0].model_name,
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
  const parsedID = parseInt(String(id), 10);

  if (isNaN(parsedID) || parsedID <= 0) {
    return {
      success: false,
      message: "Valid model ID is required",
    };
  }

  try {
    const [shootLinks] = await pool.query<ShootLinkRow[]>(
      "SELECT shoot_id FROM shoot_models WHERE model_id = ?",
      [parsedID]
    );

    if (shootLinks.length > 0) {
      const modelShoots: ModelShoot[] = shootLinks.map((s) => {
        return {
          shoot_id: s.shoot_id,
        };
      });

      return {
        success: false,
        message: "Model cannot be deleted because they appear in existing shoot(s)",
        modelShoots,
      };
    }

    const [existing] = await pool.query<ModelRow[]>(
      "SELECT id, model_name FROM models WHERE id = ? LIMIT 1",
      [parsedID]
    );

    if (existing.length === 0) {
      return {
        success: false,
        message: `Model number ${parsedID} does not exist`,
      };
    }

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM models WHERE id = ?",
      [parsedID]
    );

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: `Model number ${parsedID} not deleted`,
      };
    }

    const [rows] = await pool.query<ModelRow[]>(
      "SELECT id, model_name FROM models ORDER BY model_name ASC"
    );

    const formattedModels: Model[] = rows.map((row) => {
      return {
        id: row.id,
        modelName: row.model_name,
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