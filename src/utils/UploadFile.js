import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY,       // Cloudinary API key
  api_secret: process.env.CLOUDINARY_API_SECRET, // Cloudinary API secret
});

// Multer storage setup to use memory storage (since we're uploading to Cloudinary)
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(file.originalname.toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

// Initialize multer with memory storage, file filter, and size limit
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// Middleware for uploading to Cloudinary
const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      // No file uploaded
      return next(); // Proceed without setting a file URL
    }

    // Upload the file buffer directly to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto", // Auto-detect file type
          folder: "uploads",     // Optional: Specify a folder in Cloudinary
        },
        (error, result) => {
          if (error) {
            console.error("Error uploading to Cloudinary:", error);
            return reject(error);
          }
          resolve(result); // Return the Cloudinary response
        }
      );

      // Pipe the file buffer to the upload stream
      uploadStream.end(req.file.buffer);
    });

    // Attach details to the request object
    //req.fileUrl = uploadResult.secure_url; // Full URL of the uploaded file
    req.file.filename = uploadResult.secure_url; // Public ID (unique name of the image in Cloudinary)

    next(); // Proceed to the next middleware
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    return res.status(500).json({ error: "Failed to upload to Cloudinary" });
  }
};

// Function to upload multiple files to Cloudinary
const uploadMultipleToCloudinary = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return next();

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "uploads" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    req.fileUrls = await Promise.all(uploadPromises);
    next();
  } catch (error) {
    console.error("Error uploading files to Cloudinary:", error);
    return res.status(500).json({ error: "Failed to upload multiple files to Cloudinary" });
  }
};

// Export multer upload and Cloudinary upload middleware
export { upload, uploadToCloudinary, uploadMultipleToCloudinary };
