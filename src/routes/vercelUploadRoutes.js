import express from 'express';
import { uploadImage } from '../controllers/vercelUploadController.js';
import { memoryUpload } from '../utils/memoryUpload.js';

const router = express.Router();

router.post('/blob', memoryUpload.single('image'), uploadImage);

export default router;
