import { useState } from 'react';
import { Plus, Trash2, FileText, CheckCircle2, DollarSign } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CreateInvoiceModal({ requestId, onClose, onSuccess }) {
  const [items, setItems] = useState([
    { itemType: 'service', description: 'General Service & Pickup', quantity: 1, unitPrice: 350, warrantyDays: 0 },
  ]);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { itemType: 'part', description: '', quantity: 1, unitPrice: 0, warrantyDays: 30 },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 1)), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + parseFloat(taxAmount || 0) - parseFloat(discountAmount || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.some((i) => !i.description.trim() || i.unitPrice <= 0)) {
      toast.error('Please enter valid description and price for all items.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/invoices', {
        requestId,
        items,
        taxAmount,
        discountAmount,
        notes,
      });
      toast.success('Invoice created & sent to customer!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate invoice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card animate-slideUp" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex-between margin-bottom-16">
          <h3>🧾 Generate Itemized Invoice</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-12">
            <label className="form-label">Line Items (Parts, Labour, Pickup)</label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-8 align-center margin-bottom-8">
                <select
                  className="form-select"
                  style={{ width: '130px' }}
                  value={item.itemType}
                  onChange={(e) => updateItem(idx, 'itemType', e.target.value)}
                >
                  <option value="part">Spare Part</option>
                  <option value="labour">Labour Charge</option>
                  <option value="service">Service Fee</option>
                  <option value="pickup_delivery">Pickup/Delivery</option>
                </select>

                <input
                  type="text"
                  className="form-input"
                  placeholder="Item description (e.g. Front Brake Pad)"
                  value={item.description}
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  required
                />

                <input
                  type="number"
                  className="form-input"
                  style={{ width: '70px' }}
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value))}
                  min="1"
                  required
                />

                <input
                  type="number"
                  className="form-input"
                  style={{ width: '100px' }}
                  placeholder="Price (₹)"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value))}
                  min="0"
                  required
                />

                <button
                  type="button"
                  className="btn btn-ghost btn-sm text-danger"
                  onClick={() => removeItem(idx)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button type="button" className="btn btn-ghost btn-sm text-primary" onClick={addItem}>
              <Plus size={16} /> Add Line Item
            </button>
          </div>

          <hr className="margin-top-16 margin-bottom-16" />

          <div className="dash-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">GST / Tax Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                value={taxAmount}
                onChange={(e) => setTaxAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Discount Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="invoice-summary-box margin-top-16">
            <div className="flex-between">
              <span>Subtotal:</span>
              <strong>₹{calculateSubtotal().toFixed(2)}</strong>
            </div>
            <div className="flex-between text-lg margin-top-4">
              <strong>Total Billed Amount:</strong>
              <strong className="text-primary">₹{calculateTotal().toFixed(2)}</strong>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : <><FileText size={18} /> Send Bill to Customer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
