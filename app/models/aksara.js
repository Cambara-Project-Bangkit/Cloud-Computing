const db = require("../config/firestore");
const { v4: uuidv4 } = require("uuid");

class Aksara {
  constructor(id, name, description, urlImage, urlYoutube) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.urlImage = urlImage;
    this.urlYoutube = urlYoutube;
  }

  static async createAksara(name, description, urlImage, urlYoutube) {
    const id = uuidv4();
    if (!name || !description || !urlImage || !urlYoutube) {
      throw new Error("Invalid aksara data");
    }
    await db.collection("aksaras").doc(id).set({
      name: name,
      description: description,
      urlImage: urlImage,
      urlYoutube: urlYoutube,
    });
  }

  static async readAksara(id) {
    const doc = await db.collection("aksaras").doc(id).get();
    if (!doc.exists) {
      throw new Error("Aksara does not exist");
    }
    return new Aksara(doc.id, doc.data().name, doc.data().description, doc.data().urlImage, doc.data().urlYoutube);
  }

  static async listAllAksara() {
    const doc = await db.collection("aksaras").get();
    if (doc.empty) {
      throw new Error("Aksara does not exist");
    }
    return doc.docs.map(doc => new Aksara(doc.id, doc.data().name, doc.data().description, doc.data().urlImage, doc.data().urlYoutube));
  }
}

module.exports = Aksara;
