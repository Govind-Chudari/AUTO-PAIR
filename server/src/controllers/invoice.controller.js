const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const { generateInvoiceNumber } = require('../utils/generateId');

// ─── CREATE INVOICE ─────────────────────────

const createInvoice = asyncHandler(async (req, res) => {
  const { requestId, items, notes, taxAmount = 0, discountAmount = 0 } = req.body;

  const request = await prisma.repairRequest.findUnique({
    where: { id: requestId },
    include: { shop: true },
  });

  if (!request || request.shop?.ownerId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Request not found.' });
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.unitPrice * (item.quantity || 1));
  }, 0);
  const totalAmount = subtotal + parseFloat(taxAmount) - parseFloat(discountAmount);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: generateInvoiceNumber(),
      requestId,
      shopId: request.shopId,
      customerId: request.customerId,
      subtotal,
      taxAmount: parseFloat(taxAmount),
      discountAmount: parseFloat(discountAmount),
      totalAmount,
      notes,
      items: {
        create: items.map((item) => ({
          itemType: item.itemType || 'service',
          description: item.description,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * (item.quantity || 1),
          isNewPart: item.isNewPart !== undefined ? item.isNewPart : true,
          warrantyDays: item.warrantyDays || 0,
        })),
      },
    },
    include: { items: true },
  });

  // Update repair request with final cost
  await prisma.repairRequest.update({
    where: { id: requestId },
    data: { finalCost: totalAmount },
  });

  // Notify customer
  await prisma.notification.create({
    data: {
      userId: request.customerId,
      title: 'Invoice Generated',
      body: `Invoice #${invoice.invoiceNumber} for ₹${totalAmount.toFixed(2)} has been created.`,
      type: 'payment',
      referenceId: requestId,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Invoice created.',
    data: invoice,
  });
});

// ─── GET INVOICE ────────────────────────────

const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: {
      items: true,
      request: {
        include: {
          vehicle: true,
          customer: { select: { fullName: true, phone: true, email: true, address: true } },
        },
      },
      shop: { select: { shopName: true, address: true, phone: true, email: true, logoUrl: true } },
    },
  });

  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found.' });
  }

  res.json({
    success: true,
    data: invoice,
  });
});

// ─── UPDATE INVOICE ─────────────────────────

const updateInvoice = asyncHandler(async (req, res) => {
  const { items, notes, taxAmount, discountAmount } = req.body;

  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: { shop: true },
  });

  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found.' });
  }

  if (invoice.paymentStatus === 'paid') {
    return res.status(400).json({ success: false, message: 'Cannot edit a paid invoice.' });
  }

  // Delete old items and recreate
  if (items) {
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });

    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * (item.quantity || 1)), 0);
    const tax = taxAmount !== undefined ? parseFloat(taxAmount) : parseFloat(invoice.taxAmount);
    const discount = discountAmount !== undefined ? parseFloat(discountAmount) : parseFloat(invoice.discountAmount);
    const totalAmount = subtotal + tax - discount;

    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        subtotal,
        taxAmount: tax,
        discountAmount: discount,
        totalAmount,
        notes: notes || invoice.notes,
        items: {
          create: items.map((item) => ({
            itemType: item.itemType || 'service',
            description: item.description,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * (item.quantity || 1),
            isNewPart: item.isNewPart !== undefined ? item.isNewPart : true,
            warrantyDays: item.warrantyDays || 0,
          })),
        },
      },
      include: { items: true },
    });

    return res.json({ success: true, data: updated });
  }

  res.json({ success: true, data: invoice });
});

// ─── CONFIRM CASH PAYMENT ───────────────────

const confirmCashPayment = asyncHandler(async (req, res) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: { shop: true },
  });

  if (!invoice || invoice.shop.ownerId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Invoice not found.' });
  }

  const updated = await prisma.invoice.update({
    where: { id: req.params.id },
    data: {
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      paidAt: new Date(),
    },
  });

  // Mark repair as paid
  await prisma.repairRequest.update({
    where: { id: invoice.requestId },
    data: { isPaid: true, paymentMethod: 'cash' },
  });

  res.json({
    success: true,
    message: 'Cash payment confirmed.',
    data: updated,
  });
});

module.exports = {
  createInvoice,
  getInvoiceById,
  updateInvoice,
  confirmCashPayment,
};
