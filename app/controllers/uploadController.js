require('dotenv').config();
const multer = require('multer');
const fs = require('fs');
const request = require('request');
const { storage, bucket } = require('../config/gcs');
const { validateBufferMIMEType } = require("validate-image-type");

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
    
    const {aksara} = req.body;

    // validate the uploaded image type
    const checkImageType = await validateBufferMIMEType(req.file.buffer,{
      allowMimeTypes: ["image/png", "image/jpeg"]
    });
    if (!checkImageType.ok) {
      res.status(400).json({ message: 'Image type is not supported. Please only upload .jpeg/.png image' });
      return;
    }

    // modified image name that contain spaces with '_'
    const imageName = req.file.originalname.replace(/ /g, '_');

    // Create a new blob in the bucket and upload the file data.
    const blob = bucket.file(imageName);
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
        // create a local folder uploads
        const folderPath = './uploads'
        if(!fs.existsSync(folderPath)){
          fs.mkdirSync(folderPath);
        }
        
        // image folder path in local 
        const destFilename = `./uploads/${blob.name}`;
        const options = {
          destination: destFilename,
        };

        // download the temporary image from bucket to pass the image into flask 
        const downloadFile = await storage.bucket(process.env.BUCKET_NAME).file(blob.name).download(options);

        if(downloadFile){
          const formData = {
            image: {
              value: fs.createReadStream(`./uploads/${blob.name}`), 
              options: {
                filename: blob.name,
                contentType: req.file.mimetype 
              }
            },
			      data: aksara,
          };

          request.post({
            url: 'http://127.0.0.1:5000/prediction', 
            formData: formData
          }, (error, response, body) => {
            // delete temporary download image
              fs.unlinkSync(destFilename);
              const parsed = JSON.parse(body);
            if (error) {
              res.status(500).json({ error: error.toString() });
            } else if (response.statusCode === 200) {
              res.status(200).json({
                error: false,
                message: parsed.message,
                data: parsed.data
              });
            } else if(response.statusCode === 400){
              res.status(400).json({ 
                error: true,
                message: parsed.message 
              });
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