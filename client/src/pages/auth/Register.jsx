import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Phone, Wrench, UserPlus, Store } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'shop_owner' ? 'shop_owner' : 'customer';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: defaultRole,
  });

  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register(formData);
    if (res.success) {
      toast.success('Account created successfully!');
      if (res.user.role === 'shop_owner') {
        navigate('/shop/profile');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fadeIn">
        <div className="auth-header">
          <div className="logo-icon margin-auto">
            <Wrench size={24} />
          </div>
          <h2>Create Account</h2>
          <p>Join Auto-Pair to repair or service your vehicles</p>
        </div>

        {/* Role Switcher */}
        <div className="role-switcher">
          <button
            type="button"
            className={`role-btn ${formData.role === 'customer' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, role: 'customer' })}
          >
            <User size={18} />
            Customer
          </button>
          <button
            type="button"
            className={`role-btn ${formData.role === 'shop_owner' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, role: 'shop_owner' })}
          >
            <Store size={18} />
            Shop Owner
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-icon-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                name="fullName"
                className="form-input with-icon"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                name="email"
                className="form-input with-icon"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-icon-wrapper">
              <Phone className="input-icon" size={18} />
              <input
                type="tel"
                name="phone"
                className="form-input with-icon"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                name="password"
                className="form-input with-icon"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading}>
            {isLoading ? <div className="spinner" /> : <><UserPlus size={18} /> Register</>}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link font-semibold">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
