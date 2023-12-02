const admin = require('firebase-admin');
const serviceAccount = require('../firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://product-capstone-405005-default-rtdb.asia-southeast1.firebasedatabase.app/',
});

const db = admin.firestore();

module.exports = db;