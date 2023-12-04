const express = require('express');
const router = express.Router();
const { uploadImage, upload } = require('../controllers/uploadController');
const { check, validationResult } = require('express-validator');

// Middleware to validate inputs
const validateInputs = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
};

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload image to Google Cloud Storage
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Error occurred
 */
router.post('/', [
    check('image').notEmpty(),
    validateInputs
], upload.single('image'), uploadImage);    

module.exports = router;