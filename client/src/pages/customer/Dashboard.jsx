import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Car, Clock, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import './Customer.css';

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [vRes, rRes] = await Promise.all([
          api.get('/vehicles'),
          api.get('/repairs?limit=5'),
        ]);
        setVehicles(vRes.data.data);
        setRepairs(rRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page animate-fadeIn">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h1>Welcome back, {user?.fullName?.split(' ')[0]}! 👋</h1>
          <p>Need vehicle pickup or repair today? Raise a query in minutes.</p>
        </div>
        <Link to="/raise-query" className="btn btn-accent btn-lg">
          <PlusCircle size={20} />
          Raise Repair Query
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="dash-grid">
        <div className="card dash-stat-card">
          <div className="dash-stat-icon icon-blue"><Car size={24} /></div>
          <div>
            <span className="dash-stat-num">{vehicles.length}</span>
            <span className="dash-stat-label">Saved Vehicles</span>
          </div>
        </div>

        <div className="card dash-stat-card">
          <div className="dash-stat-icon icon-orange"><Clock size={24} /></div>
          <div>
            <span className="dash-stat-num">
              {repairs.filter(r => !['completed', 'cancelled', 'rejected'].includes(r.status)).length}
            </span>
            <span className="dash-stat-label">Active Repairs</span>
          </div>
        </div>

        <div className="card dash-stat-card">
          <div className="dash-stat-icon icon-green"><CheckCircle2 size={24} /></div>
          <div>
            <span className="dash-stat-num">
              {repairs.filter(r => r.status === 'completed').length}
            </span>
            <span className="dash-stat-label">Completed Repairs</span>
          </div>
        </div>
      </div>

      {/* Recent Repairs & My Vehicles */}
      <div className="dash-two-col">
        {/* Active / Recent Repairs */}
        <div className="card">
          <div className="card-header flex-between">
            <h3>Recent Repairs</h3>
            <Link to="/my-repairs" className="btn btn-ghost btn-sm">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="card-body">
            {repairs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🛵</div>
                <h3>No repair queries raised yet</h3>
                <p>Breakdown or service needed? Raise your first query now.</p>
                <br />
                <Link to="/raise-query" className="btn btn-primary btn-sm">
                  Raise Query
                </Link>
              </div>
            ) : (
              <div className="repair-list">
                {repairs.map((repair) => (
                  <Link key={repair.id} to={`/my-repairs/${repair.id}`} className="repair-item">
                    <div className="repair-item-left">
                      <div className="repair-item-title">{repair.title}</div>
                      <div className="repair-item-sub">
                        {repair.vehicle.brand} {repair.vehicle.model} • Req #{repair.requestNumber}
                      </div>
                    </div>
                    <div className="repair-item-right">
                      <span className={`badge status-${repair.status}`}>
                        {repair.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vehicles */}
        <div className="card">
          <div className="card-header flex-between">
            <h3>My Vehicles</h3>
            <Link to="/my-vehicles" className="btn btn-ghost btn-sm">
              Manage <ChevronRight size={16} />
            </Link>
          </div>
          <div className="card-body">
            {vehicles.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏎️</div>
                <h3>No vehicles added</h3>
                <p>Add your scooty, bike, or car to easily raise queries.</p>
                <br />
                <Link to="/my-vehicles" className="btn btn-outline btn-sm">
                  Add Vehicle
                </Link>
              </div>
            ) : (
              <div className="vehicle-mini-list">
                {vehicles.map((v) => (
                  <div key={v.id} className="vehicle-mini-item">
                    <div className="v-icon">
                      {v.vehicleType === 'scooty' || v.vehicleType === 'bike' ? '🛵' : '🚗'}
                    </div>
                    <div>
                      <strong>{v.brand} {v.model}</strong>
                      <p>{v.registrationNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
