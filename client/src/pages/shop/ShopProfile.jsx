import { useState, useEffect } from 'react';
import { Store, MapPin, Clock, Phone, Save } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ShopProfile() {
  const [shopId, setShopId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: 12.9716,
    longitude: 77.5946,
    phone: '',
    openingTime: '09:00',
    closingTime: '20:00',
    workingDays: 'Mon-Sat',
    serviceRadiusKm: 10,
  });

  useEffect(() => {
    async function loadShop() {
      try {
        const res = await api.get('/auth/me');
        const userShops = res.data.data.shops || [];
        if (userShops.length > 0) {
          const s = userShops[0];
          setShopId(s.id);
          setFormData({
            shopName: s.shopName,
            description: s.description || '',
            address: s.address,
            city: s.city,
            state: s.state,
            pincode: s.pincode,
            latitude: s.latitude,
            longitude: s.longitude,
            phone: s.phone,
            openingTime: s.openingTime,
            closingTime: s.closingTime,
            workingDays: s.workingDays,
            serviceRadiusKm: s.serviceRadiusKm,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadShop();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (shopId) {
        await api.put(`/shops/${shopId}`, formData);
        toast.success('Shop profile updated!');
      } else {
        const res = await api.post('/shops', formData);
        setShopId(res.data.data.id);
        toast.success('Shop registered! Awaiting verification.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save shop info');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="dashboard-page animate-fadeIn" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <h2>🏪 Shop Profile & Location Settings</h2>
          <p className="text-gray-500">Provide complete shop information to receive repair queries from nearby customers.</p>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Royal Auto Garage & Scooter Repair"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description / Specializations</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Specialized in 2-wheelers, scooties, engine tuning, quick pickup available"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="dash-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Service Pickup Radius (km)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.serviceRadiusKm}
                  onChange={(e) => setFormData({ ...formData, serviceRadiusKm: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Shop Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Street address, landmark"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="dash-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Bengaluru"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Karnataka"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="560034"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full">
              <Save size={18} /> {shopId ? 'Update Shop Profile' : 'Register Shop'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
