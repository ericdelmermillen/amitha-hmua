import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";

const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
const BUCKET_NAME = process.env.BUCKET_NAME;
const REGION = process.env.REGION;
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

const generateUploadURL = async (
  dirname: string,
  contentType: string = "image/jpeg"
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${dirname}/${uuid()}.jpeg`,
    ContentType: contentType,
  });

  const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 60 });

  return uploadURL;
};

// const deleteFiles = async (fileNames: string[]): Promise<void> => {
//   if (fileNames.length === 0) {
//     return;
//   }

//   try {
//     const command = new DeleteObjectsCommand({
//       Bucket: BUCKET_NAME,
//       Delete: {
//         Objects: fileNames.map((fileName) => {
//           return { Key: fileName };
//         }),
//         Quiet: true,
//       },
//     });

//     await s3Client.send(command);
//   } catch (error) {
//     console.error("Error deleting files:", error);
//     throw error;
//   }
// };


const deleteFiles = async (fileNames: string[]): Promise<boolean> => {
  if (fileNames.length === 0) {
    return true;
  }

  try {
    const command = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: fileNames.map((fileName) => {
          return { Key: fileName };
        }),
        Quiet: true,
      },
    });

    const response = await s3Client.send(command);

    if (response.Errors && response.Errors.length > 0) {
      console.error("S3 DeleteObjects partial errors:", response.Errors);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting files:", error);
    return false;
  }
};

export {
  generateUploadURL,
  deleteFiles,
};