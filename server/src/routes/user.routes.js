const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.put(
  '/me',
  [body('fullName').optional().trim().notEmpty()],
  validate,
  userController.updateProfile
);

router.put(
  '/me/location',
  [
    body('latitude').isDecimal().withMessage('Valid latitude is required.'),
    body('longitude').isDecimal().withMessage('Valid longitude is required.'),
  ],
  validate,
  userController.updateLocation
);

router.put('/me/fcm-token', userController.updateFcmToken);

router.delete('/me', userController.deactivateAccount);

module.exports = router;
