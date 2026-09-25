// "use server";

// import { 
//   ActionResponse,
//   GetShootSummariesParams, 
//   GetShootSummariesResponse, 
//   ShootData, 
//   ShootDetailResponse, 
//   ShootSummary,
// } from "@/typing/interfaces";
// import { pool } from "@/db/dbClient";
// import { ResultSetHeader, RowDataPacket } from "mysql2";
// import { deleteFiles } from "@/s3/s3";
// import { verifyAndRefreshSession } from "@/utils/tokenUtils";

// const BUCKET_PATH = process.env.BUCKET_PATH || "";
// const DIRNAME = process.env.SHOOTS_DIRNAME || "";

// // getShootSummaries
// const getShootSummaries = async ({
//   page = 1,
//   limit = 10,
//   tagID,
// }: GetShootSummariesParams = {}): Promise<GetShootSummariesResponse> => {
//   try {
//     const pageInt = parseInt(page as any, 10) || 1;
//     const limitInt = parseInt(limit as any, 10) || 10;
//     const offset = (pageInt - 1) * limitInt;

//     let query = `
//       SELECT 
//         shoots.id AS shoot_id,
//         shoots.shoot_date,
//         shoots.display_order,
//         GROUP_CONCAT(DISTINCT photographers.name) AS photographers,
//         GROUP_CONCAT(DISTINCT models.name) AS models,
//         GROUP_CONCAT(DISTINCT tags.name) AS tags,
//         SUBSTRING_INDEX(
//           GROUP_CONCAT(DISTINCT photos.photo_url ORDER BY photos.display_order ASC),
//           ",", 1
//         ) AS photo_url
//       FROM shoots
//       LEFT JOIN shoot_photographers 
//         ON shoots.id = shoot_photographers.shoot_id
//       LEFT JOIN photographers 
//         ON shoot_photographers.photographer_id = photographers.id
//       LEFT JOIN shoot_models 
//         ON shoots.id = shoot_models.shoot_id
//       LEFT JOIN models 
//         ON shoot_models.model_id = models.id
//       LEFT JOIN photos 
//         ON shoots.id = photos.shoot_id
//       LEFT JOIN shoot_tags 
//         ON shoots.id = shoot_tags.shoot_id
//       LEFT JOIN tags 
//         ON shoot_tags.tag_id = tags.id
//     `;

//     const params: (string | number)[] = [];

//     if (tagID !== undefined && tagID !== null && tagID !== "") {
//       query += `
//         WHERE EXISTS (
//           SELECT 1 
//           FROM shoot_tags 
//           WHERE shoot_tags.shoot_id = shoots.id
//           AND shoot_tags.tag_id = ?
//         )
//       `;
//       params.push(tagID);
//     }

//     query += `
//       GROUP BY shoots.id, shoots.shoot_date, shoots.display_order
//       ORDER BY shoots.display_order
//       LIMIT ? OFFSET ?
//     `;

//     params.push(limitInt, offset);

//     const [rows] = (await pool.query(query, params)) as [any[], any];

//     const shootSummaries: ShootSummary[] = rows.map((shoot) => ({
//       shootID: shoot.shoot_id,
//       displayOrder: shoot.display_order,
//       shootDate: shoot.shoot_date
//         ? new Date(shoot.shoot_date).toISOString().split("T")[0]
//         : "",
//       tags: shoot.tags ? shoot.tags.split(",") : [],
//       photographers: shoot.photographers ? shoot.photographers.split(",") : [],
//       models: shoot.models ? shoot.models.split(",") : [],
//       thumbnailURL: shoot.photo_url
//         ? `${BUCKET_PATH}${DIRNAME}/${shoot.photo_url}`
//         : "",
//     }));

//     return {
//       shootSummaries,
//       isFinalPage: rows.length < limitInt,
//     };
//   } catch (error) {
//     console.error("Error fetching shoot summaries:", error);
//     throw new Error("Error fetching shoot summaries");
//   }
// };

// // getShootByID
// const getShootByID = async (id: number): Promise<ShootDetailResponse> => {
//   try {
//     const [shoots] = await pool.query<RowDataPacket[]>(
//       "SELECT id AS shoot_id, shoot_date FROM shoots WHERE id = ? LIMIT 1",
//       [id]
//     );

//     if (!shoots.length) {
//       return {
//         success: false,
//         message: "Shoot not found",
//         data: null,
//       };
//     }

//     const shoot = shoots[0];

//     const [
//       [photographers],
//       [models],
//       [tags],
//       [photos],
//     ] = await Promise.all([
//       pool.query<RowDataPacket[]>(
//         `SELECT p.id, p.name 
//          FROM photographers p
//          JOIN shoot_photographers sp ON p.id = sp.photographer_id
//          WHERE sp.shoot_id = ?`,
//         [id]
//       ),
//       pool.query<RowDataPacket[]>(
//         `SELECT m.id, m.name 
//          FROM models m
//          JOIN shoot_models sm ON m.id = sm.model_id
//          WHERE sm.shoot_id = ?`,
//         [id]
//       ),
//       pool.query<RowDataPacket[]>(
//         `SELECT t.id, t.name 
//          FROM tags t
//          JOIN shoot_tags st ON t.id = st.tag_id
//          WHERE st.shoot_id = ?`,
//         [id]
//       ),
//       pool.query<RowDataPacket[]>(
//         `SELECT id, display_order, photo_url 
//          FROM photos 
//          WHERE shoot_id = ? 
//          ORDER BY display_order ASC 
//          LIMIT 10`,
//         [id]
//       ),
//     ]);

//     return {
//       success: true,
//       message: "Shoot details retrieved successfully",
//       data: {
//         shoot_id: shoot.shoot_id,
//         shoot_date: shoot.shoot_date
//           ? new Date(shoot.shoot_date).toISOString().split("T")[0]
//           : null,

//         photographer_ids: photographers.map(p => p.id),
//         photographers: photographers.map(p => p.name),

//         model_ids: models.map(m => m.id),
//         models: models.map(m => m.name),

//         tag_ids: tags.map(t => t.id),
//         tags: tags.map(t => t.name),

//         photo_urls: photos.map((photo) => ({
//           id: photo.id,
//           display_order: photo.display_order,
//           photo_url: photo.photo_url?.startsWith("http")
//             ? photo.photo_url
//             : `${BUCKET_PATH}${DIRNAME}/${photo.photo_url}`,
//         })),
//       },
//     };
//   } catch (error) {
//     console.error("getShootByID error:", error);
//     return {
//       success: false,
//       message: "Failed to retrieve shoot details. Please try again.",
//       data: null,
//     };
//   }
// };

// // addShoot
// const addShoot = async ({
//   shoot_date,
//   tag_ids,
//   photographer_ids,
//   model_ids,
//   photo_urls }: ShootData): Promise<ActionResponse> => {
//   await verifyAndRefreshSession();

//   if (!photo_urls || photo_urls.length === 0) {
//     return {
//       success: false,
//       message: "Photos not added",
//     };
//   }

//   let connection;

//   try {
//     connection = await pool.getConnection();
//     await connection.beginTransaction();

//     // 1. Shift display order so newest shoot takes slot 1
//     await connection.query(
//       "UPDATE shoots SET display_order = display_order + 1"
//     );

//     // 2. Insert shoot record
//     const [ shootResult ] = await connection.query<ResultSetHeader>(
//       "INSERT INTO shoots (shoot_date, display_order) VALUES (?, ?)",
//       [shoot_date, 1]
//     );

//     const shootId = shootResult.insertId;

//     // 3. Link tags
//     for (const tagId of tag_ids) {
//       const [ tagRows ] = await connection.query<RowDataPacket[]>(
//         "SELECT id FROM tags WHERE id = ? LIMIT 1",
//         [tagId]
//       );

//       if (!tagRows.length) {
//         throw new Error(`Tag with ID ${tagId} not found`);
//       }

//       await connection.query(
//         "INSERT INTO shoot_tags (shoot_id, tag_id) VALUES (?, ?)",
//         [shootId, tagId]
//       );
//     }

//     // 4. Link photographers
//     for (const photographerId of photographer_ids) {
//       const [ rows ] = await connection.query<RowDataPacket[]>(
//         "SELECT id FROM photographers WHERE id = ? LIMIT 1",
//         [photographerId]
//       );

//       if (!rows.length) {
//         throw new Error(`Photographer with ID ${photographerId} not found`);
//       }

//       await connection.query(
//         "INSERT INTO shoot_photographers (shoot_id, photographer_id) VALUES (?, ?)",
//         [shootId, photographerId]
//       );
//     }

//     // 5. Link models
//     for (const modelId of model_ids) {
//       const [ rows ] = await connection.query<RowDataPacket[]>(
//         "SELECT id FROM models WHERE id = ? LIMIT 1",
//         [modelId]
//       );

//       if (!rows.length) {
//         throw new Error(`Model with ID ${modelId} not found`);
//       }

//       await connection.query(
//         "INSERT INTO shoot_models (shoot_id, model_id) VALUES (?, ?)",
//         [shootId, modelId]
//       );
//     }

//     // 6. Insert photos
//     for (const [idx, photoUrl] of photo_urls.entries()) {
//       await connection.query(
//         "INSERT INTO photos (shoot_id, display_order, photo_url) VALUES (?, ?, ?)",
//         [shootId, idx + 1, photoUrl]
//       );
//     }

//     await connection.commit();

//     return {
//       success: true,
//       message: "Shoot added successfully",
//     };
//   } catch (error: any) {
//     if (connection) {
//       await connection.rollback();
//     }

//     // Clean up uploaded S3 objects if database transaction fails
//     try {
//       const objKeys = photo_urls.map((url) => `${DIRNAME}/${url}`);
//       await deleteFiles(objKeys);
//     } catch (deleteError) {
//       console.error("Error deleting files from AWS:", deleteError);
//     }

//     console.error("Error adding shoot:", error);

//     return {
//       success: false,
//       message: error?.message || "Internal server error",
//     };
//   } finally {
//     if (connection) {
//       connection.release();
//     }
//   }
// };




// // const editShootByID = () => {
// const editShootByID = async (
//   shootId: number,
//   shootData: ShootData
// ): Promise<ActionResponse> => {
//   const {
//     shoot_date,
//     tag_ids,
//     photographer_ids,
//     model_ids,
//     photo_urls,
//   } = shootData;

//   await verifyAndRefreshSession();

//   if (!photo_urls || photo_urls.length === 0) {
//     return {
//       success: false,
//       message: "Photos not added",
//     };
//   }

//   let connection;
//   let s3KeysToDelete: string[] = [];

//   try {
//     connection = await pool.getConnection();
//     await connection.beginTransaction();

//     // 1. Check shoot existence
//     const [existing] = await connection.query<RowDataPacket[]>(
//       "SELECT id FROM shoots WHERE id = ? LIMIT 1",
//       [shootId]
//     );

//     if (!existing.length) {
//       throw new Error("Shoot not found");
//     }

//     // 2. Query existing photos to calculate S3 cleanup diff
//     const [existingPhotos] = await connection.query<RowDataPacket[]>(
//       "SELECT photo_url FROM photos WHERE shoot_id = ?",
//       [shootId]
//     );

//     s3KeysToDelete = existingPhotos
//       .filter((row) => {
//         return !row.photo_url.includes("http") && !photo_urls.includes(row.photo_url);
//       })
//       .map((row) => `${DIRNAME}/${row.photo_url}`);

//     // 3. Update shoot date
//     await connection.query(
//       "UPDATE shoots SET shoot_date = ? WHERE id = ?",
//       [shoot_date, shootId]
//     );

//     // 4. Clear existing relational bindings
//     await connection.query(
//       "DELETE FROM shoot_photographers WHERE shoot_id = ?",
//       [shootId]
//     );
//     await connection.query(
//       "DELETE FROM shoot_models WHERE shoot_id = ?",
//       [shootId]
//     );
//     await connection.query(
//       "DELETE FROM shoot_tags WHERE shoot_id = ?",
//       [shootId]
//     );
//     await connection.query(
//       "DELETE FROM photos WHERE shoot_id = ?",
//       [shootId]
//     );

//     // 5. Re-link tags
//     for (const tagId of tag_ids) {
//       const [rows] = await connection.query<RowDataPacket[]>(
//         "SELECT id FROM tags WHERE id = ? LIMIT 1",
//         [tagId]
//       );

//       if (!rows.length) {
//         throw new Error(`Tag with ID ${tagId} not found`);
//       }

//       await connection.query(
//         "INSERT INTO shoot_tags (shoot_id, tag_id) VALUES (?, ?)",
//         [shootId, tagId]
//       );
//     }

//     // 6. Re-link photographers
//     for (const photographerId of photographer_ids) {
//       const [rows] = await connection.query<RowDataPacket[]>(
//         "SELECT id FROM photographers WHERE id = ? LIMIT 1",
//         [photographerId]
//       );

//       if (!rows.length) {
//         throw new Error(`Photographer with ID ${photographerId} not found`);
//       }

//       await connection.query(
//         "INSERT INTO shoot_photographers (shoot_id, photographer_id) VALUES (?, ?)",
//         [shootId, photographerId]
//       );
//     }

//     // 7. Re-link models
//     for (const modelId of model_ids) {
//       const [rows] = await connection.query<RowDataPacket[]>(
//         "SELECT id FROM models WHERE id = ? LIMIT 1",
//         [modelId]
//       );

//       if (!rows.length) {
//         throw new Error(`Model with ID ${modelId} not found`);
//       }

//       await connection.query(
//         "INSERT INTO shoot_models (shoot_id, model_id) VALUES (?, ?)",
//         [shootId, modelId]
//       );
//     }

//     // 8. Re-insert photos
//     for (const [idx, photoUrl] of photo_urls.entries()) {
//       await connection.query(
//         "INSERT INTO photos (shoot_id, display_order, photo_url) VALUES (?, ?, ?)",
//         [shootId, idx + 1, photoUrl]
//       );
//     }

//     await connection.commit();

//     // 9. Clean up deleted S3 files after successful commit
//     if (s3KeysToDelete.length > 0) {
//       try {
//         await deleteFiles(s3KeysToDelete);
//       } catch (s3Error) {
//         console.error("Error deleting removed files from S3:", s3Error);
//       }
//     }

//     return {
//       success: true,
//       message: "Shoot updated successfully",
//     };
//   } catch (error: any) {
//     if (connection) {
//       await connection.rollback();
//     }

//     console.error("Error editing shoot:", error);

//     return {
//       success: false,
//       message: error?.message || "Internal server error",
//     };
//   } finally {
//     if (connection) {
//       connection.release();
//     }
//   }
// };




// const deleteShootByID = async (id: number): Promise<ActionResponse> => {
//   await verifyAndRefreshSession();

//   let connection;
//   let photoObjKeys: { photo_url: string }[] = [];

//   try {
//     connection = await pool.getConnection();
//     await connection.beginTransaction();

//     const [photoRows] = await connection.query<RowDataPacket[]>(
//       "SELECT photo_url FROM photos WHERE shoot_id = ?",
//       [id]
//     );

//     photoObjKeys = photoRows as { photo_url: string }[];

//     await connection.query(
//       "DELETE FROM photos WHERE shoot_id = ?",
//       [id]
//     );

//     await connection.query(
//       "DELETE FROM shoot_models WHERE shoot_id = ?",
//       [id]
//     );

//     await connection.query(
//       "DELETE FROM shoot_photographers WHERE shoot_id = ?",
//       [id]
//     );

//     await connection.query(
//       "DELETE FROM shoot_tags WHERE shoot_id = ?",
//       [id]
//     );

//     const [result] = await connection.query<ResultSetHeader>(
//       "DELETE FROM shoots WHERE id = ?",
//       [id]
//     );

//     if (result.affectedRows === 0) {
//       throw new Error(`Shoot number ${id} not deleted`);
//     }

//     await connection.commit();
//   } catch (error) {
//     if (connection) {
//       await connection.rollback();
//     }
//     console.error("Error deleting shoot from DB:", error);
//     return {
//       success: false,
//       message: "Failed to delete shoot",
//     };
//   } finally {
//     if (connection) {
//       connection.release();
//     }
//   }

//   try {
//     const objKeys = photoObjKeys.map((obj) => `${DIRNAME}/${obj.photo_url}`);

//     if (objKeys.length > 0) {
//       const deleteResponse = await deleteFiles(objKeys);

//       if (!deleteResponse) {
//         throw new Error("Error deleting files from AWS");
//       }
//     }

//     return {
//       success: true,
//       message: `Shoot number ${id} deleted successfully`,
//     };
//   } catch (error) {
//     console.error("Error deleting file from AWS:", error);
//     return {
//       success: false,
//       message: "Shoot deleted from database, but failed to delete files from AWS",
//     };
//   }
// };

// const updateShootOrder = () => {
//   console.log("Updating shoot order");
// };

// export {
//   getShootSummaries,
//   getShootByID,
//   addShoot,
//   editShootByID,
//   deleteShootByID,
//   updateShootOrder,
// };

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
import { pool } from "@/db/dbClient_pg";
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