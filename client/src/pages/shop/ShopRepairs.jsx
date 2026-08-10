import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ChevronRight } from 'lucide-react';
import api from '../../services/api';

export default function ShopRepairs() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRepairs() {
      try {
        const res = await api.get('/repairs');
        setRepairs(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRepairs();
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="dashboard-page animate-fadeIn">
      <div className="margin-bottom-24">
        <h2>🛠️ Active & Past Repairs</h2>
        <p className="text-gray-500">Manage status updates, mechanics, tracking, and billing</p>
      </div>

      {repairs.length === 0 ? (
        <div className="card empty-state">
          <ClipboardList size={48} className="text-gray-400 margin-auto" />
          <h3>No accepted repairs yet</h3>
          <p>Accept queries from the Incoming Queries tab to start working on jobs.</p>
        </div>
      ) : (
        <div className="repair-grid">
          {repairs.map((r) => (
            <div key={r.id} className="card repair-card">
              <div className="repair-card-header">
                <div>
                  <span className="req-num">#{r.requestNumber}</span>
                  <h3>{r.title}</h3>
                </div>
                <span className={`badge status-${r.status}`}>
                  {r.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="repair-card-body">
                <p><strong>Customer:</strong> {r.customer?.fullName} ({r.customer?.phone})</p>
                <p><strong>Vehicle:</strong> {r.vehicle?.brand} {r.vehicle?.model} ({r.vehicle?.registrationNumber})</p>
                <br />
                <Link to={`/shop/repairs/${r.id}`} className="btn btn-primary btn-sm w-full">
                  Manage Status & Tracking <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
