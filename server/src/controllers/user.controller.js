const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

// ─── UPDATE PROFILE ──────────────────────────

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, address, latitude, longitude, avatarUrl } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(fullName && { fullName }),
      ...(address !== undefined && { address }),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
  });

  const { passwordHash, refreshToken, ...sanitized } = user;

  res.json({
    success: true,
    message: 'Profile updated successfully.',
    data: sanitized,
  });
});

// ─── UPDATE LOCATION ─────────────────────────

const updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  await prisma.user.update({
    where: { id: req.user.id },
    data: { latitude, longitude },
  });

  res.json({
    success: true,
    message: 'Location updated.',
  });
});

// ─── UPDATE FCM TOKEN ────────────────────────

const updateFcmToken = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;

  await prisma.user.update({
    where: { id: req.user.id },
    data: { fcmToken },
  });

  res.json({
    success: true,
    message: 'FCM token updated.',
  });
});

// ─── DEACTIVATE ACCOUNT ──────────────────────

const deactivateAccount = asyncHandler(async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data: { isActive: false },
  });

  res.json({
    success: true,
    message: 'Account deactivated.',
  });
});

module.exports = {
  updateProfile,
  updateLocation,
  updateFcmToken,
  deactivateAccount,
};
