require('dotenv').config();
// const Model = require("../models/model");
const request = require('request');
const fs = require('fs');
const {format}=require('util');
const { Storage } = require('@google-cloud/storage');

// Use the functions in modelController.js
/**
 * @swagger
 * /model:
 *   post:
 *     summary: Upload user's handwirting aksara
 *     tags: [Image]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/model'
 *     responses:
 *       200:
 *         description: Success prediction
 *       500:
 *         description: Some server error
 */
const aksaraPrediction = async (req, res) => {
  try {
    const projectId = process.env.PROJECT_ID;
    const keyFilename = process.env.KEY_FILE;
    const bucketName = process.env.BUCKET_NAME;
    
    const storage = new Storage({ projectId, keyFilename });
    const bucket = storage.bucket(bucketName);

    if (req.file) {
      const { aksara } = req.body;
      const { originalname, buffer, mimetype } = req.file;

      const imageName = `${aksara}-${originalname}`;
      let urlImage = "";
      const blob = bucket.file(imageName);
      const blobStream = blob.createWriteStream({
        resumable: false,
      });
      
      blobStream.on("error", (err) => {
        res.status(500).send({ message: err.message });
      });
      
      await bucket.file(imageName);

      blobStream.on("finish", async (data) => {
        urlImage = format(
          `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        );
      });

      blobStream.end(buffer);

      const formData = {
        image: {
          value: fs.createReadStream('./uploads/contoh.jpg'), 
          options: {
            filename: originalname,
            contentType: mimetype 
          }
        },
        aksara: aksara 
      };
      request.post({
        url: 'http://127.0.0.1:5000/prediction', 
        formData: formData
      }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const parsed = JSON.parse(body);
          res.status(200).json({data: parsed.data});
        } else if(response.statusCode === 400){
          console.error(error);
          res.status(400).json({data: JSON.parse(body)});;
        }
      });
    }
  } catch (error) {
      console.error('Error:', error);
  }
};

module.exports = {
    aksaraPrediction,
};