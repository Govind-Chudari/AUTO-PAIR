const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

// ─── SUBMIT REVIEW ──────────────────────────

const submitReview = asyncHandler(async (req, res) => {
  const { requestId, rating, reviewText } = req.body;

  const request = await prisma.repairRequest.findFirst({
    where: { id: requestId, customerId: req.user.id, status: 'completed' },
  });

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Completed repair request not found.',
    });
  }

  // Check if review already exists
  const existing = await prisma.review.findUnique({ where: { requestId } });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Review already submitted for this repair.',
    });
  }

  const review = await prisma.review.create({
    data: {
      requestId,
      customerId: req.user.id,
      shopId: request.shopId,
      rating: parseInt(rating),
      reviewText,
    },
  });

  // Update shop's average rating and review count
  const stats = await prisma.review.aggregate({
    where: { shopId: request.shopId, isVisible: true },
    _avg: { rating: true },
    _count: { id: true },
  });

  await prisma.shop.update({
    where: { id: request.shopId },
    data: {
      avgRating: Math.round(stats._avg.rating * 10) / 10,
      totalReviews: stats._count.id,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Review submitted.',
    data: review,
  });
});

// ─── GET SHOP REVIEWS ───────────────────────

const getShopReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { shopId: req.params.shopId, isVisible: true },
      include: {
        customer: { select: { fullName: true, avatarUrl: true } },
        request: { select: { requestNumber: true, title: true } },
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({ where: { shopId: req.params.shopId, isVisible: true } }),
  ]);

  res.json({
    success: true,
    data: reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// ─── REPLY TO REVIEW ────────────────────────

const replyToReview = asyncHandler(async (req, res) => {
  const { shopReply } = req.body;

  const review = await prisma.review.findUnique({
    where: { id: req.params.id },
    include: { shop: true },
  });

  if (!review || review.shop.ownerId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Review not found.' });
  }

  const updated = await prisma.review.update({
    where: { id: req.params.id },
    data: { shopReply },
  });

  res.json({
    success: true,
    message: 'Reply added.',
    data: updated,
  });
});

module.exports = {
  submitReview,
  getShopReviews,
  replyToReview,
};
