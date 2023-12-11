require('dotenv').config();
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  keyFilename: process.env.KEY_FILE,
  projectId: process.env.PROJECT_ID,
});

const bucket = storage.bucket(process.env.BUCKET_NAME);

module.exports = { storage, bucket };