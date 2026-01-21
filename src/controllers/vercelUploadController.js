import { uploadImageToBlob } from '../services/vercelBlobService.js';

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const blobUrl = await uploadImageToBlob(req.file.buffer, req.file.originalname);

        res.status(200).json({ url: blobUrl });
    } catch (error) {
        console.error('Error uploading to Vercel Blob:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
};
