import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Wrench } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      toast.success('Logged in successfully!');
      if (res.user.role === 'shop_owner') {
        navigate('/shop/dashboard');
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
          <h2>Welcome Back</h2>
          <p>Login to track your repairs or manage your shop</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="form-input with-icon"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="flex-between">
              <label className="form-label">Password</label>
              <Link to="/forgot-password" className="auth-link text-sm">
                Forgot password?
              </Link>
            </div>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                className="form-input with-icon"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading}>
            {isLoading ? <div className="spinner" /> : <><LogIn size={18} /> Login</>}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link font-semibold">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
