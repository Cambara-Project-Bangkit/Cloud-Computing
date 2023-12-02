const db = require('../config/firestore');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(id, name, email, password) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  static async createUser(name, email, password) {
    const id = uuidv4();
    if (!name || !email || !password) {
      throw new Error('Invalid user data');
    }
    await db.collection('users').doc(id).set({
      name: name,
      email: email,
      password: password
    });
  }  

  static async read(id) {
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) {
      throw new Error('User does not exist');
    }
    return new User(doc.id, doc.data().name, doc.data().email);
  }

  static async update(id, name, email) {
    if (!id || !name || !email) {
      throw new Error('Invalid user data');
    }
    await db.collection('users').doc(id).update({
      name: name,
      email: email
    });
  }

  static async findUserByEmail(email) {
    const users = await db.collection('users').where('email', '==', email).get();
    if (users.empty) {
      return null;
    }
    const user = users.docs[0];
    return new User(user.id, user.data().name, user.data().email, user.data().password);
  }
}

module.exports = User;