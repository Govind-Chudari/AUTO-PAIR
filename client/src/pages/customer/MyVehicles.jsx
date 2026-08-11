import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Car, Trash2, Wrench } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: 'scooty',
    brand: '',
    model: '',
    registrationNumber: '',
    color: '',
    fuelType: 'petrol',
  });

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data.data);
    } catch (err) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.post('/vehicles', formData);
      toast.success('Vehicle added successfully!');
      setShowModal(false);
      setFormData({
        vehicleType: 'scooty',
        brand: '',
        model: '',
        registrationNumber: '',
        color: '',
        fuelType: 'petrol',
      });
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success('Vehicle removed.');
      fetchVehicles();
    } catch (err) {
      toast.error('Failed to remove vehicle');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="dashboard-page animate-fadeIn">
      <div className="flex-between margin-bottom-24">
        <div>
          <h2>My Vehicles</h2>
          <p className="text-gray-500">Manage your scooters, bikes, and cars</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <PlusCircle size={18} /> Add Vehicle
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🛵</div>
          <h3>No vehicles added yet</h3>
          <p>Add your vehicles to quickly select them when raising a repair query.</p>
          <br />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="dash-grid-3">
          {vehicles.map((v) => (
            <div key={v.id} className="card vehicle-card">
              <div className="v-card-header">
                <span className="v-card-icon">
                  {v.vehicleType === 'scooty' || v.vehicleType === 'bike' ? '🛵' : '🚗'}
                </span>
                <button
                  className="btn btn-ghost btn-sm text-danger"
                  onClick={() => handleDelete(v.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="v-card-body">
                <h3>{v.brand} {v.model}</h3>
                <div className="reg-badge">{v.registrationNumber}</div>
                <div className="v-details">
                  <span>Type: <strong>{v.vehicleType}</strong></span>
                  <span>Fuel: <strong>{v.fuelType || 'N/A'}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Vehicle</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select
                  className="form-select"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                >
                  <option value="scooty">Scooty / Scooter</option>
                  <option value="bike">Motorcycle / Bike</option>
                  <option value="car">Car</option>
                  <option value="auto_rickshaw">Auto Rickshaw</option>
                  <option value="truck">Truck</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Brand (e.g. Honda, TVS, Hyundai)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Honda"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Model (e.g. Activa 6G, Pulsar, i20)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Activa 6G"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Registration Number (License Plate)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="KA-01-AB-1234"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
