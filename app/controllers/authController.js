// Import the functions from user.js
require("dotenv").config();
const { createUser, findUserByEmail } = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// Use the functions in authController.js
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Some server error
 */
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Make sure name, email, and password are not falsy
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Invalid user data" });
  }

  try {
    // check if a user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // encrypted user password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password,salt);
    const user = await createUser(name, email, hashPassword);
    res.status(201).json({ message: "Register successful", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Some server error
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check the password
    // const isPasswordCorrect = password === user.password;
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Create a token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // If the password is correct, send a response to the client
    res.status(200).json({
      error: false,
      message: "Login successful",
      user: {
        UserId: user.id,
        name: user.name,
        token: token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
};
