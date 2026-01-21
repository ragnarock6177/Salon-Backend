import express from 'express';
import { uploadSingleImage, uploadMultipleImages, deleteImage } from '../controllers/vercelUploadController.js';
import { memoryUpload } from '../utils/memoryUpload.js';

const router = express.Router();

router.post('/single', memoryUpload.single('image'), uploadSingleImage);
router.post('/multiple', memoryUpload.array('images', 10), uploadMultipleImages);
router.post('/delete', deleteImage); // Using POST since some clients/proxies strip body from DELETE

export default router;
