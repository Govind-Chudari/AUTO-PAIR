import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, MapPin, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function RaiseQuery() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.vehicleId) {
      toast.error('Please select a vehicle or add one first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/repairs', formData);
      toast.success('Query raised! Nearby shops have been notified.');
      navigate(`/my-repairs/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to raise query.');
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="dashboard-page animate-fadeIn" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <h2>Raise Vehicle Repair Query</h2>
          <p className="text-gray-500">Shops within 15 km will be notified immediately to pick up your vehicle.</p>
        </div>

        <div className="card-body">
          {vehicles.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={40} className="text-warning margin-auto" />
              <h3>No vehicle registered</h3>
              <p>You need to add at least one vehicle before raising a query.</p>
              <br />
              <button className="btn btn-primary" onClick={() => navigate('/my-vehicles')}>
                Add Vehicle Now
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Vehicle</label>
                <select
                  className="form-select"
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  required
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Issue Summary / Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Scooty not starting, Brake failure, Engine noise"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description of Problem</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe what happened, any weird sounds, or when the issue started..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Urgency Level</label>
                <select
                  className="form-select"
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                >
                  <option value="low">Low - Service can wait a day</option>
                  <option value="medium">Medium - Need repair today</option>
                  <option value="high">High - Stranded / Urgent</option>
                  <option value="emergency">🆘 Emergency Breakdown</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Pickup Address & Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter full pickup address (e.g. HSR Layout Sector 2, near BDA Complex)"
                  value={formData.pickupAddress}
                  onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-accent btn-lg w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="spinner spinner-sm" /> Submitting Query...
                  </>
                ) : (
                  <>
                    <Wrench size={20} /> Submit Query to Nearby Shops
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
