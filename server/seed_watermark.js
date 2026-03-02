const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config(); // Running from server root, so .env is right here

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const logoFile = path.resolve(__dirname, '../logo/AutoGaard/autogaard-png.png');

console.log('--- Cloudinary Seeding Script ---');
console.log('Resolving Logo Path:', logoFile);

cloudinary.uploader.upload(logoFile, {
    public_id: 'autogaard_watermark',
    folder: 'Autogaard/logo',
    overwrite: true,
    invalidate: true
})
    .then(result => {
        console.log('✅ Watermark Seeded Successfully!');
        console.log('Public ID:', result.public_id);
        console.log('URL:', result.secure_url);
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Seeding Failed!');
        console.error('Error Message:', err.message);
        process.exit(1);
    });
