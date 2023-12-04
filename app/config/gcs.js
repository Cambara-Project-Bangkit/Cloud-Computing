const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
  keyFilename: path.join(__dirname, 'firebase-key.json'),
  projectId: 'product-capstone-405005',
});

const bucket = storage.bucket('imageresources_model');

module.exports = { storage, bucket };