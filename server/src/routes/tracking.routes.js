const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const trackingController = require('../controllers/tracking.controller');

const router = express.Router();

router.use(authenticate);

router.get('/:requestId', trackingController.getTrackingTimeline);

router.post(
  '/:requestId',
  [
    body('status').notEmpty().withMessage('Status is required.'),
    body('title').notEmpty().withMessage('Title is required.'),
  ],
  validate,
  trackingController.addTrackingUpdate
);

router.put('/:requestId/eta', trackingController.updateETA);

module.exports = router;
