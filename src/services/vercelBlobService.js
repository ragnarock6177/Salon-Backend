import { put, del } from '@vercel/blob';

/**
 * Deletes an image file from Vercel Blob storage.
 * @param {string} url - The URL of the file to delete.
 * @returns {Promise<void>}
 */
export const deleteImageFromBlob = async (url) => {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error("BLOB_READ_WRITE_TOKEN is not defined in environment variables.");
    }

    await del(url);
};

/**
 * Uploads an image file to Vercel Blob storage.
 * @param {Buffer} fileBuffer - The buffer of the file to upload.
 * @param {string} fileName - The name of the file.
 * @param {string} pathPrefix - Optional prefix for the file path (e.g., 'salons/my-salon/').
 * @returns {Promise<string>} - The URL of the uploaded blob.
 */
export const uploadImageToBlob = async (fileBuffer, fileName, pathPrefix = '') => {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error("BLOB_READ_WRITE_TOKEN is not defined in environment variables.");
    }

    const finalPath = pathPrefix ? `${pathPrefix}/${fileName}` : fileName;

    const blob = await put(finalPath, fileBuffer, {
        access: 'public',
    });

    return blob.url;
};
