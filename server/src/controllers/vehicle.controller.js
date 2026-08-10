const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

// ─── ADD VEHICLE ─────────────────────────────

const addVehicle = asyncHandler(async (req, res) => {
  const {
    vehicleType, brand, model, year,
    registrationNumber, color, fuelType, photoUrl,
  } = req.body;

  const vehicle = await prisma.vehicle.create({
    data: {
      ownerId: req.user.id,
      vehicleType,
      brand,
      model,
      year: year ? parseInt(year) : null,
      registrationNumber: registrationNumber.toUpperCase().trim(),
      color,
      fuelType,
      photoUrl,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Vehicle added successfully.',
    data: vehicle,
  });
});

// ─── LIST MY VEHICLES ────────────────────────

const getMyVehicles = asyncHandler(async (req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      ownerId: req.user.id,
      isActive: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: vehicles,
  });
});

// ─── GET VEHICLE BY ID ──────────────────────

const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: req.params.id,
      ownerId: req.user.id,
    },
  });

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: 'Vehicle not found.',
    });
  }

  res.json({
    success: true,
    data: vehicle,
  });
});

// ─── UPDATE VEHICLE ─────────────────────────

const updateVehicle = asyncHandler(async (req, res) => {
  const { brand, model, year, color, fuelType, photoUrl } = req.body;

  // Verify ownership
  const existing = await prisma.vehicle.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: 'Vehicle not found.',
    });
  }

  const vehicle = await prisma.vehicle.update({
    where: { id: req.params.id },
    data: {
      ...(brand && { brand }),
      ...(model && { model }),
      ...(year && { year: parseInt(year) }),
      ...(color !== undefined && { color }),
      ...(fuelType && { fuelType }),
      ...(photoUrl !== undefined && { photoUrl }),
    },
  });

  res.json({
    success: true,
    message: 'Vehicle updated.',
    data: vehicle,
  });
});

// ─── DELETE (SOFT) VEHICLE ──────────────────

const deleteVehicle = asyncHandler(async (req, res) => {
  const existing = await prisma.vehicle.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: 'Vehicle not found.',
    });
  }

  await prisma.vehicle.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });

  res.json({
    success: true,
    message: 'Vehicle removed.',
  });
});

// ─── VEHICLE REPAIR HISTORY ─────────────────

const getVehicleHistory = asyncHandler(async (req, res) => {
  const existing = await prisma.vehicle.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: 'Vehicle not found.',
    });
  }

  const repairs = await prisma.repairRequest.findMany({
    where: { vehicleId: req.params.id },
    include: {
      shop: { select: { shopName: true, logoUrl: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: repairs,
  });
});

module.exports = {
  addVehicle,
  getMyVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVehicleHistory,
};
