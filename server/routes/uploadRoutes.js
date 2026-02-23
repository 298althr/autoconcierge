const express = require('express');
const router = express.Router();
const { upload } = require('../services/uploadService');
const { authenticate: authMiddleware } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/upload/vehicle
 * @desc    Upload an image for a vehicle listing
 * @access  Private (Admin or Authenticated User)
 */
router.post('/vehicle', authMiddleware, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        // Handle URL formatting for local vs cloudinary
        let fileUrl = req.file.path;
        if (req.file.filename.startsWith('local-')) {
            fileUrl = `${process.env.BASE_URL || ''}/uploads/${req.file.filename}`;
        }

        res.json({
            success: true,
            url: fileUrl,
            public_id: req.file.filename
        });
    } catch (err) {
        console.error('[Upload Error]:', err.message);
        res.status(500).json({ success: false, error: 'Failed to upload image' });
    }
});

/**
 * @route   POST /api/upload/bulk
 * @desc    Upload multiple images
 * @access  Private
 */
router.post('/bulk', authMiddleware, upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files uploaded' });
        }

        const urls = req.files.map(file => {
            if (file.filename.startsWith('local-')) {
                return `${process.env.BASE_URL || ''}/uploads/${file.filename}`;
            }
            return file.path;
        });

        res.json({
            success: true,
            urls: urls
        });
    } catch (err) {
        console.error('[Bulk Upload Error]:', err.message);
        res.status(500).json({ success: false, error: 'Failed to upload images' });
    }
});

module.exports = router;
