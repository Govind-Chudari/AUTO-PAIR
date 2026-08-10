const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const { generateRequestNumber } = require('../utils/generateId');
const { filterNearbyShops } = require('../utils/geoUtils');

// ─── RAISE REPAIR REQUEST ───────────────────

const createRepairRequest = asyncHandler(async (req, res) => {
  const {
    vehicleId, categoryId, title, description, urgency,
    pickupAddress, pickupLatitude, pickupLongitude,
    deliveryAddress, customerNotes,
  } = req.body;

  // Verify vehicle ownership
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, ownerId: req.user.id, isActive: true },
  });

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: 'Vehicle not found.',
    });
  }

  const request = await prisma.repairRequest.create({
    data: {
      requestNumber: generateRequestNumber(),
      customerId: req.user.id,
      vehicleId,
      categoryId,
      title,
      description,
      urgency: urgency || 'medium',
      pickupAddress,
      pickupLatitude,
      pickupLongitude,
      deliveryAddress: deliveryAddress || pickupAddress,
      customerNotes,
    },
    include: {
      vehicle: true,
      category: true,
    },
  });

  // Create initial tracking entry
  await prisma.repairTracking.create({
    data: {
      requestId: request.id,
      status: 'pending',
      title: 'Repair request created',
      description: 'Your repair request has been submitted. Waiting for a shop to accept.',
      updatedBy: req.user.id,
    },
  });

  // TODO: Broadcast to nearby shops via Socket.IO

  res.status(201).json({
    success: true,
    message: 'Repair request submitted. Nearby shops will be notified.',
    data: request,
  });
});

// ─── LIST REPAIR REQUESTS ───────────────────

const listRepairRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let where = {};

  if (req.user.role === 'customer') {
    where.customerId = req.user.id;
  } else if (req.user.role === 'shop_owner') {
    // Get all shops owned by this user
    const shops = await prisma.shop.findMany({
      where: { ownerId: req.user.id },
      select: { id: true },
    });
    const shopIds = shops.map((s) => s.id);
    where.shopId = { in: shopIds };
  }

  if (status) {
    where.status = status;
  }

  const [requests, total] = await Promise.all([
    prisma.repairRequest.findMany({
      where,
      include: {
        vehicle: { select: { brand: true, model: true, registrationNumber: true, vehicleType: true } },
        shop: { select: { shopName: true, logoUrl: true, phone: true } },
        category: { select: { name: true, iconUrl: true } },
        customer: { select: { fullName: true, phone: true, avatarUrl: true } },
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.repairRequest.count({ where }),
  ]);

  res.json({
    success: true,
    data: requests,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// ─── GET INCOMING REQUESTS (For Shops) ──────

const getIncomingRequests = asyncHandler(async (req, res) => {
  // Get shops owned by this user (or all active shops if admin)
  let shops = [];
  if (req.user.role === 'admin') {
    shops = await prisma.shop.findMany({
      where: { isActive: true },
    });
  } else {
    shops = await prisma.shop.findMany({
      where: { ownerId: req.user.id, isActive: true },
    });
  }

  if (shops.length === 0) {
    return res.json({ success: true, data: [], count: 0 });
  }

  // Find pending requests near any of the owner's shops
  const pendingRequests = await prisma.repairRequest.findMany({
    where: { status: 'pending', shopId: null },
    include: {
      vehicle: { select: { brand: true, model: true, vehicleType: true, registrationNumber: true } },
      category: { select: { name: true, iconUrl: true } },
      customer: { select: { fullName: true, phone: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Filter by proximity to any of the owner's shops
  const nearbyRequests = pendingRequests.filter((request) => {
    return shops.some((shop) => {
      const nearby = filterNearbyShops(
        [{ latitude: shop.latitude, longitude: shop.longitude }],
        parseFloat(request.pickupLatitude),
        parseFloat(request.pickupLongitude),
        shop.serviceRadiusKm
      );
      return nearby.length > 0;
    });
  });

  res.json({
    success: true,
    data: nearbyRequests,
    count: nearbyRequests.length,
  });
});

// ─── GET REQUEST DETAILS ────────────────────

const getRepairRequestById = asyncHandler(async (req, res) => {
  const request = await prisma.repairRequest.findUnique({
    where: { id: req.params.id },
    include: {
      vehicle: true,
      shop: {
        include: {
          photos: { take: 1 },
        },
      },
      category: true,
      customer: { select: { fullName: true, phone: true, email: true, avatarUrl: true } },
      tracking: { orderBy: { createdAt: 'asc' } },
      photos: { orderBy: { createdAt: 'asc' } },
      invoice: { include: { items: true } },
      review: true,
    },
  });

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Repair request not found.',
    });
  }

  // Check access: customer or assigned shop owner
  if (req.user.role === 'customer' && request.customerId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  if (req.user.role === 'shop_owner' && request.shop?.ownerId !== req.user.id) {
    // Also check if request is still pending (any shop can view pending)
    if (request.status !== 'pending') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
  }

  res.json({
    success: true,
    data: request,
  });
});

// ─── ACCEPT REQUEST ─────────────────────────

const acceptRequest = asyncHandler(async (req, res) => {
  const { shopId, estimatedCost, estimatedDurationHours, shopNotes } = req.body;

  // Verify shop ownership
  const shop = await prisma.shop.findFirst({
    where: { id: shopId, ownerId: req.user.id, isActive: true },
  });

  if (!shop) {
    return res.status(404).json({
      success: false,
      message: 'Shop not found or you are not the owner.',
    });
  }

  const request = await prisma.repairRequest.findUnique({
    where: { id: req.params.id },
  });

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found.' });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'This request has already been accepted or is no longer available.',
    });
  }

  // Accept the request
  const updated = await prisma.repairRequest.update({
    where: { id: req.params.id },
    data: {
      shopId,
      status: 'accepted',
      estimatedCost,
      estimatedDurationHours,
      shopNotes,
      acceptedAt: new Date(),
    },
    include: { vehicle: true, customer: true, shop: true },
  });

  // Add tracking entry
  await prisma.repairTracking.create({
    data: {
      requestId: req.params.id,
      status: 'accepted',
      title: `Request accepted by ${shop.shopName}`,
      description: shopNotes || `Your repair has been accepted. Estimated cost: ₹${estimatedCost || 'TBD'}`,
      updatedBy: req.user.id,
      estimatedMinutesRemaining: estimatedDurationHours ? estimatedDurationHours * 60 : null,
    },
  });

  // Create notification for customer
  await prisma.notification.create({
    data: {
      userId: request.customerId,
      title: 'Repair Request Accepted!',
      body: `${shop.shopName} has accepted your repair request #${request.requestNumber}.`,
      type: 'repair_update',
      referenceId: request.id,
    },
  });

  res.json({
    success: true,
    message: 'Request accepted.',
    data: updated,
  });
});

// ─── REJECT REQUEST ─────────────────────────

const rejectRequest = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const request = await prisma.repairRequest.findUnique({
    where: { id: req.params.id },
  });

  if (!request || request.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Request not found or cannot be rejected.',
    });
  }

  // Note: rejection just means this shop passed; the request stays pending for other shops
  // Only update if this shop was somehow already assigned
  if (request.shopId) {
    await prisma.repairRequest.update({
      where: { id: req.params.id },
      data: { status: 'rejected', cancellationReason: reason },
    });
  }

  res.json({
    success: true,
    message: 'Request rejected.',
  });
});

// ─── CANCEL REQUEST (Customer) ──────────────

const cancelRequest = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const request = await prisma.repairRequest.findFirst({
    where: { id: req.params.id, customerId: req.user.id },
  });

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found.' });
  }

  const cancellableStatuses = ['pending', 'accepted', 'pickup_assigned'];
  if (!cancellableStatuses.includes(request.status)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel after vehicle has been picked up.',
    });
  }

  await prisma.repairRequest.update({
    where: { id: req.params.id },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason,
    },
  });

  await prisma.repairTracking.create({
    data: {
      requestId: req.params.id,
      status: 'cancelled',
      title: 'Request cancelled',
      description: reason || 'Cancelled by customer.',
      updatedBy: req.user.id,
    },
  });

  res.json({
    success: true,
    message: 'Request cancelled.',
  });
});

// ─── UPDATE ESTIMATE ────────────────────────

const updateEstimate = asyncHandler(async (req, res) => {
  const { estimatedCost, estimatedDurationHours, shopNotes } = req.body;

  const request = await prisma.repairRequest.findUnique({
    where: { id: req.params.id },
    include: { shop: true },
  });

  if (!request || request.shop?.ownerId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Request not found.' });
  }

  const updated = await prisma.repairRequest.update({
    where: { id: req.params.id },
    data: { estimatedCost, estimatedDurationHours, shopNotes },
  });

  res.json({
    success: true,
    message: 'Estimate updated.',
    data: updated,
  });
});

module.exports = {
  createRepairRequest,
  listRepairRequests,
  getIncomingRequests,
  getRepairRequestById,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  updateEstimate,
};
