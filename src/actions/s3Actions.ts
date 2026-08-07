"use server";

import { deleteFiles, generateUploadURL } from "@/s3/s3";

 const getSignedURL = async (dirName: string) => {
  try {
    const url = await generateUploadURL(dirName);
    return { success: true, url };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to generate upload URL" 
    };
  };
};

const deleteS3Files = async (fileKeys: string[]) => {
  try {
    await deleteFiles(fileKeys);
    return { success: true };
  } catch (error) {
    console.error("Error deleting S3 files:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete files" 
    };
  };
};

export { 
  getSignedURL,
  deleteS3Files
};