import express from "express";
import UploadController from "../controllers/upload.controller.js";

const router = express.Router();

router.post("/single", UploadController.uploadSingleImage);
router.post("/multiple", UploadController.uploadMultipleImages);

export default router;
