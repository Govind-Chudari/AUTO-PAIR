import { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, DollarSign, QrCode } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function InvoiceView({ invoice, isShopOwner, onPaymentConfirmed }) {
  const [loading, setLoading] = useState(false);

  const handleConfirmCash = async () => {
    if (!confirm('Confirm that cash payment has been collected from customer?')) return;
    setLoading(true);
    try {
      await api.post(`/invoices/${invoice.id}/confirm-cash`);
      toast.success('Cash payment recorded as PAID!');
      if (onPaymentConfirmed) onPaymentConfirmed();
    } catch (err) {
      toast.error('Failed to update payment status.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePay = () => {
    // Simulated UPI / Card Payment gateway trigger
    toast.loading('Opening UPI / Payment Gateway...');
    setTimeout(async () => {
      try {
        await api.post(`/invoices/${invoice.id}/confirm-cash`); // Demo payment completion
        toast.dismiss();
        toast.success('Payment successful via UPI/Card!');
        if (onPaymentConfirmed) onPaymentConfirmed();
      } catch {
        toast.dismiss();
        toast.error('Payment processing failed.');
      }
    }, 1500);
  };

  if (!invoice) return null;

  return (
    <div className="card invoice-card">
      <div className="card-header flex-between">
        <div>
          <h3>🧾 Invoice #{invoice.invoiceNumber}</h3>
          <span className="text-sm text-gray-500">Issued on {new Date(invoice.createdAt).toLocaleDateString()}</span>
        </div>
        <span className={`badge ${invoice.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'} badge-lg`}>
          {invoice.paymentStatus.toUpperCase()}
        </span>
      </div>

      <div className="card-body">
        {/* Line Items Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.description}</strong>
                  {item.warrantyDays > 0 && <span className="warranty-tag">{item.warrantyDays} days warranty</span>}
                </td>
                <td className="text-capitalize">{item.itemType}</td>
                <td>{item.quantity}</td>
                <td>₹{parseFloat(item.unitPrice).toFixed(2)}</td>
                <td className="text-right">₹{parseFloat(item.totalPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Breakdown Box */}
        <div className="invoice-breakdown margin-top-20">
          <div className="flex-between">
            <span>Subtotal:</span>
            <span>₹{parseFloat(invoice.subtotal).toFixed(2)}</span>
          </div>
          {parseFloat(invoice.taxAmount) > 0 && (
            <div className="flex-between">
              <span>GST / Tax:</span>
              <span>+ ₹{parseFloat(invoice.taxAmount).toFixed(2)}</span>
            </div>
          )}
          {parseFloat(invoice.discountAmount) > 0 && (
            <div className="flex-between text-success">
              <span>Discount:</span>
              <span>- ₹{parseFloat(invoice.discountAmount).toFixed(2)}</span>
            </div>
          )}
          <hr />
          <div className="flex-between text-lg">
            <strong>Grand Total Billed:</strong>
            <strong className="text-primary font-bold">₹{parseFloat(invoice.totalAmount).toFixed(2)}</strong>
          </div>
        </div>

        {/* Payment Actions */}
        {invoice.paymentStatus !== 'paid' && (
          <div className="payment-actions-box margin-top-24">
            <h4>Payment Options</h4>
            {isShopOwner ? (
              <button className="btn btn-success btn-lg w-full" onClick={handleConfirmCash} disabled={loading}>
                <CheckCircle2 size={18} /> Mark Cash / Offline Payment Collected
              </button>
            ) : (
              <div className="dash-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button className="btn btn-primary btn-lg" onClick={handleOnlinePay}>
                  <QrCode size={18} /> Pay via UPI / GPay / Card
                </button>
                <button className="btn btn-outline btn-lg" onClick={handleOnlinePay}>
                  <DollarSign size={18} /> Pay Cash on Delivery
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
