const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const config = require('../config/env');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Generate JWT access and refresh tokens.
 */
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

/**
 * Sanitize user object for response (remove sensitive fields).
 */
const sanitizeUser = (user) => {
  const { passwordHash, refreshToken, ...sanitized } = user;
  return sanitized;
};

// ─── REGISTER ────────────────────────────────

const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, role = 'customer' } = req.body;

  // Validate role — only customer and shop_owner can self-register
  if (!['customer', 'shop_owner'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role. Only "customer" or "shop_owner" allowed.',
    });
  }

  // Check if user already exists
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existing) {
    const field = existing.email === email ? 'email' : 'phone';
    return res.status(409).json({
      success: false,
      message: `User with this ${field} already exists.`,
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      fullName,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role,
    },
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Store refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    },
  });
});

// ─── LOGIN ───────────────────────────────────

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Account has been deactivated. Contact support.',
    });
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Store refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.json({
    success: true,
    message: 'Login successful.',
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    },
  });
});

// ─── REFRESH TOKEN ───────────────────────────

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required.',
    });
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token.',
    });
  }

  // Check if the stored refresh token matches
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user || user.refreshToken !== refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token.',
    });
  }

  // Generate new tokens
  const tokens = generateTokens(user);

  // Update stored refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  res.json({
    success: true,
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

// ─── LOGOUT ──────────────────────────────────

const logout = asyncHandler(async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data: { refreshToken: null },
  });

  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

// ─── GET CURRENT USER ────────────────────────

const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      vehicles: { where: { isActive: true } },
      shops: { where: { isActive: true } },
    },
  });

  res.json({
    success: true,
    data: sanitizeUser(user),
  });
});

// ─── CHANGE PASSWORD ─────────────────────────

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect.',
    });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: req.user.id },
    data: { passwordHash },
  });

  res.json({
    success: true,
    message: 'Password changed successfully.',
  });
});

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
  changePassword,
};
