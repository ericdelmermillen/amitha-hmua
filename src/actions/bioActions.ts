"use server";

import { revalidatePath } from "next/cache";
import { type PoolClient } from "pg";
import { 
  type BioResponse, 
  type BioRow, 
  type ActionResponse, 
  type UpdatedBioData 
} from "@/typing/interfaces";
import { pool } from "@/db/dbClient";
import { deleteFiles } from "@/s3/s3";
import { verifyAndRefreshSession } from "@/utils/tokenUtils";

const BUCKET_PATH = process.env.BUCKET_PATH;
const BIO_DIRNAME = process.env.BIO_DIRNAME;

if (!BUCKET_PATH || !BIO_DIRNAME) {
	throw new Error("Missing required AWS environment variables.");
}

// getBio
const getBio = async (): Promise<BioResponse> => {
  try {
    const result = await pool.query<BioRow>(
      "SELECT id, name, text, img_url FROM bio LIMIT 1"
    );

    const data = result.rows[0];

    if (!data) {
      return {
        success: false,
        message: "Bio data not found or not set",
      };
    }

    const bioImgURL = data.img_url ? `${BUCKET_PATH}${BIO_DIRNAME}/${data.img_url}` : "";

    return {
      success: true,
      data: {
        bioName: data.name,
        bioText: data.text,
        bioImgURL,
        bioImageNotSet: bioImgURL.length === 0,
      },
    };
  } catch (error) {
    console.error("Error fetching bio data:", error);

    return {
      success: false,
      message: "An error occurred while fetching the Bio Page data",
    };
  }
};

// updateBio
const updateBio = async ({
  bio_name,
  bio_img_url,
  bio_text,
  updated_Photo,
}: UpdatedBioData): Promise<ActionResponse> => {
  await verifyAndRefreshSession();

  let client: PoolClient | undefined;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const existingResult = await client.query<BioRow>(
      "SELECT id, name, text, img_url FROM bio LIMIT 1"
    );

    const existingData = existingResult.rows[0];

    if (!existingData) {
      await client.query(
        `
        INSERT INTO bio (name, text, img_url)
        VALUES ($1, $2, $3)
        `,
        [bio_name, bio_text, bio_img_url]
      );

      await client.query("COMMIT");
      revalidatePath("/bio");

      return {
        success: true,
        message: "Bio inserted successfully",
      };
    }

    const previousBioImg = existingData.img_url;

    await client.query(
      `
      UPDATE bio
      SET
        name = $1,
        text = $2,
        img_url = $3
      WHERE id = $4
      `,
      [bio_name, bio_text, bio_img_url, existingData.id]
    );

    await client.query("COMMIT");
    revalidatePath("/bio");

    // Clean up old photo after successful DB update
    if (updated_Photo && previousBioImg && previousBioImg !== bio_img_url) {
      try {
        await deleteFiles([`${BIO_DIRNAME}/${previousBioImg}`]);
      } catch (error) {
        console.error("Failed deleting old bio image:", error);
      }
    }

    return {
      success: true,
      message: "Bio updated successfully",
    };
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }

    console.error("Error updating Bio:", error);

    // Remove newly uploaded image if DB write failed
    if (updated_Photo && bio_img_url) {
      try {
        await deleteFiles([`${BIO_DIRNAME}/${bio_img_url}`]);
      } catch (deleteError) {
        console.error("Failed removing orphaned upload:", deleteError);
      }
    }

    return {
      success: false,
      message: "Error updating Bio page",
    };
  } finally {
    if (client) {
      client.release();
    }
  }
};

export { 
  getBio,
  updateBio
 };