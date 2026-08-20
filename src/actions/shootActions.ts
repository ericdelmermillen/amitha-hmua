"use server";

import { 
  ActionResponse,
  GetShootSummariesParams, 
  GetShootSummariesResponse, 
  ShootDetailResponse, 
  ShootSummary,
} from "@/typing/interfaces";
import { pool } from "@/db/dbClient";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { deleteFiles } from "@/s3/s3"
import { verifyAndRefreshSession } from "@/utils/tokenUtils";

const BUCKET_PATH = process.env.BUCKET_PATH || '';
const SHOOTS_DIRNAME = process.env.SHOOTS_DIRNAME || '';


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
        GROUP_CONCAT(DISTINCT photographers.photographer_name) AS photographers,
        GROUP_CONCAT(DISTINCT models.model_name) AS models,
        GROUP_CONCAT(DISTINCT tags.tag_name) AS tags,
        SUBSTRING_INDEX(
          GROUP_CONCAT(DISTINCT photos.photo_url ORDER BY photos.display_order ASC),
          ',', 1
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
        ? `${BUCKET_PATH}${SHOOTS_DIRNAME}/${shoot.photo_url}`
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


const getShootByID = async (id: number): Promise<ShootDetailResponse | null> => {
  try {
    const [shoots] = await pool.query<RowDataPacket[]>(
      `SELECT id AS shoot_id, shoot_date FROM shoots WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!shoots.length) {
      return null;
    }

    const shoot = shoots[0];

    const [
      [photographers],
      [models],
      [tags],
      [photos]
    ] = await Promise.all([
      pool.query<RowDataPacket[]>(
        `SELECT p.id, p.photographer_name 
         FROM photographers p
         JOIN shoot_photographers sp ON p.id = sp.photographer_id
         WHERE sp.shoot_id = ?`,
        [id]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT m.id, m.model_name 
         FROM models m
         JOIN shoot_models sm ON m.id = sm.model_id
         WHERE sm.shoot_id = ?`,
        [id]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT t.id, t.tag_name 
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
      shoot_id: shoot.shoot_id,
      shoot_date: shoot.shoot_date
        ? new Date(shoot.shoot_date).toISOString().split("T")[0]
        : null,

      photographer_ids: photographers.map((p) => p.id),
      photographers: photographers.map((p) => p.photographer_name),

      model_ids: models.map((m) => m.id),
      models: models.map((m) => m.model_name),

      tag_ids: tags.map((t) => t.id),
      tags: tags.map((t) => t.tag_name),

      photo_urls: photos.map((photo) => ({
        id: photo.id,
        display_order: photo.display_order,
        photo_url: photo.photo_url?.startsWith("http")
          ? photo.photo_url
          : `${BUCKET_PATH}${SHOOTS_DIRNAME}/${photo.photo_url}`,
      })),
    };
  } catch (error) {
    console.error("getShootByID error:", error);
    throw new Error("Failed to fetch shoot details");
  }
};


const addShoot = () => {
  console.log("Adding your shoot")
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
    const objKeys = photoObjKeys.map((obj) => `${SHOOTS_DIRNAME}/${obj.photo_url}`);

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



const editShootByID = () => {
  console.log("Editing your shoot")
};

const updateShootOrder = () => {
  console.log("Updating your shoot")
};


export {
  getShootSummaries,
  getShootByID,
  addShoot,
  deleteShootByID,
  editShootByID,
  updateShootOrder
};