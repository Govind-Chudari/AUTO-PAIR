import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Wrench, LogIn, UserPlus } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import './PublicLayout.css';

export default function PublicLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'shop_owner') return '/shop/dashboard';
    return '/dashboard';
  };

  return (
    <div className="public-layout">
      {/* Navigation */}
      <nav className="public-nav">
        <div className="container flex-between">
          <Link to="/" className="nav-logo">
            <div className="logo-icon">
              <Wrench size={22} />
            </div>
            <span className="logo-text">Auto-Pair</span>
          </Link>

          <div className="nav-links">
            {isAuthenticated ? (
              <button
                className="btn btn-primary"
                onClick={() => navigate(getDashboardLink())}
              >
                Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  <LogIn size={18} />
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  <UserPlus size={18} />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="public-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="nav-logo">
                <div className="logo-icon">
                  <Wrench size={18} />
                </div>
                <span className="logo-text">Auto-Pair</span>
              </div>
              <p>Your vehicle breaks down. We bring it back to life — at your doorstep.</p>
            </div>
            <div className="footer-links">
              <h4>Platform</h4>
              <Link to="/">How It Works</Link>
              <Link to="/">Browse Shops</Link>
              <Link to="/register">Register as Shop</Link>
            </div>
            <div className="footer-links">
              <h4>Support</h4>
              <Link to="/">Help Center</Link>
              <Link to="/">Contact Us</Link>
              <Link to="/">Terms of Service</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Auto-Pair. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
