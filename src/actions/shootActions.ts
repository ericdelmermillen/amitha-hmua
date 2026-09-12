"use server";

import { 
  ActionResponse,
  GetShootSummariesParams, 
  GetShootSummariesResponse, 
  ShootData, 
  ShootDetailResponse, 
  ShootSummary,
} from "@/typing/interfaces";
import { pool } from "@/db/dbClient";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { deleteFiles } from "@/s3/s3";
import { verifyAndRefreshSession } from "@/utils/tokenUtils";

const BUCKET_PATH = process.env.BUCKET_PATH || "";
const DIRNAME = process.env.SHOOTS_DIRNAME || "";

// getShootSummaries
const getShootSummaries = async ({
  page = 1,
  limit = 10,
  tagID,
}: GetShootSummariesParams = {}): Promise<GetShootSummariesResponse> => {
  try {
    const pageInt = parseInt(page as any, 10) || 1;
    const limitInt = parseInt(limit as any, 10) || 10;
    const offset = (pageInt - 1) * limitInt;

    let query = `
      SELECT 
        shoots.id AS shoot_id,
        shoots.shoot_date,
        shoots.display_order,
        GROUP_CONCAT(DISTINCT photographers.name) AS photographers,
        GROUP_CONCAT(DISTINCT models.name) AS models,
        GROUP_CONCAT(DISTINCT tags.name) AS tags,
        SUBSTRING_INDEX(
          GROUP_CONCAT(DISTINCT photos.photo_url ORDER BY photos.display_order ASC),
          ",", 1
        ) AS photo_url
      FROM shoots
      LEFT JOIN shoot_photographers 
        ON shoots.id = shoot_photographers.shoot_id
      LEFT JOIN photographers 
        ON shoot_photographers.photographer_id = photographers.id
      LEFT JOIN shoot_models 
        ON shoots.id = shoot_models.shoot_id
      LEFT JOIN models 
        ON shoot_models.model_id = models.id
      LEFT JOIN photos 
        ON shoots.id = photos.shoot_id
      LEFT JOIN shoot_tags 
        ON shoots.id = shoot_tags.shoot_id
      LEFT JOIN tags 
        ON shoot_tags.tag_id = tags.id
    `;

    const params: (string | number)[] = [];

    if (tagID !== undefined && tagID !== null && tagID !== "") {
      query += `
        WHERE EXISTS (
          SELECT 1 
          FROM shoot_tags 
          WHERE shoot_tags.shoot_id = shoots.id
          AND shoot_tags.tag_id = ?
        )
      `;
      params.push(tagID);
    }

    query += `
      GROUP BY shoots.id, shoots.shoot_date, shoots.display_order
      ORDER BY shoots.display_order
      LIMIT ? OFFSET ?
    `;

    params.push(limitInt, offset);

    const [rows] = (await pool.query(query, params)) as [any[], any];

    const shootSummaries: ShootSummary[] = rows.map((shoot) => ({
      shootID: shoot.shoot_id,
      displayOrder: shoot.display_order,
      shootDate: shoot.shoot_date
        ? new Date(shoot.shoot_date).toISOString().split("T")[0]
        : "",
      tags: shoot.tags ? shoot.tags.split(",") : [],
      photographers: shoot.photographers ? shoot.photographers.split(",") : [],
      models: shoot.models ? shoot.models.split(",") : [],
      thumbnailURL: shoot.photo_url
        ? `${BUCKET_PATH}${DIRNAME}/${shoot.photo_url}`
        : "",
    }));

    return {
      shootSummaries,
      isFinalPage: rows.length < limitInt,
    };
  } catch (error) {
    console.error("Error fetching shoot summaries:", error);
    throw new Error("Error fetching shoot summaries");
  }
};

// getShootByID
const getShootByID = async (id: number): Promise<ShootDetailResponse> => {
  try {
    const [shoots] = await pool.query<RowDataPacket[]>(
      "SELECT id AS shoot_id, shoot_date FROM shoots WHERE id = ? LIMIT 1",
      [id]
    );

    if (!shoots.length) {
      return {
        success: false,
        message: "Shoot not found",
        data: null,
      };
    }

    const shoot = shoots[0];

    const [
      [photographers],
      [models],
      [tags],
      [photos],
    ] = await Promise.all([
      pool.query<RowDataPacket[]>(
        `SELECT p.id, p.name 
         FROM photographers p
         JOIN shoot_photographers sp ON p.id = sp.photographer_id
         WHERE sp.shoot_id = ?`,
        [id]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT m.id, m.name 
         FROM models m
         JOIN shoot_models sm ON m.id = sm.model_id
         WHERE sm.shoot_id = ?`,
        [id]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT t.id, t.name 
         FROM tags t
         JOIN shoot_tags st ON t.id = st.tag_id
         WHERE st.shoot_id = ?`,
        [id]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT id, display_order, photo_url 
         FROM photos 
         WHERE shoot_id = ? 
         ORDER BY display_order ASC 
         LIMIT 10`,
        [id]
      ),
    ]);

    return {
      success: true,
      message: "Shoot details retrieved successfully",
      data: {
        shoot_id: shoot.shoot_id,
        shoot_date: shoot.shoot_date
          ? new Date(shoot.shoot_date).toISOString().split("T")[0]
          : null,

        photographer_ids: photographers.map((p) => p.id),
        photographers: photographers.map((p) => p.name),

        model_ids: models.map((m) => m.id),
        models: models.map((m) => m.name),

        tag_ids: tags.map((t) => t.id),
        tags: tags.map((t) => t.name),

        photo_urls: photos.map((photo) => ({
          id: photo.id,
          display_order: photo.display_order,
          photo_url: photo.photo_url?.startsWith("http")
            ? photo.photo_url
            : `${BUCKET_PATH}${DIRNAME}/${photo.photo_url}`,
        })),
      },
    };
  } catch (error) {
    console.error("getShootByID error:", error);
    return {
      success: false,
      message: "Failed to retrieve shoot details. Please try again.",
      data: null,
    };
  }
};

// addShoot
const addShoot = async ({
  shoot_date,
  tag_ids,
  photographer_ids,
  model_ids,
  photo_urls }: ShootData): Promise<ActionResponse> => {
  await verifyAndRefreshSession();

  if (!photo_urls || photo_urls.length === 0) {
    return {
      success: false,
      message: "Photos not added",
    };
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Shift display order so newest shoot takes slot 1
    await connection.query(
      "UPDATE shoots SET display_order = display_order + 1"
    );

    // 2. Insert shoot record
    const [ shootResult ] = await connection.query<ResultSetHeader>(
      "INSERT INTO shoots (shoot_date, display_order) VALUES (?, ?)",
      [shoot_date, 1]
    );

    const shootId = shootResult.insertId;

    // 3. Link tags
    for (const tagId of tag_ids) {
      const [ tagRows ] = await connection.query<RowDataPacket[]>(
        "SELECT id FROM tags WHERE id = ? LIMIT 1",
        [tagId]
      );

      if (!tagRows.length) {
        throw new Error(`Tag with ID ${tagId} not found`);
      }

      await connection.query(
        "INSERT INTO shoot_tags (shoot_id, tag_id) VALUES (?, ?)",
        [shootId, tagId]
      );
    }

    // 4. Link photographers
    for (const photographerId of photographer_ids) {
      const [ rows ] = await connection.query<RowDataPacket[]>(
        "SELECT id FROM photographers WHERE id = ? LIMIT 1",
        [photographerId]
      );

      if (!rows.length) {
        throw new Error(`Photographer with ID ${photographerId} not found`);
      }

      await connection.query(
        "INSERT INTO shoot_photographers (shoot_id, photographer_id) VALUES (?, ?)",
        [shootId, photographerId]
      );
    }

    // 5. Link models
    for (const modelId of model_ids) {
      const [ rows ] = await connection.query<RowDataPacket[]>(
        "SELECT id FROM models WHERE id = ? LIMIT 1",
        [modelId]
      );

      if (!rows.length) {
        throw new Error(`Model with ID ${modelId} not found`);
      }

      await connection.query(
        "INSERT INTO shoot_models (shoot_id, model_id) VALUES (?, ?)",
        [shootId, modelId]
      );
    }

    // 6. Insert photos
    for (const [idx, photoUrl] of photo_urls.entries()) {
      await connection.query(
        "INSERT INTO photos (shoot_id, display_order, photo_url) VALUES (?, ?, ?)",
        [shootId, idx + 1, photoUrl]
      );
    }

    await connection.commit();

    return {
      success: true,
      message: "Shoot added successfully",
    };
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
    }

    // Clean up uploaded S3 objects if database transaction fails
    try {
      const objKeys = photo_urls.map((url) => `${DIRNAME}/${url}`);
      await deleteFiles(objKeys);
    } catch (deleteError) {
      console.error("Error deleting files from AWS:", deleteError);
    }

    console.error("Error adding shoot:", error);

    return {
      success: false,
      message: error?.message || "Internal server error",
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};




// const editShootByID = () => {
const editShootByID = async (
  shootId: number,
  shootData: ShootData
): Promise<ActionResponse> => {
  const {
    shoot_date,
    tag_ids,
    photographer_ids,
    model_ids,
    photo_urls,
  } = shootData;

  await verifyAndRefreshSession();

  if (!photo_urls || photo_urls.length === 0) {
    return {
      success: false,
      message: "Photos not added",
    };
  }

  let connection;
  let s3KeysToDelete: string[] = [];

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Check shoot existence
    const [existing] = await connection.query<RowDataPacket[]>(
      "SELECT id FROM shoots WHERE id = ? LIMIT 1",
      [shootId]
    );

    if (!existing.length) {
      throw new Error("Shoot not found");
    }

    // 2. Query existing photos to calculate S3 cleanup diff
    const [existingPhotos] = await connection.query<RowDataPacket[]>(
      "SELECT photo_url FROM photos WHERE shoot_id = ?",
      [shootId]
    );

    s3KeysToDelete = existingPhotos
      .filter((row) => {
        return !row.photo_url.includes("http") && !photo_urls.includes(row.photo_url);
      })
      .map((row) => `${DIRNAME}/${row.photo_url}`);

    // 3. Update shoot date
    await connection.query(
      "UPDATE shoots SET shoot_date = ? WHERE id = ?",
      [shoot_date, shootId]
    );

    // 4. Clear existing relational bindings
    await connection.query(
      "DELETE FROM shoot_photographers WHERE shoot_id = ?",
      [shootId]
    );
    await connection.query(
      "DELETE FROM shoot_models WHERE shoot_id = ?",
      [shootId]
    );
    await connection.query(
      "DELETE FROM shoot_tags WHERE shoot_id = ?",
      [shootId]
    );
    await connection.query(
      "DELETE FROM photos WHERE shoot_id = ?",
      [shootId]
    );

    // 5. Re-link tags
    for (const tagId of tag_ids) {
      const [rows] = await connection.query<RowDataPacket[]>(
        "SELECT id FROM tags WHERE id = ? LIMIT 1",
        [tagId]
      );

      if (!rows.length) {
        throw new Error(`Tag with ID ${tagId} not found`);
      }

      await connection.query(
        "INSERT INTO shoot_tags (shoot_id, tag_id) VALUES (?, ?)",
        [shootId, tagId]
      );
    }

    // 6. Re-link photographers
    for (const photographerId of photographer_ids) {
      const [rows] = await connection.query<RowDataPacket[]>(
        "SELECT id FROM photographers WHERE id = ? LIMIT 1",
        [photographerId]
      );

      if (!rows.length) {
        throw new Error(`Photographer with ID ${photographerId} not found`);
      }

      await connection.query(
        "INSERT INTO shoot_photographers (shoot_id, photographer_id) VALUES (?, ?)",
        [shootId, photographerId]
      );
    }

    // 7. Re-link models
    for (const modelId of model_ids) {
      const [rows] = await connection.query<RowDataPacket[]>(
        "SELECT id FROM models WHERE id = ? LIMIT 1",
        [modelId]
      );

      if (!rows.length) {
        throw new Error(`Model with ID ${modelId} not found`);
      }

      await connection.query(
        "INSERT INTO shoot_models (shoot_id, model_id) VALUES (?, ?)",
        [shootId, modelId]
      );
    }

    // 8. Re-insert photos
    for (const [idx, photoUrl] of photo_urls.entries()) {
      await connection.query(
        "INSERT INTO photos (shoot_id, display_order, photo_url) VALUES (?, ?, ?)",
        [shootId, idx + 1, photoUrl]
      );
    }

    await connection.commit();

    // 9. Clean up deleted S3 files after successful commit
    if (s3KeysToDelete.length > 0) {
      try {
        await deleteFiles(s3KeysToDelete);
      } catch (s3Error) {
        console.error("Error deleting removed files from S3:", s3Error);
      }
    }

    return {
      success: true,
      message: "Shoot updated successfully",
    };
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Error editing shoot:", error);

    return {
      success: false,
      message: error?.message || "Internal server error",
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};




const deleteShootByID = async (id: number): Promise<ActionResponse> => {
  await verifyAndRefreshSession();

  let connection;
  let photoObjKeys: { photo_url: string }[] = [];

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [photoRows] = await connection.query<RowDataPacket[]>(
      "SELECT photo_url FROM photos WHERE shoot_id = ?",
      [id]
    );

    photoObjKeys = photoRows as { photo_url: string }[];

    await connection.query(
      "DELETE FROM photos WHERE shoot_id = ?",
      [id]
    );

    await connection.query(
      "DELETE FROM shoot_models WHERE shoot_id = ?",
      [id]
    );

    await connection.query(
      "DELETE FROM shoot_photographers WHERE shoot_id = ?",
      [id]
    );

    await connection.query(
      "DELETE FROM shoot_tags WHERE shoot_id = ?",
      [id]
    );

    const [result] = await connection.query<ResultSetHeader>(
      "DELETE FROM shoots WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error(`Shoot number ${id} not deleted`);
    }

    await connection.commit();
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error deleting shoot from DB:", error);
    return {
      success: false,
      message: "Failed to delete shoot",
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }

  try {
    const objKeys = photoObjKeys.map((obj) => `${DIRNAME}/${obj.photo_url}`);

    if (objKeys.length > 0) {
      const deleteResponse = await deleteFiles(objKeys);

      if (!deleteResponse) {
        throw new Error("Error deleting files from AWS");
      }
    }

    return {
      success: true,
      message: `Shoot number ${id} and associated files deleted successfully`,
    };
  } catch (error) {
    console.error("Error deleting file from AWS:", error);
    return {
      success: false,
      message: "Shoot deleted from database, but failed to delete files from AWS",
    };
  }
};

const updateShootOrder = () => {
  console.log("Updating your shoot");
};

export {
  getShootSummaries,
  getShootByID,
  addShoot,
  editShootByID,
  deleteShootByID,
  updateShootOrder,
};