import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Inbox, Wrench, CheckCircle2, ChevronRight, Clock } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

export default function ShopDashboard() {
  const { user } = useAuthStore();
  const [shop, setShop] = useState(null);
  const [incoming, setIncoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShopData() {
      try {
        const uRes = await api.get('/auth/me');
        const userShops = uRes.data.data.shops || [];
        if (userShops.length > 0) {
          setShop(userShops[0]);
          const inRes = await api.get('/repairs/incoming');
          setIncoming(inRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchShopData();
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;

  if (!shop) {
    return (
      <div className="dashboard-page animate-fadeIn">
        <div className="card empty-state">
          <Store size={48} className="text-primary margin-auto" />
          <h3>Register Your Shop Profile</h3>
          <p>Please complete your shop information so customers near you can find and request services.</p>
          <br />
          <Link to="/shop/profile" className="btn btn-primary">
            Setup Shop Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page animate-fadeIn">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h1>{shop.shopName} Dashboard 🏪</h1>
          <p>{shop.address}, {shop.city} • Status: {shop.isVerified ? '✅ Verified' : '⏳ Pending Admin Verification'}</p>
        </div>
        <Link to="/shop/incoming" className="btn btn-accent btn-lg">
          <Inbox size={20} /> View Incoming Queries ({incoming.length})
        </Link>
      </div>

      {/* Incoming Requests Section */}
      <div className="card">
        <div className="card-header flex-between">
          <h3>⚡ Pending Queries Near Your Shop</h3>
          <Link to="/shop/incoming" className="btn btn-ghost btn-sm">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className="card-body">
          {incoming.length === 0 ? (
            <p className="text-gray-500">No new queries near your location right now.</p>
          ) : (
            <div className="repair-list">
              {incoming.map((req) => (
                <div key={req.id} className="repair-item">
                  <div>
                    <strong>{req.title}</strong>
                    <div className="text-gray-500 text-sm">
                      Vehicle: {req.vehicle?.brand} {req.vehicle?.model} • Pickup: {req.pickupAddress}
                    </div>
                  </div>
                  <Link to="/shop/incoming" className="btn btn-primary btn-sm">
                    Accept Query
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
