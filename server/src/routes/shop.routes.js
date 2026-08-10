const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const shopController = require('../controllers/shop.controller');

const router = express.Router();

// ─── PUBLIC ROUTES ──────────────────────────
router.get('/', shopController.listShops);
router.get('/nearby', shopController.getNearbyShops);
router.get('/:id', shopController.getShopById);

// ─── SHOP OWNER ROUTES ─────────────────────
router.post(
  '/',
  authenticate,
  authorize('shop_owner'),
  [
    body('shopName').trim().notEmpty().withMessage('Shop name is required.'),
    body('address').trim().notEmpty().withMessage('Address is required.'),
    body('city').trim().notEmpty().withMessage('City is required.'),
    body('state').trim().notEmpty().withMessage('State is required.'),
    body('pincode').trim().notEmpty().withMessage('Pincode is required.'),
    body('latitude').isDecimal().withMessage('Valid latitude is required.'),
    body('longitude').isDecimal().withMessage('Valid longitude is required.'),
    body('phone').trim().notEmpty().withMessage('Phone is required.'),
    body('openingTime').trim().notEmpty().withMessage('Opening time is required.'),
    body('closingTime').trim().notEmpty().withMessage('Closing time is required.'),
  ],
  validate,
  shopController.createShop
);

router.put('/:id', authenticate, authorize('shop_owner'), shopController.updateShop);

// Photos
router.post('/:id/photos', authenticate, authorize('shop_owner'), shopController.addShopPhoto);
router.delete('/:id/photos/:photoId', authenticate, authorize('shop_owner'), shopController.deleteShopPhoto);

// Services
router.post('/:id/services', authenticate, authorize('shop_owner'), shopController.addShopService);
router.put('/:id/services/:serviceId', authenticate, authorize('shop_owner'), shopController.updateShopService);
router.delete('/:id/services/:serviceId', authenticate, authorize('shop_owner'), shopController.deleteShopService);

// Members
router.get('/:id/members', authenticate, authorize('shop_owner'), shopController.getShopMembers);
router.post('/:id/members', authenticate, authorize('shop_owner'), shopController.addShopMember);
router.put('/:id/members/:memberId', authenticate, authorize('shop_owner'), shopController.updateShopMember);
router.delete('/:id/members/:memberId', authenticate, authorize('shop_owner'), shopController.deleteShopMember);

// Stats
router.get('/:id/stats', authenticate, authorize('shop_owner'), shopController.getShopStats);

module.exports = router;
