/**
 * Generate a human-readable request number.
 * Format: REQ-YYYYMMDD-XXXX
 */
const generateRequestNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${dateStr}-${random}`;
};

/**
 * Generate a human-readable invoice number.
 * Format: INV-YYYYMMDD-XXXX
 */
const generateInvoiceNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${random}`;
};

module.exports = { generateRequestNumber, generateInvoiceNumber };
