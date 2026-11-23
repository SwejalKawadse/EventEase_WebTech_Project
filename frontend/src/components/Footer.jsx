import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>&copy; 2026 EventEase — Event Planning & Management Platform (MERN Stack Edition)</p>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link to="/events">Explore Events</Link>
          <Link to="/venues">Venues</Link>
          <Link to="/my-bookings">My Bookings</Link>
          <Link to="/admin" style={{ fontWeight: 600, color: 'var(--primary-terracotta)' }}>
            Admin Console
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
