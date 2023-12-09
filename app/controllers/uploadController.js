require('dotenv').config();
const multer = require('multer');
const fs = require('fs');
const request = require('request');
const { storage, bucket } = require('../config/gcs');
const { validateBufferMIMEType } = require('validate-image-type');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // no larger than 5mb

const upload = multer({
  storage: multer.memoryStorage(),
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

    // Validate the uploaded image type
    const checkImageType = await validateBufferMIMEType(req.file.buffer, {
      allowMimeTypes: ['image/png', 'image/jpeg'],
    });

    // If the image type is not supported, return an error
    if (!checkImageType.ok) {
      return res.status(400).json({ message: 'Image type is not supported. Please only upload .jpeg/.png images.' });
    }

    // modified image name that contain spaces with '_'
    const imageName = req.file.originalname.replace(/ /g, '_');
    const blob = bucket.file(imageName);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.on('error', (err) => {
      console.log(err);
      return res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error.' });
    });

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    });

    blobStream.end(req.file.buffer);

    setTimeout(async () => {
      try {
        const folderPath = './uploads';

        // Create a local folder 'uploads' if it doesn't exist
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
        }

        const destFilename = `./uploads/${blob.name}`;
        const options = {
          destination: destFilename,
        };

        // Download the temporary image from the bucket
        const downloadFile = await storage.bucket(process.env.BUCKET_NAME).file(blob.name).download(options);

        if (downloadFile) {
          const formData = {
            image: {
              value: fs.createReadStream(`./uploads/${blob.name}`),
              options: {
                filename: blob.name,
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
            // Delete the temporary downloaded image
            fs.unlinkSync(destFilename);

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
        }
      } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json({ error: error.message || 'Internal Server Error.' });
      }
    }, 2500);
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({ error: error.message || 'Internal Server Error.' });
  }
};

module.exports = { uploadImage, upload };