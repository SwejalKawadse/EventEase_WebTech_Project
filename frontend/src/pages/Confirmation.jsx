import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBookingById } from '../services/api';

function Confirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    getBookingById(id)
      .then((data) => {
        setBooking(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to retrieve booking reference.');
        setLoading(false);
      });
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="confirmation-page">
      {/* STEPPER */}
      <div className="stepper-wrapper">
        <div className="stepper">
          <div className="step-item completed">
            <div className="step-circle">✓</div>
            <div className="step-label">Select Event</div>
          </div>
          <div className="step-divider"></div>
          <div className="step-item completed">
            <div className="step-circle">✓</div>
            <div className="step-label">Choose Venue</div>
          </div>
          <div className="step-divider"></div>
          <div className="step-item completed">
            <div className="step-circle">✓</div>
            <div className="step-label">Customize</div>
          </div>
          <div className="step-divider"></div>
          <div className="step-item completed">
            <div className="step-circle">✓</div>
            <div className="step-label">Review</div>
          </div>
          <div className="step-divider"></div>
          <div className="step-item active">
            <div className="step-circle" style={{ backgroundColor: 'var(--secondary-sage)', color: 'white' }}>
              ✓
            </div>
            <div className="step-label" style={{ color: 'var(--secondary-sage)' }}>
              Confirmed
            </div>
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="container" style={{ maxWidth: '650px', textAlign: 'center' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--sage-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '44px', color: 'var(--secondary-sage)' }}
            >
              check_circle
            </span>
          </div>

          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Booking Confirmed!</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Thank you for choosing EventEase. Your reservation details are securely saved in MongoDB.
          </p>

          {loading ? (
            <div style={{ padding: '2rem' }}>
              <span className="spinner" style={{ borderColor: 'var(--primary-terracotta)', borderTopColor: 'transparent', width: '28px', height: '28px' }}></span>
              <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Retrieving confirmation ticket from database...</p>
            </div>
          ) : error || !booking ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--error-red)' }}>{error || 'Booking not found.'}</p>
              <Link to="/my-bookings" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                View All My Bookings
              </Link>
            </div>
          ) : (
            <div
              className="card text-left"
              style={{
                background: 'var(--surface-white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                padding: '2rem',
                textAlign: 'left',
                boxShadow: 'var(--shadow-modal)',
                marginBottom: '2rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Reservation Reference
                  </span>
                  <h2 style={{ fontSize: '1.75rem', color: 'var(--primary-terracotta)', margin: 0 }}>
                    {booking.bookingId || booking.id}
                  </h2>
                </div>
                <span className="badge badge-confirmed" style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>
                  {booking.status || 'Confirmed'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Primary Customer</span>
                  <strong style={{ fontSize: '1.05rem' }}>{booking.customerName}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Celebration Occasion</span>
                  <strong style={{ fontSize: '1.05rem' }}>{booking.eventType}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Venue Location</span>
                  <strong style={{ fontSize: '1.05rem' }}>{booking.venueName}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Event Date & Timings</span>
                  <strong style={{ fontSize: '1.05rem' }}>
                    {booking.eventDate} ({booking.startTime || '18:00'} - {booking.endTime || '23:00'})
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Guest Attendance</span>
                  <strong style={{ fontSize: '1.05rem' }}>{booking.guestCount} Guests</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Total Confirmed Amount</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--primary-terracotta)' }}>
                    {formatCurrency(booking.pricing ? booking.pricing.totalAmount : 0)}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--surface-beige)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div><strong>Theme:</strong> {booking.theme || 'Minimal'} • <strong>Gastronomy:</strong> {booking.food?.type || 'Vegetarian'}</div>
                <div><strong>Decor:</strong> {booking.decoration?.package || 'Basic'} • <strong>Entertainment:</strong> {booking.entertainment?.type || 'None'}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={handlePrint}>
              <span className="material-symbols-outlined">print</span>
              <span>Print E-Ticket</span>
            </button>
            <Link to="/my-bookings" className="btn btn-primary">
              <span className="material-symbols-outlined">receipt_long</span>
              <span>View My Bookings</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Confirmation;
