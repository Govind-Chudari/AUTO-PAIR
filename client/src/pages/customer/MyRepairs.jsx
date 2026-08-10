import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ChevronRight, Clock, PlusCircle } from 'lucide-react';
import api from '../../services/api';

export default function MyRepairs() {
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
      <div className="flex-between margin-bottom-24">
        <div>
          <h2>My Repair Queries</h2>
          <p className="text-gray-500">Track current and past vehicle repair jobs</p>
        </div>
        <Link to="/raise-query" className="btn btn-accent">
          <PlusCircle size={18} /> Raise New Query
        </Link>
      </div>

      {repairs.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No repairs requested yet</h3>
          <p>Raise a query whenever your scooty, bike, or car needs pickup or repair.</p>
          <br />
          <Link to="/raise-query" className="btn btn-primary">
            Raise Query
          </Link>
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
                <p className="v-info">
                  <strong>Vehicle:</strong> {r.vehicle?.brand} {r.vehicle?.model} ({r.vehicle?.registrationNumber})
                </p>
                <p className="p-info">
                  <strong>Pickup:</strong> {r.pickupAddress}
                </p>
                {r.shop && (
                  <p className="s-info">
                    <strong>Shop:</strong> {r.shop.shopName}
                  </p>
                )}
                <div className="card-footer-action">
                  <Link to={`/my-repairs/${r.id}`} className="btn btn-outline btn-sm w-full">
                    View Live Tracking Timeline <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
