const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { check, validationResult } = require('express-validator');

// Middleware to validate inputs
const validateInputs = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
/**
 * @swagger
 * /api/auth/register:
 *   post:
*     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "admin2"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "12345678"
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Error occurred
 */
router.post('/register', [
  check('name').notEmpty(),
  check('email').isEmail(),
  check('password').isLength({ min: 5 }),
  validateInputs
], register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "12345678"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Error occurred
 */
router.post('/login', [
  check('email').isEmail(),
  check('password').isLength({ min: 5 }),
  validateInputs
], login);

module.exports = router;