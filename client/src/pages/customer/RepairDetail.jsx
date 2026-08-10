import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, MapPin, Wrench, CheckCircle2, ShieldCheck,
  FileText, Phone, Store, ArrowLeft
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './Customer.css';

import ChatWindow from '../../components/chat/ChatWindow';
import InvoiceView from '../../components/invoice/InvoiceView';
import '../../components/invoice/Invoice.css';

export default function RepairDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await api.get(`/repairs/${id}`);
        setRepair(res.data.data);
      } catch (err) {
        toast.error('Failed to load repair details');
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;
  if (!repair) return <div className="loading-page">Repair query not found.</div>;

  return (
    <div className="dashboard-page animate-fadeIn">
      <button className="btn btn-ghost btn-sm margin-bottom-16" onClick={() => navigate('/my-repairs')}>
        <ArrowLeft size={16} /> Back to My Repairs
      </button>

      <div className="repair-header-card card">
        <div className="card-body flex-between">
          <div>
            <span className="req-num">Request #{repair.requestNumber}</span>
            <h2>{repair.title}</h2>
            <p className="text-gray-500">
              Vehicle: <strong>{repair.vehicle?.brand} {repair.vehicle?.model}</strong> ({repair.vehicle?.registrationNumber})
            </p>
          </div>
          <div className="text-right">
            <span className={`badge status-${repair.status} badge-lg`}>
              {repair.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="dash-two-col margin-top-24">
        {/* Tracking Timeline (The Highlight) */}
        <div className="card">
          <div className="card-header">
            <h3>📍 Live Repair & Tracking Timeline</h3>
          </div>
          <div className="card-body">
            {repair.tracking.length === 0 ? (
              <p className="text-gray-500">No updates yet.</p>
            ) : (
              <div className="timeline">
                {repair.tracking.map((step, idx) => (
                  <div key={step.id} className="timeline-item">
                    <div className="timeline-node">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">{step.title}</div>
                      <div className="timeline-desc">{step.description}</div>
                      <div className="timeline-time">
                        {new Date(step.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details & Shop Info */}
        <div className="details-col">
          {repair.shop && (
            <div className="card margin-bottom-20">
              <div className="card-header">
                <h3>🏪 Assigned Shop</h3>
              </div>
              <div className="card-body">
                <h4>{repair.shop.shopName}</h4>
                <p className="text-gray-500"><MapPin size={14} /> {repair.shop.address}</p>
                <br />
                <a href={`tel:${repair.shop.phone}`} className="btn btn-outline btn-sm w-full">
                  <Phone size={14} /> Call Shop ({repair.shop.phone})
                </a>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h3>📋 Query Details</h3>
            </div>
            <div className="card-body space-y-12">
              <div>
                <strong>Description:</strong>
                <p className="text-gray-600">{repair.description}</p>
              </div>
              <div>
                <strong>Pickup Location:</strong>
                <p className="text-gray-600">{repair.pickupAddress}</p>
              </div>
              <div>
                <strong>Urgency:</strong>
                <p className="text-gray-600 uppercase">{repair.urgency}</p>
              </div>
              {repair.finalCost && (
                <div className="final-bill-box">
                  <span>Total Amount Billed:</span>
                  <span className="price">₹{repair.finalCost}</span>
                </div>
              )}
            </div>
          </div>

          {repair.invoice && (
            <div className="margin-top-20">
              <InvoiceView invoice={repair.invoice} isShopOwner={false} onPaymentConfirmed={fetchDetails} />
            </div>
          )}

          <div className="margin-top-20">
            <ChatWindow requestId={repair.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
