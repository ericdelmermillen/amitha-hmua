"use server";

import { BioResponse, UpdatedBioData } from "@/typing/interfaces";
import { revalidatePath } from 'next/cache';
import { pool } from "@/db/dbClient";
import { deleteFiles } from "@/s3/s3";

const BUCKET_PATH = process.env.BUCKET_PATH;
const BIO_DIRNAME = process.env.BIO_DIRNAME;

if (!BUCKET_PATH || !BIO_DIRNAME) {
	throw new Error("Missing required AWS environment variables.");
}

const getBio = async (): Promise<BioResponse> => {
	try {
		const [rows] = await pool.query(
			`SELECT * FROM bio LIMIT 1`
		);

		const bioData = (rows as any[])[0];

		if (!bioData) {
			return {
				success: false,
				message: "Bio data not found or not set"
			};
		}

		const bioImgURL = bioData.bio_img_url
			? `${BUCKET_PATH}${BIO_DIRNAME}/${bioData.bio_img_url}`
			: "";

		return {
			success: true,
			data: {
				bioName: bioData.bio_name,
				bioText: bioData.bio_text,
				bioImgURL,
				bioImageNotSet: !bioImgURL.length
			}
		};

	} catch (error) {
		console.error("Error fetching bio data:", error);

		return {
			success: false,
			message: "An error occurred while fetching the Bio Page data"
		};
	};
};

const updateBio = async ({
  bio_name,
  bio_img_url,
  bio_text,
  updated_Photo
}: UpdatedBioData) => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      `SELECT * FROM bio LIMIT 1`
    );

    const existingBioData = (existingRows as any[])[0];

    if (!existingBioData) {
      await connection.query(
        `
        INSERT INTO bio
        (
          bio_name,
          bio_text,
          bio_img_url
        )
        VALUES (?, ?, ?)
        `,
        [bio_name, bio_text, bio_img_url]
      );

      await connection.commit();
      revalidatePath('/bio');

      return {
        success: true,
        message: "Bio inserted successfully"
      };
    }

    const previousBioImg = existingBioData.bio_img_url;

    await connection.query(
      `
      UPDATE bio
      SET
        bio_name = ?,
        bio_text = ?,
        bio_img_url = ?
      WHERE id = ?
      `,
      [bio_name, bio_text, bio_img_url, existingBioData.id]
    );

    await connection.commit();
    revalidatePath('/bio');

    // Clean up old photo after successful DB update
    if (
      updated_Photo &&
      previousBioImg &&
      previousBioImg !== bio_img_url
    ) {
      try {
        await deleteFiles([`${BIO_DIRNAME}/${previousBioImg}`]);
      } catch (error) {
        console.error("Failed deleting old bio image:", error);
      };
    }

    return {
      success: true,
      message: "Bio updated successfully"
    };

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Error updating Bio:", error);

    // Remove newly uploaded image if DB write failed
    if (updated_Photo && bio_img_url) {
      try {
        await deleteFiles([`${BIO_DIRNAME}/${bio_img_url}`]);
      } catch (deleteError) {
        console.error("Failed removing orphaned upload:", deleteError);
      };
    }

    return {
      success: false,
      message: "Error updating Bio page"
    };

  } finally {
    if (connection) {
      connection.release();
    }
  };
};


export {
  getBio,
  updateBio
}