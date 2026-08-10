const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const { filterNearbyShops } = require('../utils/geoUtils');

// ─── CREATE SHOP ─────────────────────────────

const createShop = asyncHandler(async (req, res) => {
  const {
    shopName, description, address, city, state, pincode,
    latitude, longitude, phone, email, openingTime, closingTime,
    workingDays, acceptsPickup, serviceRadiusKm,
  } = req.body;

  const shop = await prisma.shop.create({
    data: {
      ownerId: req.user.id,
      shopName,
      description,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      phone,
      email,
      openingTime,
      closingTime,
      workingDays: workingDays || 'Mon-Sat',
      acceptsPickup: acceptsPickup !== undefined ? acceptsPickup : true,
      serviceRadiusKm: serviceRadiusKm || 10,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Shop registered successfully. Awaiting admin verification.',
    data: shop,
  });
});

// ─── LIST / SEARCH SHOPS ────────────────────

const listShops = asyncHandler(async (req, res) => {
  const { city, search, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    isActive: true,
    isVerified: true,
    ...(city && { city: { contains: city, mode: 'insensitive' } }),
    ...(search && {
      OR: [
        { shopName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [shops, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      include: {
        photos: { take: 1, orderBy: { displayOrder: 'asc' } },
        services: { include: { category: true }, where: { isActive: true } },
      },
      skip,
      take: parseInt(limit),
      orderBy: { avgRating: 'desc' },
    }),
    prisma.shop.count({ where }),
  ]);

  res.json({
    success: true,
    data: shops,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// ─── NEARBY SHOPS ───────────────────────────

const getNearbyShops = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 15 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required.',
    });
  }

  const allShops = await prisma.shop.findMany({
    where: { isActive: true, isVerified: true },
    include: {
      photos: { take: 1, orderBy: { displayOrder: 'asc' } },
      services: { include: { category: true }, where: { isActive: true } },
    },
  });

  const nearbyShops = filterNearbyShops(
    allShops,
    parseFloat(lat),
    parseFloat(lng),
    parseFloat(radius)
  );

  res.json({
    success: true,
    data: nearbyShops,
    count: nearbyShops.length,
  });
});

// ─── GET SHOP DETAILS ───────────────────────

const getShopById = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findUnique({
    where: { id: req.params.id },
    include: {
      owner: { select: { fullName: true, avatarUrl: true } },
      photos: { orderBy: { displayOrder: 'asc' } },
      services: {
        where: { isActive: true },
        include: { category: true },
      },
      reviews: {
        where: { isVisible: true },
        include: { customer: { select: { fullName: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!shop || !shop.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Shop not found.',
    });
  }

  res.json({
    success: true,
    data: shop,
  });
});

// ─── UPDATE SHOP ────────────────────────────

const updateShop = asyncHandler(async (req, res) => {
  // Verify ownership
  const existing = await prisma.shop.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: 'Shop not found or you are not the owner.',
    });
  }

  const {
    shopName, description, address, city, state, pincode,
    latitude, longitude, phone, email, logoUrl, coverPhotoUrl,
    openingTime, closingTime, workingDays, acceptsPickup, serviceRadiusKm,
  } = req.body;

  const shop = await prisma.shop.update({
    where: { id: req.params.id },
    data: {
      ...(shopName && { shopName }),
      ...(description !== undefined && { description }),
      ...(address && { address }),
      ...(city && { city }),
      ...(state && { state }),
      ...(pincode && { pincode }),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      ...(phone && { phone }),
      ...(email !== undefined && { email }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(coverPhotoUrl !== undefined && { coverPhotoUrl }),
      ...(openingTime && { openingTime }),
      ...(closingTime && { closingTime }),
      ...(workingDays && { workingDays }),
      ...(acceptsPickup !== undefined && { acceptsPickup }),
      ...(serviceRadiusKm !== undefined && { serviceRadiusKm }),
    },
  });

  res.json({
    success: true,
    message: 'Shop updated.',
    data: shop,
  });
});

// ─── ADD SHOP PHOTO ─────────────────────────

const addShopPhoto = asyncHandler(async (req, res) => {
  const existing = await prisma.shop.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: 'Shop not found or you are not the owner.',
    });
  }

  const { photoUrl, caption, displayOrder } = req.body;

  const photo = await prisma.shopPhoto.create({
    data: {
      shopId: req.params.id,
      photoUrl,
      caption,
      displayOrder: displayOrder || 0,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Photo added.',
    data: photo,
  });
});

// ─── DELETE SHOP PHOTO ──────────────────────

const deleteShopPhoto = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!shop) {
    return res.status(404).json({
      success: false,
      message: 'Shop not found or you are not the owner.',
    });
  }

  await prisma.shopPhoto.delete({
    where: { id: req.params.photoId },
  });

  res.json({
    success: true,
    message: 'Photo deleted.',
  });
});

// ─── ADD SHOP SERVICE ───────────────────────

const addShopService = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!shop) {
    return res.status(404).json({
      success: false,
      message: 'Shop not found or you are not the owner.',
    });
  }

  const { categoryId, basePrice, description } = req.body;

  const service = await prisma.shopService.create({
    data: {
      shopId: req.params.id,
      categoryId,
      basePrice,
      description,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Service added.',
    data: service,
  });
});

// ─── UPDATE SHOP SERVICE ────────────────────

const updateShopService = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!shop) {
    return res.status(404).json({
      success: false,
      message: 'Shop not found.',
    });
  }

  const { basePrice, description, isActive } = req.body;

  const service = await prisma.shopService.update({
    where: { id: req.params.serviceId },
    data: {
      ...(basePrice !== undefined && { basePrice }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  res.json({
    success: true,
    data: service,
  });
});

// ─── DELETE SHOP SERVICE ────────────────────

const deleteShopService = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!shop) {
    return res.status(404).json({
      success: false,
      message: 'Shop not found.',
    });
  }

  await prisma.shopService.delete({
    where: { id: req.params.serviceId },
  });

  res.json({
    success: true,
    message: 'Service removed.',
  });
});

// ─── SHOP MEMBERS ───────────────────────────

const getShopMembers = asyncHandler(async (req, res) => {
  const members = await prisma.shopMember.findMany({
    where: { shopId: req.params.id, isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: members });
});

const addShopMember = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found.' });
  }

  const { name, role, phone } = req.body;

  const member = await prisma.shopMember.create({
    data: { shopId: req.params.id, name, role, phone },
  });

  res.status(201).json({
    success: true,
    message: 'Member added.',
    data: member,
  });
});

const updateShopMember = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found.' });
  }

  const { name, role, phone, isActive } = req.body;

  const member = await prisma.shopMember.update({
    where: { id: req.params.memberId },
    data: {
      ...(name && { name }),
      ...(role && { role }),
      ...(phone !== undefined && { phone }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  res.json({ success: true, data: member });
});

const deleteShopMember = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found.' });
  }

  await prisma.shopMember.update({
    where: { id: req.params.memberId },
    data: { isActive: false },
  });

  res.json({ success: true, message: 'Member removed.' });
});

// ─── SHOP STATS ─────────────────────────────

const getShopStats = asyncHandler(async (req, res) => {
  const shop = await prisma.shop.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found.' });
  }

  const [totalRepairs, activeRepairs, totalRevenue, avgRating] = await Promise.all([
    prisma.repairRequest.count({
      where: { shopId: req.params.id, status: 'completed' },
    }),
    prisma.repairRequest.count({
      where: {
        shopId: req.params.id,
        status: { notIn: ['completed', 'cancelled', 'rejected', 'pending'] },
      },
    }),
    prisma.invoice.aggregate({
      where: { shopId: req.params.id, paymentStatus: 'paid' },
      _sum: { totalAmount: true },
    }),
    prisma.review.aggregate({
      where: { shopId: req.params.id, isVisible: true },
      _avg: { rating: true },
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalRepairs,
      activeRepairs,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      avgRating: avgRating._avg.rating || 0,
      totalReviews: shop.totalReviews,
    },
  });
});

module.exports = {
  createShop,
  listShops,
  getNearbyShops,
  getShopById,
  updateShop,
  addShopPhoto,
  deleteShopPhoto,
  addShopService,
  updateShopService,
  deleteShopService,
  getShopMembers,
  addShopMember,
  updateShopMember,
  deleteShopMember,
  getShopStats,
};
