import React from 'react';
import { Menu, ArrowRight, Bot, PhoneCall, BarChart3, Clock } from 'lucide-react';
import './LandingPage.css';

const LandingPage = ({ onGetStarted, onLogin }) => {
  return (
    <div className="landing-container">
      {/* HEADER */}
      <header className="landing-header glass">
        <div className="logo-section">
          <div className="logo-icon pulse">
            <Bot size={26} color="white" />
          </div>
          <span className="logo-text">AutoConnect</span>
        </div>

        <nav className="nav-right">
          <button className="login-nav-link" onClick={onLogin}>Log In</button>
          <button className="get-started-nav" onClick={onGetStarted}>Get Started</button>
        </nav>
      </header>

      {/* HERO */}
      <main className="landing-main">
        <section className="hero-section">
          {/* LEFT CONTENT */}
          <div className="hero-content">
            <div className="ai-badge">
              <span className="badge-icon">⚡</span>
              <span className="badge-text">AI POWERED AUTOMATION</span>
            </div>

            <h1 className="hero-title">
              Automate customer calls <br />
              <span className="text-blue">24/7 with AI</span>
            </h1>

            <p className="hero-subtitle">
              Convert leads, follow up instantly, and grow your business
              with smart AI voice agents that never sleep.
            </p>

            <div className="hero-actions">
              <button className="get-started-btn" onClick={onGetStarted}>
                Get Started <ArrowRight size={20} />
              </button>
              <button className="secondary-btn" onClick={onLogin}>
                View Demo
              </button>
            </div>

            <div className="auth-footer">
              <span>Already have an account?</span>
              <button className="login-link" onClick={onLogin}>Log In</button>
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="hero-visual">
            <div className="glow-circle"></div>
            <div className="glow-circle secondary"></div>
            <div className="visual-grid"></div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-section">
          <div className="feature-card">
            <PhoneCall size={28} className="feature-icon" />
            <h3>Smart AI Calls</h3>
            <p>Handle inbound & outbound calls with natural AI voices.</p>
          </div>

          <div className="feature-card">
            <Clock size={28} className="feature-icon" />
            <h3>24/7 Availability</h3>
            <p>Never miss a lead, even outside working hours.</p>
          </div>

          <div className="feature-card">
            <BarChart3 size={28} className="feature-icon" />
            <h3>Real-time Analytics</h3>
            <p>Track conversions, call quality, and performance live.</p>
          </div>
        </section>
      </main>

      {/* FOOTER INDICATOR */}
      <div className="bottom-indicator"></div>
    </div>
  );
};

export default LandingPage;
