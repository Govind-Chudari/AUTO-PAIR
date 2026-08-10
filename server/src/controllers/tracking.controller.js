const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

// ─── GET TRACKING TIMELINE ──────────────────

const getTrackingTimeline = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const request = await prisma.repairRequest.findUnique({
    where: { id: requestId },
    select: { customerId: true, shopId: true, shop: { select: { ownerId: true } } },
  });

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found.' });
  }

  // Access check
  if (
    req.user.role === 'customer' && request.customerId !== req.user.id ||
    req.user.role === 'shop_owner' && request.shop?.ownerId !== req.user.id
  ) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const timeline = await prisma.repairTracking.findMany({
    where: { requestId },
    orderBy: { createdAt: 'asc' },
    include: {
      updater: { select: { fullName: true, role: true } },
    },
  });

  res.json({
    success: true,
    data: timeline,
  });
});

// ─── ADD TRACKING UPDATE ────────────────────

const addTrackingUpdate = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { status, title, description, photoUrl, estimatedMinutesRemaining } = req.body;

  const request = await prisma.repairRequest.findUnique({
    where: { id: requestId },
    include: { shop: true },
  });

  if (!request || request.shop?.ownerId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Request not found.' });
  }

  // Update repair request status
  const updateData = { status };
  if (status === 'delivered') updateData.deliveredAt = new Date();
  if (status === 'completed') updateData.completedAt = new Date();

  await prisma.repairRequest.update({
    where: { id: requestId },
    data: updateData,
  });

  // Create tracking entry
  const tracking = await prisma.repairTracking.create({
    data: {
      requestId,
      status,
      title,
      description,
      updatedBy: req.user.id,
      photoUrl,
      estimatedMinutesRemaining,
    },
  });

  // Notify customer
  await prisma.notification.create({
    data: {
      userId: request.customerId,
      title: `Repair Update: ${title}`,
      body: description || `Your repair status has been updated to: ${status}`,
      type: 'repair_update',
      referenceId: requestId,
    },
  });

  // TODO: Emit Socket.IO event for real-time tracking

  res.status(201).json({
    success: true,
    message: 'Tracking updated.',
    data: tracking,
  });
});

// ─── UPDATE ETA ─────────────────────────────

const updateETA = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { estimatedMinutesRemaining } = req.body;

  const request = await prisma.repairRequest.findUnique({
    where: { id: requestId },
    include: { shop: true },
  });

  if (!request || request.shop?.ownerId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Request not found.' });
  }

  // Add a tracking note for the ETA update
  const tracking = await prisma.repairTracking.create({
    data: {
      requestId,
      status: request.status,
      title: 'ETA Updated',
      description: `Estimated time remaining: ${estimatedMinutesRemaining} minutes`,
      updatedBy: req.user.id,
      estimatedMinutesRemaining,
    },
  });

  // TODO: Emit Socket.IO event

  res.json({
    success: true,
    message: 'ETA updated.',
    data: tracking,
  });
});

module.exports = {
  getTrackingTimeline,
  addTrackingUpdate,
  updateETA,
};
