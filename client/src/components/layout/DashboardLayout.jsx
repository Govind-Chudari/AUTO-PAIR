import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Wrench, LayoutDashboard, Car, PlusCircle, ClipboardList,
  Store, Users, Settings, LogOut, Bell, Menu, X, Inbox
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const customerLinks = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/my-vehicles', icon: <Car size={20} />, label: 'My Vehicles' },
    { to: '/raise-query', icon: <PlusCircle size={20} />, label: 'Raise Query' },
    { to: '/my-repairs', icon: <ClipboardList size={20} />, label: 'My Repairs' },
  ];

  const shopLinks = [
    { to: '/shop/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/shop/incoming', icon: <Inbox size={20} />, label: 'Incoming Queries' },
    { to: '/shop/repairs', icon: <ClipboardList size={20} />, label: 'Active Repairs' },
    { to: '/shop/profile', icon: <Store size={20} />, label: 'Shop Profile' },
  ];

  const links = user?.role === 'shop_owner' ? shopLinks : customerLinks;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="nav-logo">
            <div className="logo-icon">
              <Wrench size={20} />
            </div>
            <span className="logo-text">Auto-Pair</span>
          </Link>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-header">
          <div className="flex-between" style={{ width: '100%' }}>
            <div className="flex" style={{ alignItems: 'center', gap: '12px' }}>
              <button
                className="btn btn-icon btn-ghost mobile-menu-btn"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={22} />
              </button>
              <h2 className="page-title">
                {user?.role === 'shop_owner' ? 'Shop Panel' : 'Customer Panel'}
              </h2>
            </div>

            <div className="header-right">
              <button className="btn btn-icon btn-ghost notification-btn">
                <Bell size={20} />
                <span className="notification-dot"></span>
              </button>
              <div className="header-user">
                <div className="avatar avatar-sm">
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="user-name">{user?.fullName || 'User'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
