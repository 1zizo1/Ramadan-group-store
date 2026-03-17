import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// DEBUG: Check if variables are actually loading (Remove this after testing!)
console.log("Cloud Name Check:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ LOADED" : "❌ MISSING");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Recommended for HTTPS links
});

export default cloudinary;