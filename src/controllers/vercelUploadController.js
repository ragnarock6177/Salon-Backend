import { uploadImageToBlob } from '../services/vercelBlobService.js';
import SalonsService from '../services/salonsService.js';

// Generic simple upload (kept for backward compatibility or simple use)
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

export const uploadSingleImage = async (req, res) => {
    try {
        const { salon_id, salonName } = req.body;

        if (!salon_id) {
            return res.status(400).json({ error: "Salon ID is required" });
        }
        if (!salonName) {
            return res.status(400).json({ error: "Salon Name is required" });
        }
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const sanitizedSalonName = salonName.replace(/[^a-zA-Z0-9_-]/g, "_");
        const pathPrefix = `salons/${sanitizedSalonName}`;

        // Add unique timestamp to filename to prevent collisions since Vercel Blob overwrites by default on same path
        const uniqueFileName = `${Date.now()}-${req.file.originalname}`;

        const blobUrl = await uploadImageToBlob(req.file.buffer, uniqueFileName, pathPrefix);

        await SalonsService.saveImage(salon_id, blobUrl);

        res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            file: blobUrl
        });

    } catch (error) {
        console.error('Error uploading single image:', error);
        res.status(500).json({ success: false, message: 'Failed to upload image' });
    }
};

export const uploadMultipleImages = async (req, res) => {
    try {
        const { salon_id, salonName } = req.body;

        if (!salon_id) {
            return res.status(400).json({ error: "Salon ID is required" });
        }
        if (!salonName) {
            return res.status(400).json({ error: "Salon Name is required" });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }

        const sanitizedSalonName = salonName.replace(/[^a-zA-Z0-9_-]/g, "_");
        const pathPrefix = `salons/${sanitizedSalonName}`;

        const uploadPromises = req.files.map(async (file) => {
            const uniqueFileName = `${Date.now()}-${file.originalname}`;
            const blobUrl = await uploadImageToBlob(file.buffer, uniqueFileName, pathPrefix);

            // Save each image to DB
            await SalonsService.saveImage(salon_id, blobUrl);

            return blobUrl;
        });

        const fileUrls = await Promise.all(uploadPromises);

        res.status(200).json({
            success: true,
            message: "Images uploaded successfully",
            files: fileUrls
        });

    } catch (error) {
        console.error('Error uploading multiple images:', error);
        res.status(500).json({ success: false, message: 'Failed to upload images' });
    }
};
