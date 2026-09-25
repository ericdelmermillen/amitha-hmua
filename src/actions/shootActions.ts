"use server";

import { 
  type ActionResponse,
  type GetShootSummariesParams, 
  type GetShootSummariesResponse, 
  type ShootData, 
  type ShootDetailResponse, 
  type ShootSummary,
  type ShootEntity,
} from "@/typing/interfaces";
import { pool } from "@/db/dbClient";
import { deleteFiles } from "@/s3/s3";
import { verifyAndRefreshSession } from "@/utils/tokenUtils";

const BUCKET_PATH = process.env.BUCKET_PATH ?? "";
const DIRNAME = process.env.SHOOTS_DIRNAME ?? "";

interface ShootSummaryRow {
  shoot_id: number;
  shoot_date: string | null;
  display_order: number;
  photographers: string[] | null;
  models: string[] | null;
  tags: string[] | null;
  img_url: string | null;
}

interface ShootRow {
  shoot_id: number;
  shoot_date: string | null;
}

interface PhotoRow {
  id: number;
  display_order: number;
  img_url: string;
}

// getShootSummaries
const getShootSummaries = async ({
  page = 1,
  limit = 10,
  tagID,
}: GetShootSummariesParams = {}): Promise<GetShootSummariesResponse> => {
  try {
    const pageInt = parseInt(String(page), 10) || 1;
    const limitInt = parseInt(String(limit), 10) || 10;
    const offset = (pageInt - 1) * limitInt;

    const params: (string | number)[] = [];
    let paramIndex = 1;

    let filterClause = "";
    if (tagID !== undefined && tagID !== null && tagID !== "") {
      filterClause = `
        WHERE EXISTS (
          SELECT 1 
          FROM shoot_tag st 
          WHERE st.shoot_id = s.id 
          AND st.tag_id = $${paramIndex}
        )
      `;
      params.push(tagID);
      paramIndex++;
    }

    const query = `
      SELECT 
        s.id AS shoot_id,
        TO_CHAR(s.date, 'YYYY-MM-DD') AS shoot_date,
        s.display_order,
        COALESCE(
          ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL),
          ARRAY[]::text[]
        ) AS photographers,
        COALESCE(
          ARRAY_AGG(DISTINCT m.name) FILTER (WHERE m.name IS NOT NULL),
          ARRAY[]::text[]
        ) AS models,
        COALESCE(
          ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL),
          ARRAY[]::text[]
        ) AS tags,
        (
          SELECT ph.img_url 
          FROM photo ph 
          WHERE ph.shoot_id = s.id 
          ORDER BY ph.display_order ASC 
          LIMIT 1
        ) AS img_url
      FROM shoot s
      LEFT JOIN shoot_photographer sp ON s.id = sp.shoot_id
      LEFT JOIN photographer p ON sp.photographer_id = p.id
      LEFT JOIN shoot_model sm ON s.id = sm.shoot_id
      LEFT JOIN model m ON sm.model_id = m.id
      LEFT JOIN shoot_tag st ON s.id = st.shoot_id
      LEFT JOIN tag t ON st.tag_id = t.id
      ${filterClause}
      GROUP BY s.id, s.date, s.display_order
      ORDER BY s.display_order ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limitInt, offset);

    const { rows } = await pool.query<ShootSummaryRow>(query, params);

    const shootSummaries: ShootSummary[] = rows.map((shoot) => {
      return {
        shootID: shoot.shoot_id,
        displayOrder: shoot.display_order,
        shootDate: shoot.shoot_date ?? "",
        tags: shoot.tags ?? [],
        photographers: shoot.photographers ?? [],
        models: shoot.models ?? [],
        thumbnailURL: shoot.img_url
          ? `${BUCKET_PATH}${DIRNAME}/${shoot.img_url}`
          : "",
      };
    });

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
  const parsedID = parseInt(String(id), 10);

  if (Number.isNaN(parsedID) || parsedID <= 0) {
    return {
      success: false,
      message: "Valid shoot ID is required",
      data: null,
    };
  }

  try {
    const { rows: shoots } = await pool.query<ShootRow>(
      "SELECT id AS shoot_id, TO_CHAR(date, 'YYYY-MM-DD') AS shoot_date FROM shoot WHERE id = $1 LIMIT 1",
      [parsedID]
    );

    if (shoots.length === 0) {
      return {
        success: false,
        message: "Shoot not found",
        data: null,
      };
    }

    const shoot = shoots[0];

    const [
      { rows: photographers },
      { rows: models },
      { rows: tags },
      { rows: photos },
    ] = await Promise.all([
      pool.query<ShootEntity>(
        `SELECT p.id, p.name 
         FROM photographer p
         JOIN shoot_photographer sp ON p.id = sp.photographer_id
         WHERE sp.shoot_id = $1`,
        [parsedID]
      ),
      pool.query<ShootEntity>(
        `SELECT m.id, m.name 
         FROM model m
         JOIN shoot_model sm ON m.id = sm.model_id
         WHERE sm.shoot_id = $1`,
        [parsedID]
      ),
      pool.query<ShootEntity>(
        `SELECT t.id, t.name 
         FROM tag t
         JOIN shoot_tag st ON t.id = st.tag_id
         WHERE st.shoot_id = $1`,
        [parsedID]
      ),
      pool.query<PhotoRow>(
        `SELECT id, display_order, img_url 
         FROM photo 
         WHERE shoot_id = $1 
         ORDER BY display_order ASC 
         LIMIT 10`,
        [parsedID]
      ),
    ]);

    return {
      success: true,
      message: "Shoot details retrieved successfully",
      data: {
        shoot_id: shoot.shoot_id,
        shoot_date: shoot.shoot_date,
        photographer_ids: photographers.map(p => p.id),
        photographers: photographers.map(p => p.name),
        model_ids: models.map(m => m.id),
        models: models.map(m => m.name),
        tag_ids: tags.map(t => t.id),
        tags: tags.map(t => t.name),
        photo_urls: photos.map((photo) => {
          return {
            id: photo.id,
            display_order: photo.display_order,
            photo_url: photo.img_url.startsWith("http")
              ? photo.img_url
              : `${BUCKET_PATH}${DIRNAME}/${photo.img_url}`,
          };
        }),
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
  photo_urls,
}: ShootData): Promise<ActionResponse> => {
  await verifyAndRefreshSession();

  if (!photo_urls || photo_urls.length === 0) {
    return {
      success: false,
      message: "Photos not added",
    };
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Shift display order forward
    await client.query(
      "UPDATE shoot SET display_order = display_order + 1"
    );

    // 2. Insert shoot record
    const { rows: shootRows } = await client.query<{ id: number }>(
      "INSERT INTO shoot (date, display_order) VALUES ($1, 1) RETURNING id",
      [shoot_date]
    );

    const shootId = shootRows[0].id;

    // 3. Link tags
    for (const tagId of tag_ids) {
      await client.query(
        "INSERT INTO shoot_tag (shoot_id, tag_id) VALUES ($1, $2)",
        [shootId, tagId]
      );
    }

    // 4. Link photographers
    for (const photographerId of photographer_ids) {
      await client.query(
        "INSERT INTO shoot_photographer (shoot_id, photographer_id) VALUES ($1, $2)",
        [shootId, photographerId]
      );
    }

    // 5. Link models
    for (const modelId of model_ids) {
      await client.query(
        "INSERT INTO shoot_model (shoot_id, model_id) VALUES ($1, $2)",
        [shootId, modelId]
      );
    }

    // 6. Insert photos
    for (const [idx, photoUrl] of photo_urls.entries()) {
      await client.query(
        "INSERT INTO photo (shoot_id, display_order, img_url) VALUES ($1, $2, $3)",
        [shootId, idx + 1, photoUrl]
      );
    }

    await client.query("COMMIT");

    return {
      success: true,
      message: "Shoot added successfully",
    };
  } catch (error) {
    await client.query("ROLLBACK");

    // Cleanup S3 uploads if transaction fails
    try {
      const objKeys = photo_urls.map(url => `${DIRNAME}/${url}`);
      await deleteFiles(objKeys);
    } catch (deleteError) {
      console.error("Error deleting files from AWS:", deleteError);
    }

    console.error("Error adding shoot:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    };
  } finally {
    client.release();
  }
};

// editShootByID
const editShootByID = async (
  shootId: number,
  shootData: ShootData
): Promise<ActionResponse> => {
  await verifyAndRefreshSession();

  const parsedID = parseInt(String(shootId), 10);

  if (Number.isNaN(parsedID) || parsedID <= 0) {
    return {
      success: false,
      message: "Valid shoot ID is required",
    };
  }

  const {
    shoot_date,
    tag_ids,
    photographer_ids,
    model_ids,
    photo_urls,
  } = shootData;

  if (!photo_urls || photo_urls.length === 0) {
    return {
      success: false,
      message: "Photos not added",
    };
  }

  const client = await pool.connect();
  let s3KeysToDelete: string[] = [];

  try {
    await client.query("BEGIN");

    // 1. Verify shoot exists and grab existing photos to calculate S3 diff
    const { rows: existingPhotos } = await client.query<{ img_url: string }>(
      "SELECT img_url FROM photo WHERE shoot_id = $1",
      [parsedID]
    );

    const { rows: updatedShoot } = await client.query<{ id: number }>(
      "UPDATE shoot SET date = $1 WHERE id = $2 RETURNING id",
      [shoot_date, parsedID]
    );

    if (updatedShoot.length === 0) {
      throw new Error(`Shoot with ID ${parsedID} not found`);
    }

    s3KeysToDelete = existingPhotos
      .filter(({ img_url }) => {
        return !img_url.includes("http") && !photo_urls.includes(img_url);
      })
      .map(({ img_url }) => {
        return `${DIRNAME}/${img_url}`;
      });

    // 2. Clear old junction and photo records
    await client.query("DELETE FROM shoot_photographer WHERE shoot_id = $1", [parsedID]);
    await client.query("DELETE FROM shoot_model WHERE shoot_id = $1", [parsedID]);
    await client.query("DELETE FROM shoot_tag WHERE shoot_id = $1", [parsedID]);
    await client.query("DELETE FROM photo WHERE shoot_id = $1", [parsedID]);

    // 3. Re-link entities
    for (const tagId of tag_ids) {
      await client.query(
        "INSERT INTO shoot_tag (shoot_id, tag_id) VALUES ($1, $2)",
        [parsedID, tagId]
      );
    }

    for (const photographerId of photographer_ids) {
      await client.query(
        "INSERT INTO shoot_photographer (shoot_id, photographer_id) VALUES ($1, $2)",
        [parsedID, photographerId]
      );
    }

    for (const modelId of model_ids) {
      await client.query(
        "INSERT INTO shoot_model (shoot_id, model_id) VALUES ($1, $2)",
        [parsedID, modelId]
      );
    }

    for (const [idx, photoUrl] of photo_urls.entries()) {
      await client.query(
        "INSERT INTO photo (shoot_id, display_order, img_url) VALUES ($1, $2, $3)",
        [parsedID, idx + 1, photoUrl]
      );
    }

    await client.query("COMMIT");

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
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error editing shoot:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    };
  } finally {
    client.release();
  }
};

// deleteShootByID
const deleteShootByID = async (id: number): Promise<ActionResponse> => {
  await verifyAndRefreshSession();

  const parsedID = parseInt(String(id), 10);

  if (Number.isNaN(parsedID) || parsedID <= 0) {
    return {
      success: false,
      message: "Valid shoot ID is required",
    };
  }

  const client = await pool.connect();
  let photoObjKeys: string[] = [];

  try {
    await client.query("BEGIN");

    // Gather photo keys before deletion for S3 cleanup
    const { rows: photoRows } = await client.query<{ img_url: string }>(
      "SELECT img_url FROM photo WHERE shoot_id = $1",
      [parsedID]
    );

    photoObjKeys = photoRows.map(({ img_url }) => `${DIRNAME}/${img_url}`);

    // CASCADE foreign keys automatically clear photo, shoot_model, shoot_photographer, and shoot_tag
    const { rows: deleted } = await client.query<{ id: number }>(
      "DELETE FROM shoot WHERE id = $1 RETURNING id",
      [parsedID]
    );

    if (deleted.length === 0) {
      throw new Error(`Shoot number ${parsedID} does not exist`);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting shoot from DB:", error);
    return {
      success: false,
      message: "Failed to delete shoot",
    };
  } finally {
    client.release();
  }

  if (photoObjKeys.length > 0) {
    try {
      const deleteResponse = await deleteFiles(photoObjKeys);
      if (!deleteResponse) {
        throw new Error("Failed to delete files from AWS");
      }
    } catch (awsError) {
      console.error("Error deleting file from AWS:", awsError);
      return {
        success: false,
        message: "Shoot deleted from database, but failed to delete files from AWS",
      };
    }
  }

  return {
    success: true,
    message: `Shoot number ${parsedID} deleted successfully`,
  };
};

// updateShootOrder
// UI not ready for this: action not tested
const updateShootOrder = async (orderedShootIDs: number[]): Promise<ActionResponse> => {
  await verifyAndRefreshSession();

  if (!orderedShootIDs || orderedShootIDs.length === 0) {
    return {
      success: false,
      message: "Ordered shoot IDs are required",
    };
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const [index, shootId] of orderedShootIDs.entries()) {
      await client.query(
        "UPDATE shoot SET display_order = $1 WHERE id = $2",
        [index + 1, shootId]
      );
    }

    await client.query("COMMIT");

    return {
      success: true,
      message: "Shoot order updated successfully",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating shoot order:", error);
    return {
      success: false,
      message: "Failed to update shoot order",
    };
  } finally {
    client.release();
  }
};

export {
  getShootSummaries,
  getShootByID,
  addShoot,
  editShootByID,
  deleteShootByID,
  updateShootOrder,
};