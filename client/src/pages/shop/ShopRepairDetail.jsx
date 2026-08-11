import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Plus, CheckCircle2, FileText } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ChatWindow from '../../components/chat/ChatWindow';
import CreateInvoiceModal from '../../components/invoice/CreateInvoiceModal';
import InvoiceView from '../../components/invoice/InvoiceView';
import '../../components/invoice/Invoice.css';

export default function ShopRepairDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status update form
  const [status, setStatus] = useState('diagnosing');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/repairs/${id}`);
      setRepair(res.data.data);
      if (res.data.data) {
        setStatus(res.data.data.status);
      }
    } catch (err) {
      toast.error('Failed to load repair details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!title || isSubmitting) {
      if (!title) toast.error('Please enter a status update title.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/tracking/${id}`, {
        status,
        title,
        description,
      });
      toast.success('Tracking status updated!');
      setTitle('');
      setDescription('');
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update tracking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;
  if (!repair) return <div className="loading-page">Repair query not found.</div>;

  return (
    <div className="dashboard-page animate-fadeIn">
      <button className="btn btn-ghost btn-sm margin-bottom-16" onClick={() => navigate('/shop/repairs')}>
        <ArrowLeft size={16} /> Back to Active Repairs
      </button>

      <div className="repair-header-card card margin-bottom-24">
        <div className="card-body flex-between">
          <div>
            <span className="req-num">Request #{repair.requestNumber}</span>
            <h2>{repair.title}</h2>
            <p className="text-gray-500">
              Customer: <strong>{repair.customer?.fullName}</strong> ({repair.customer?.phone}) • Pickup: {repair.pickupAddress}
            </p>
          </div>
          <div>
            <span className={`badge status-${repair.status} badge-lg`}>
              {repair.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="dash-two-col">
        {/* Post Status Update Form */}
        <div className="card">
          <div className="card-header">
            <h3>⚡ Post Live Tracking Update</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdateStatus}>
              <div className="form-group">
                <label className="form-label">Select Repair Stage / Status</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="pickup_assigned">Pickup Assigned</option>
                  <option value="picked_up">Vehicle Picked Up</option>
                  <option value="diagnosing">Diagnosing Issue</option>
                  <option value="repair_in_progress">Repair in Progress</option>
                  <option value="testing">Testing / Inspection</option>
                  <option value="ready_for_delivery">Ready for Delivery</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered to Customer</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Update Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Engine Disassembled & Diagnosed"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Update Description (Visible to Customer)</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. Cleaned spark plug and replaced air filter. Testing compression now."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="spinner spinner-sm" /> Posting Update...
                  </>
                ) : (
                  <>
                    <Plus size={18} /> Push Status Update to Customer Timeline
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Existing Tracking Timeline */}
        <div className="card">
          <div className="card-header">
            <h3>📍 Current Timeline</h3>
          </div>
          <div className="card-body">
            <div className="timeline">
              {repair.tracking.map((step) => (
                <div key={step.id} className="timeline-item">
                  <div className="timeline-node">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">{step.title}</div>
                    <div className="timeline-desc">{step.description}</div>
                    <div className="timeline-time">{new Date(step.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="margin-top-20">
            <ChatWindow requestId={repair.id} />
          </div>

          <div className="margin-top-20">
            {repair.invoice ? (
              <InvoiceView invoice={repair.invoice} isShopOwner={true} onPaymentConfirmed={fetchDetails} />
            ) : (
              <button className="btn btn-accent btn-lg w-full" onClick={() => setShowInvoiceModal(true)}>
                <FileText size={18} /> Create & Send Itemized Bill
              </button>
            )}
          </div>

          {showInvoiceModal && (
            <CreateInvoiceModal
              requestId={repair.id}
              onClose={() => setShowInvoiceModal(false)}
              onSuccess={fetchDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
}
