const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// ─── REGISTER ────────────────────────────────
router.post(
  '/register',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('phone').trim().notEmpty().withMessage('Phone number is required.'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters.'),
    body('role')
      .optional()
      .isIn(['customer', 'shop_owner'])
      .withMessage('Role must be customer or shop_owner.'),
  ],
  validate,
  authController.register
);

// ─── LOGIN ───────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  authController.login
);

// ─── REFRESH TOKEN ───────────────────────────
router.post(
  '/refresh-token',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required.')],
  validate,
  authController.refreshAccessToken
);

// ─── LOGOUT ──────────────────────────────────
router.post('/logout', authenticate, authController.logout);

// ─── GET ME ──────────────────────────────────
router.get('/me', authenticate, authController.getMe);

// ─── CHANGE PASSWORD ─────────────────────────
router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters.'),
  ],
  validate,
  authController.changePassword
);

module.exports = router;
