const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const env = require('../config/env');

const fs = require('fs');
const path = require('path');

// Storage configuration
let storage;

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
        secure: true
    });

    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'Autogaard/vehicles',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            // Applied to ALL uploads for forensic branding and security
            transformation: [
                { quality: 'auto', fetch_format: 'auto' }, // Standard Optimization
                // Primary Watermark: bottom center, 50% opacity, Scaled to 30% of width
                {
                    overlay: 'Autogaard:logo:autogaard_watermark',
                    gravity: 'south',
                    y: 20,
                    opacity: 50,
                    width: 0.3,
                    crop: 'scale'
                }
            ]
        }
    });
} else {
    console.warn('[Upload Service] CLOUDINARY_URL not found. Using local disk fallback (uploads/ directory).');

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'local-' + uniqueSuffix + path.extname(file.originalname));
        }
    });
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Increased to 10MB to handle high-res photos
});

module.exports = {
    cloudinary,
    upload
};
