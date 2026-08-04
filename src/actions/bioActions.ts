"use server";

import { BioResponse } from "@/typing/interfaces";
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
	}
};


const updateBio = async ({
	bio_name,
	bio_img_url,
	bio_text,
	updated_Photo
}: {
	bio_name: string;
	bio_img_url: string;
	bio_text: string;
	updated_Photo: boolean;
}) => {

	let connection;

	try {
		connection = await pool.getConnection();

		await connection.beginTransaction();

		// 1. Check existing row
		const [existingRows] = await connection.query(
			`SELECT * FROM bio LIMIT 1`
		);

		const existingBioData = (existingRows as any[])[0];

		// 2. Insert if none exists
		if (!existingBioData) {

			await connection.query(
				`INSERT INTO bio 
				(bio_name, bio_text, bio_img_url)
				VALUES (?, ?, ?)`,
				[
					bio_name,
					bio_text,
					bio_img_url
				]
			);

			await connection.commit();

			return {
				success: true,
				message: "Bio inserted successfully",
				data: {
					bioName: bio_name,
					bioText: bio_text,
					bioImgURL:
						`${BUCKET_PATH}${BIO_DIRNAME}/${bio_img_url}`
				}
			};
		}

		const previousBioImgURL = existingBioData.bio_img_url;

		// 3. Update existing row
		await connection.query(
			`UPDATE bio
			 SET bio_name = ?, 
			     bio_text = ?, 
			     bio_img_url = ?
			 WHERE id = ?`,
			[
				bio_name,
				bio_text,
				bio_img_url,
				existingBioData.id
			]
		);

		await connection.commit();

		// 4. Delete old AWS image after DB succeeds
		if (updated_Photo && previousBioImgURL) {

			try {
				await deleteFiles([
					`${BIO_DIRNAME}/${previousBioImgURL}`
				]);

			} catch(deleteError) {

				console.error(
					"Error deleting old AWS file:",
					deleteError
				);

			}
		}

		// Fetch updated record
		const [updatedRows] = await pool.query(
			`SELECT * FROM bio LIMIT 1`
		);

		const updatedBioData = (updatedRows as any[])[0];

		return {
			success: true,
			message: "Bio updated successfully",
			data: {
				bioName: updatedBioData.bio_name,
				bioText: updatedBioData.bio_text,
				bioImgURL:
					`${BUCKET_PATH}${BIO_DIRNAME}/${updatedBioData.bio_img_url}`
			}
		};

	} catch(error) {
		if(connection) {
			await connection.rollback();
		}

		console.error(
			"Error updating Bio page:",
			error
		);

		// Remove uploaded image if DB failed
		try {
			if(bio_img_url) {

				await deleteFiles([
					`${BIO_DIRNAME}/${bio_img_url}`
				]);

			}

		} catch(deleteError) {

			console.error(
				"Error deleting failed upload:",
				deleteError
			);
		}

		return {
			success: false,
			message: "Error updating Bio page"
		};

	} finally {

		if(connection) {
			connection.release();
		}

	}
};

export {
  getBio,
  updateBio
}