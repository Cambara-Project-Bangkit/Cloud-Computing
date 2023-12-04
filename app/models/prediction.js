const db = require('../config/firestore');
const { v4: uuidv4 } = require('uuid');

class Prediction {
  constructor(id, aksara, urlImage, userId) {
    this.id = id;
    this.aksara = aksara;
    this.urlImage = urlImage;
    this.userId = userId;
  }

  static async createUser(aksara, urlImage, userId) {
    const id = uuidv4();
    if (!aksara || !urlImage || !userId) {
      throw new Error('Invalid prediction data');
    }
    await db.collection('userAksara').doc(id).set({
      aksara: aksara,
      urlImage: urlImage,
      userId: userId
    });
  }  
}

module.exports = Prediction;