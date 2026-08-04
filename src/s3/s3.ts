import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";

const BUCKET_NAME = process.env.BUCKET_NAME;
const REGION = process.env.REGION;
const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;

if (!BUCKET_NAME || !REGION || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
	throw new Error("Missing required AWS environment variables.");
}

const s3Client = new S3Client({
	credentials: {
		accessKeyId: ACCESS_KEY_ID,
		secretAccessKey: SECRET_ACCESS_KEY,
	},
	region: REGION,
});

const generateUploadURL = async (dirname: string) => {
	const command = new PutObjectCommand({
		Bucket: BUCKET_NAME,
		Key: `${dirname}/${uuid()}.jpeg`,
	});

	const uploadURL = await getSignedUrl(
		s3Client,
		command,
		{ expiresIn: 60 }
	);

	return uploadURL;
};

const deleteFiles = async (fileNames: string[]) => {
	try {
		const deletePromises = fileNames.map((fileName) => {
			const command = new DeleteObjectCommand({
				Bucket: BUCKET_NAME,
				Key: fileName,
			});

			return s3Client.send(command);
		});

		return await Promise.all(deletePromises);

	} catch (error) {
		console.error("Error deleting files:", error);
		throw error;
	}
};

export {
	generateUploadURL,
	deleteFiles
};