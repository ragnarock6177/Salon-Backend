import UploadService from "../services/uploadService.js";
import SalonsService from "../services/salonsService.js";

class UploadController {
    static uploadSingleImage(req, res) {
        UploadService.uploadSingle(req, res, async function (err) {
            const { salon_id } = req.body;

            if (!salon_id) {
                return res.status(400).json({ error: "Salon ID is required" });
            }
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }
            if (err) {
                return res.status(400).json({ success: false, message: err.message });
            }
            const salonName = req.body.salonName.replace(/[^a-zA-Z0-9_-]/g, "_");

            await SalonsService.saveImage(salon_id, `/uploads/${salonName}/${req.file.filename}`);
            return res.status(200).json({
                success: true,
                message: "Image uploaded successfully",
                file: `/uploads/${salonName}/${req.file.filename}`
            });
        });
    }

    static uploadMultipleImages(req, res) {
        UploadService.uploadMultiple(req, res, function (err) {
            if (err) {
                return res.status(400).json({ success: false, message: err.message });
            }

            const salonName = req.body.salonName.replace(/[^a-zA-Z0-9_-]/g, "_");
            const filePaths = req.files.map(file => `/uploads/${salonName}/${file.filename}`);
            filePaths.forEach(async (url) => {
                await SalonsService.saveImage(salon_id, url);
            });
            return res.status(200).json({
                success: true,
                message: "Images uploaded successfully",
                files: filePaths
            });
        });
    }
}

export default UploadController;
