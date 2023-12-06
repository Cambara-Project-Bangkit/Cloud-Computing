require('dotenv').config();
const multer = require('multer');
const fs = require('fs');
const request = require('request');
const { storage, bucket } = require('../config/gcs');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
  },
});

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).send('No file uploaded.');
      return;
    }

    // Create a new blob in the bucket and upload the file data.
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
        metadata: {
            contentType: req.file.mimetype,
        }
    });
    blobStream.on('error', (err) => {
      console.log(err);
    });

    await bucket.file(blob.name);

    blobStream.on('finish', () => {
      // The public URL can be used to directly access the file via HTTP.
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      // res.status(200).send(publicUrl);
    });

    blobStream.end(req.file.buffer);

    setTimeout(async () => {
      try {
        const destFilename = `./uploads/${blob.name}`;
        const options = {
          destination: destFilename,
        };
        const downloadFile = await storage.bucket(process.env.BUCKET_NAME).file(blob.name).download(options);
        if(downloadFile){
          const formData = {
            image: {
              value: fs.createReadStream(`./uploads/${blob.name}`), 
              options: {
                filename: req.file.originalname,
                contentType: req.file.mimetype 
              }
            },
          };
          request.post({
            url: 'http://127.0.0.1:5000/prediction', 
            formData: formData
          }, (error, response, body) => {
            if (error) {
              // console.error(error);
              res.status(500).json({ error: error.toString() });
            } else if (response.statusCode === 200) {
              const parsed = JSON.parse(body);
              res.status(200).json({data: parsed.data});
            } else if(response.statusCode === 400){
              console.error(error);
              res.status(400).json({data: JSON.parse(body)});
            }
          });
        }
      } catch (error) {
        console.error(error);
      }
    }, 3000);
    
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

module.exports = { uploadImage, upload };