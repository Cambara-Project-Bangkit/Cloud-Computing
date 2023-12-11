const multer = require('multer');
const fs = require('fs');
const request = require('request');
const { storage, bucket } = require('../config/gcs');
const { validateMIMEType } = require('validate-image-type');
const path = require('path');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // no larger than 5mb

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const imageName = file.originalname.replace(/ /g, '_');
    cb(null, imageName);
  },
});

const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});


/**
 * @swagger
 * /upload 
 *    post:
 *      summary: Upload an aksara handwriting image and get prediction accuracy
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                image:
 *                  type: string
 *                  format: binary
 *                aksara:
 *                  type: string
 *        responses:
 *            '200':
 *               description: Successful operation
 *            '400':
 *               description: Bad Request
 *            '500':
 *               description: Some server error
 */
const uploadImage = async (req, res) => {
  try {
    // Check if no file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: true, message: 'No file uploaded.' });
    }

    const { aksara } = req.body;

    const imagePath = `./uploads/${path.parse(req.file.filename).base}`;
    const tempLocalPath = `./uploads/${req.file.filename}`;

    // Validate the uploaded image type
    const checkImageType = await validateMIMEType(tempLocalPath, {
      originalFilename: req.file.originalname,
      allowMimeTypes: ['image/jpeg', 'image/png'],
    });
    
    // If the image type is not supported, return an error
    if (!checkImageType.ok) {
      return res.status(400).json({ message: 'Image type is not supported. Please only upload .jpeg/.png images.' });
    }

    await bucket.upload(imagePath, { destination: req.file.filename });
       
    try {
      const formData = {
        image: {
          value: fs.createReadStream(tempLocalPath),
          options: {
            filename: req.file.filename,
            contentType: req.file.mimetype,
          },
        },
        data: aksara,
      };

      // send request post to flask api
      request.post({
        url: 'https://cloud-computing-flask-v4v5u72orq-et.a.run.app/prediction',
        formData: formData,
      }, (error, response, body) => {
        // Delete the temporary local image
        fs.unlinkSync(tempLocalPath);

        if (error) {
          return res.status(error.statusCode || 500).json({ error: error.message || 'Internal Server Error.' });
        } else if (response.statusCode === 200) {
          const parsed = JSON.parse(body);
          return res.status(200).json({
            error: false,
            message: parsed.message,
            data: parsed.data,
          });
        } else if (response.statusCode === 400) {
          const parsed = JSON.parse(body);
          return res.status(400).json({
            error: true,
            message: parsed.message,
          });
        }
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({ error: error.message || 'Internal Server Error.' });
    }
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || 'Internal Server Error.' });
  }
};

module.exports = { uploadImage, upload };