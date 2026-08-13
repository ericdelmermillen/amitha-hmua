"use server";

import { pool } from "@/db/dbClient";
import { GetShootSummariesParams, GetShootSummariesResponse, ShootSummary } from "@/typing/interfaces";

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


const getShootByID = () => {
  console.log("Getting your shoot...")
};

const addShoot = () => {
  console.log("Adding your shoot")
};

const deleteShootByID = () => {
  console.log("Deleting your shoot")
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