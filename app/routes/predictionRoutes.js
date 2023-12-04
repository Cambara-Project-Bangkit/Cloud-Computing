const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { aksaraPrediction } = require('../controllers/predictionController');
const multer = require('multer');

// Middleware to validate inputs
const validateInputs = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1000 * 1000,
  },
});
router.post('/', upload.single('image'), aksaraPrediction);

module.exports = router;