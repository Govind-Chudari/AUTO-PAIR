const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

// ─── GET CHAT MESSAGES ──────────────────────

const getChatMessages = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const request = await prisma.repairRequest.findUnique({
    where: { id: requestId },
    select: { customerId: true, shop: { select: { ownerId: true } } },
  });

  if (!request) {
    return res.status(404).json({ success: false, message: 'Repair request not found.' });
  }

  // Access check: customer or shop owner
  const isCustomer = req.user.id === request.customerId;
  const isShopOwner = req.user.id === request.shop?.ownerId;

  if (!isCustomer && !isShopOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { requestId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: {
        select: { id: true, fullName: true, avatarUrl: true, role: true },
      },
    },
  });

  res.json({ success: true, data: messages });
});

// ─── SEND CHAT MESSAGE ──────────────────────

const sendMessage = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { message, attachmentUrl } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ success: false, message: 'Message content required.' });
  }

  const request = await prisma.repairRequest.findUnique({
    where: { id: requestId },
    include: { shop: true },
  });

  if (!request) {
    return res.status(404).json({ success: false, message: 'Repair request not found.' });
  }

  const isCustomer = req.user.id === request.customerId;
  const isShopOwner = req.user.id === request.shop?.ownerId;

  if (!isCustomer && !isShopOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied to send message.' });
  }

  const newMessage = await prisma.chatMessage.create({
    data: {
      requestId,
      senderId: req.user.id,
      message,
      attachmentUrl,
    },
    include: {
      sender: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
    },
  });

  // Emit Socket.IO event if io instance is configured
  const io = req.app.get('io');
  if (io) {
    io.to(`chat:${requestId}`).emit('chat:message', newMessage);
  }

  // Send Notification to receiver
  const receiverId = isCustomer ? request.shop?.ownerId : request.customerId;
  if (receiverId) {
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: `New message from ${req.user.fullName}`,
        body: message.length > 50 ? `${message.substring(0, 50)}...` : message,
        type: 'chat',
        referenceId: requestId,
      },
    });
  }

  res.status(201).json({ success: true, data: newMessage });
});

module.exports = {
  getChatMessages,
  sendMessage,
};
