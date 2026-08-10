const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const invoiceController = require('../controllers/invoice.controller');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('shop_owner'), invoiceController.createInvoice);
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', authorize('shop_owner'), invoiceController.updateInvoice);
router.post('/:id/confirm-cash', authorize('shop_owner'), invoiceController.confirmCashPayment);

module.exports = router;
