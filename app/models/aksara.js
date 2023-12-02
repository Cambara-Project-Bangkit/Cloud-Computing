const db = require("../config/firestore");
const { v4: uuidv4 } = require("uuid");

class Aksara {
  constructor(id, name, urlImage) {
    this.id = id;
    this.name = name;
    this.urlImage = urlImage;
  }

  static async createAksara(name, urlImage) {
    const id = uuidv4();
    if (!name || !urlImage) {
      throw new Error("Invalid aksara data");
    }
    await db.collection("aksaras").doc(id).set({
      name: name,
      urlImage: urlImage,
    });
  }

  static async readAksara(id) {
    const doc = await db.collection("aksaras").doc(id).get();
    if (!doc.exists) {
      throw new Error("Aksara does not exist");
    }
    return new Aksara(doc.id, doc.data().name, doc.data().urlImage);
  }

  static async listAllAksara() {
    const doc = await db.collection("aksaras").get();
    if (doc.empty) {
      throw new Error("Aksara does not exist");
    }
    return doc.docs.map(doc => new Aksara(doc.id, doc.data().name, doc.data().urlImage));
  }
}

module.exports = Aksara;
