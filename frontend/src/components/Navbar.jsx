import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo" onClick={closeMobileMenu}>
            <div className="logo-icon">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <span>EventEase</span>
          </Link>

          <nav className="nav-menu">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/events"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Events
            </NavLink>
            <NavLink
              to="/venues"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Venues
            </NavLink>
            <NavLink
              to="/my-bookings"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              My Bookings
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Admin Console
            </NavLink>
          </nav>

          <div className="nav-cta" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/events" className="btn btn-primary">
              Plan an Event
            </Link>
            <button
              className="mobile-toggle"
              aria-label="Toggle navigation menu"
              onClick={toggleMobileMenu}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--text-charcoal)'
              }}
            >
              <span className="material-symbols-outlined">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="mobile-nav-overlay open"
            onClick={closeMobileMenu}
          ></div>
          <div className="mobile-nav-menu open">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '1rem',
                marginBottom: '1rem'
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                  fontSize: '1.2rem',
                }}
              >
                EventEase Navigation
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={closeMobileMenu}
              >
                ✕
              </button>
            </div>
            <NavLink to="/" end className="nav-link" onClick={closeMobileMenu}>
              Home
            </NavLink>
            <NavLink to="/events" className="nav-link" onClick={closeMobileMenu}>
              Events
            </NavLink>
            <NavLink to="/venues" className="nav-link" onClick={closeMobileMenu}>
              Venues
            </NavLink>
            <NavLink to="/my-bookings" className="nav-link" onClick={closeMobileMenu}>
              My Bookings
            </NavLink>
            <NavLink to="/admin" className="nav-link" onClick={closeMobileMenu}>
              Admin Console
            </NavLink>
            <div style={{ marginTop: '1.5rem' }}>
              <Link
                to="/events"
                className="btn btn-primary"
                style={{ width: '100%', textAlign: 'center' }}
                onClick={closeMobileMenu}
              >
                Plan an Event
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;
