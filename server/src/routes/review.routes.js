const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const reviewController = require('../controllers/review.controller');

const router = express.Router();

router.post('/', authenticate, authorize('customer'), reviewController.submitReview);
router.get('/shop/:shopId', reviewController.getShopReviews);
router.post('/:id/reply', authenticate, authorize('shop_owner'), reviewController.replyToReview);

module.exports = router;
