import { Link } from 'react-router-dom';
import {
  Wrench, MapPin, Truck, Shield, Clock, Star,
  ChevronRight, Smartphone, Zap, Users
} from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const steps = [
    {
      icon: <Smartphone size={32} />,
      title: 'Raise a Query',
      desc: 'Describe the issue, upload photos, and share your location. It takes less than 2 minutes.',
    },
    {
      icon: <Wrench size={32} />,
      title: 'Shop Picks Up',
      desc: 'Nearby verified shops accept your request and pick up the vehicle from your doorstep.',
    },
    {
      icon: <Truck size={32} />,
      title: 'Track & Receive',
      desc: 'Track repair progress in real-time. Get it delivered with an itemized bill.',
    },
  ];

  const features = [
    { icon: <MapPin size={24} />, title: 'GPS Pickup & Delivery', desc: 'We come to you. No towing hassle.' },
    { icon: <Clock size={24} />, title: 'Live Tracking', desc: 'Real-time updates from diagnosis to delivery.' },
    { icon: <Shield size={24} />, title: 'Transparent Billing', desc: 'Itemized bills with before/after photos.' },
    { icon: <Star size={24} />, title: 'Verified Shops', desc: 'Rated & reviewed by real customers.' },
    { icon: <Zap size={24} />, title: 'Emergency SOS', desc: 'One-tap breakdown help, 24/7.' },
    { icon: <Users size={24} />, title: 'Multi-Shop Bidding', desc: 'Compare quotes from nearby shops.' },
  ];

  const stats = [
    { value: '500+', label: 'Repairs Completed' },
    { value: '120+', label: 'Partner Shops' },
    { value: '15+', label: 'Cities' },
    { value: '4.8★', label: 'Average Rating' },
  ];

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content animate-slideUp">
            <div className="hero-badge">🚀 India's First Vehicle Repair Marketplace</div>
            <h1>
              Your vehicle breaks down.
              <br />
              <span className="hero-highlight">We bring it back to life</span>
              <br />
              — at your doorstep.
            </h1>
            <p className="hero-subtitle">
              Raise a repair query. Nearby shops pick up, fix, and deliver your vehicle
              with full transparency — live tracking, itemized bills, and before/after photos.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-accent btn-lg">
                Get Started Free
                <ChevronRight size={20} />
              </Link>
              <Link to="/register?role=shop_owner" className="btn btn-outline btn-lg">
                Register Your Shop
              </Link>
            </div>
          </div>
          <div className="hero-visual animate-fadeIn">
            <div className="hero-card hero-card-1">
              <div className="hero-card-icon">🛵</div>
              <div>
                <strong>Scooty Won't Start</strong>
                <p>Pickup from Koramangala, Bengaluru</p>
              </div>
              <span className="badge badge-warning">Pending</span>
            </div>
            <div className="hero-card hero-card-2">
              <div className="hero-card-icon">✅</div>
              <div>
                <strong>Engine Repaired</strong>
                <p>Ready for delivery</p>
              </div>
              <span className="badge badge-success">Ready</span>
            </div>
            <div className="hero-card hero-card-3">
              <div className="hero-card-icon">🔧</div>
              <div>
                <strong>Brake Pad Replaced</strong>
                <p>Bill: ₹1,450</p>
              </div>
              <span className="badge badge-primary">Completed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to get your vehicle repaired</p>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <div key={i} className="step-card animate-fadeIn" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="step-number">{i + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Auto-Pair?</h2>
          <p className="section-subtitle">Built for trust, transparency, and convenience</p>
          <div className="features-grid">
            {features.map((feature, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to fix your ride?</h2>
            <p>Join thousands of vehicle owners who trust Auto-Pair for hassle-free repairs.</p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Sign Up as Customer
              </Link>
              <Link to="/register?role=shop_owner" className="btn btn-accent btn-lg">
                Register Your Shop
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
