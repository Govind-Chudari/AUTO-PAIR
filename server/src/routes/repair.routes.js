const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const repairController = require('../controllers/repair.controller');

const router = express.Router();

router.use(authenticate);

// Customer raises a request
router.post(
  '/',
  authorize('customer'),
  [
    body('vehicleId').notEmpty().withMessage('Vehicle ID is required.'),
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('description').trim().notEmpty().withMessage('Description is required.'),
    body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required.'),
    body('pickupLatitude').isDecimal().withMessage('Valid pickup latitude is required.'),
    body('pickupLongitude').isDecimal().withMessage('Valid pickup longitude is required.'),
  ],
  validate,
  repairController.createRepairRequest
);

// List (customer sees theirs, shop sees assigned to them)
router.get('/', repairController.listRepairRequests);

// Shop: incoming pending requests nearby
router.get('/incoming', authorize('shop_owner', 'admin'), repairController.getIncomingRequests);

// Get details
router.get('/:id', repairController.getRepairRequestById);

// Shop: accept / reject
router.post(
  '/:id/accept',
  authorize('shop_owner'),
  [body('shopId').notEmpty().withMessage('Shop ID is required.')],
  validate,
  repairController.acceptRequest
);

router.post('/:id/reject', authorize('shop_owner'), repairController.rejectRequest);

// Customer: cancel
router.post('/:id/cancel', authorize('customer'), repairController.cancelRequest);

// Shop: update estimate
router.put('/:id/estimate', authorize('shop_owner'), repairController.updateEstimate);

module.exports = router;
