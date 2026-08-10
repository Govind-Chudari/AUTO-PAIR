const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const vehicleController = require('../controllers/vehicle.controller');

const router = express.Router();

// All routes require customer authentication
router.use(authenticate, authorize('customer'));

router.post(
  '/',
  [
    body('vehicleType').isIn(['scooty', 'bike', 'car', 'auto_rickshaw', 'truck', 'other']),
    body('brand').trim().notEmpty().withMessage('Brand is required.'),
    body('model').trim().notEmpty().withMessage('Model is required.'),
    body('registrationNumber').trim().notEmpty().withMessage('Registration number is required.'),
  ],
  validate,
  vehicleController.addVehicle
);

router.get('/', vehicleController.getMyVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);
router.get('/:id/history', vehicleController.getVehicleHistory);

module.exports = router;
