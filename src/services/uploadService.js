import multer from "multer";
import path from "path";
import fs from "fs";

// Base upload directory
const baseUploadDir = "uploads/";

// Create directory if not exists
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Expect salon name in request (either in body or query)
    let salonName = req.body.salonName || req.query.salonName;

    if (!salonName) {
      return cb(new Error("Salon name is required for image upload"), null);
    }

    // Sanitize folder name (replace spaces and special chars)
    salonName = salonName.replace(/[^a-zA-Z0-9_-]/g, "_");

    const uploadPath = path.join(baseUploadDir, salonName);

    ensureDirExists(uploadPath);

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const uploadSingle = multer({ storage, fileFilter }).single("image");
const uploadMultiple = multer({ storage, fileFilter }).array("images", 5);

export default {
  uploadSingle,
  uploadMultiple
};
