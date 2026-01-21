import { put } from '@vercel/blob';

/**
 * Uploads an image file to Vercel Blob storage.
 * @param {Buffer} fileBuffer - The buffer of the file to upload.
 * @param {string} fileName - The name of the file.
 * @returns {Promise<string>} - The URL of the uploaded blob.
 */
export const uploadImageToBlob = async (fileBuffer, fileName) => {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error("BLOB_READ_WRITE_TOKEN is not defined in environment variables.");
    }

    const blob = await put(fileName, fileBuffer, {
        access: 'public',
    });

    return blob.url;
};
