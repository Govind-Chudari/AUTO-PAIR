import { useState, useEffect } from 'react';
import { Inbox, CheckCircle2, MapPin, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function IncomingQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState(null);

  const fetchQueries = async () => {
    try {
      const uRes = await api.get('/auth/me');
      const shops = uRes.data.data.shops || [];
      if (shops.length > 0) {
        setShopId(shops[0].id);
      }
      const res = await api.get('/repairs/incoming');
      setQueries(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load incoming queries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleAccept = async (requestId) => {
    if (!shopId) return;
    try {
      await api.post(`/repairs/${requestId}/accept`, {
        shopId,
        estimatedCost: 500,
        estimatedDurationHours: 3,
        shopNotes: 'We will pick up your vehicle shortly.',
      });
      toast.success('Query accepted! You can now update tracking & status.');
      fetchQueries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept query');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="dashboard-page animate-fadeIn">
      <div className="margin-bottom-24">
        <h2>⚡ Incoming Repair Queries</h2>
        <p className="text-gray-500">Customer requests raised near your shop location. First to accept gets the job!</p>
      </div>

      {queries.length === 0 ? (
        <div className="card empty-state">
          <Inbox size={48} className="text-gray-400 margin-auto" />
          <h3>No pending queries nearby</h3>
          <p>When customers raise breakdown or service queries near your shop, they will appear here in real-time.</p>
        </div>
      ) : (
        <div className="dash-grid" style={{ gridTemplateColumns: '1fr' }}>
          {queries.map((q) => (
            <div key={q.id} className="card" style={{ padding: '24px' }}>
              <div className="flex-between margin-bottom-12">
                <div>
                  <span className="req-num">#{q.requestNumber}</span>
                  <h3>{q.title}</h3>
                </div>
                <span className={`badge status-${q.urgency}`}>Urgency: {q.urgency}</span>
              </div>
              <p className="text-gray-600 margin-bottom-12">{q.description}</p>
              <div className="dash-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div><strong>Vehicle:</strong> {q.vehicle?.brand} {q.vehicle?.model} ({q.vehicle?.registrationNumber})</div>
                <div><strong>Customer:</strong> {q.customer?.fullName} ({q.customer?.phone})</div>
                <div style={{ gridColumn: '1 / -1' }}><strong>Pickup Location:</strong> <MapPin size={14} /> {q.pickupAddress}</div>
              </div>
              <br />
              <button className="btn btn-accent btn-lg w-full" onClick={() => handleAccept(q.id)}>
                <CheckCircle2 size={20} /> Accept Query & Pickup Vehicle
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
