require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
  keyFilename: process.env.KEY_FILE,
  projectId: process.env.PROJECT_ID,
});

const bucket = storage.bucket('imageresources_model');

module.exports = { storage, bucket };