import React from 'react';

function BookingDetailsModal({ booking, isOpen, onClose }) {
  if (!isOpen || !booking) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const p = booking.pricing || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>
            Booking Details — <span style={{ color: 'var(--primary-terracotta)' }}>{booking.bookingId || booking.id}</span>
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem',
              background: 'var(--surface-beige)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Customer Host</span>
              <strong>{booking.customerName}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Contact Information</span>
              <strong>{booking.customerEmail}</strong>
              <div style={{ fontSize: '0.85rem' }}>+91 {booking.customerPhone}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Venue & Date</span>
              <strong>{booking.venueName}</strong>
              <div style={{ fontSize: '0.85rem' }}>{booking.eventDate} ({booking.startTime || '18:00'} - {booking.endTime || '23:00'})</div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Event & Guests</span>
              <strong>{booking.eventType} Celebration</strong>
              <div style={{ fontSize: '0.85rem' }}>{booking.guestCount} Guests</div>
            </div>
          </div>

          <h4 style={{ marginBottom: '0.5rem' }}>Customization & Packages</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Decor & Theme:</span>{' '}
              <strong>{booking.decoration?.package || 'Standard'} • {booking.theme || 'Minimal'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Catering:</span>{' '}
              <strong>{booking.food?.type || 'Vegetarian'} ({formatCurrency(booking.food?.pricePerGuest)}/guest)</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Music & Entertainment:</span>{' '}
              <strong>{booking.music?.type || 'No Music'} • {booking.entertainment?.type || 'None'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Photography:</span>{' '}
              <strong>{booking.photography?.package || 'None'}</strong>
            </div>
          </div>

          <h4 style={{ marginBottom: '0.5rem' }}>Itemized Pricing Breakdown</h4>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px dashed var(--border-color)' }}>
              <span>Venue Base Rental</span>
              <strong>{formatCurrency(p.venueBase)}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px dashed var(--border-color)' }}>
              <span>Decoration Setup</span>
              <strong>{formatCurrency(p.decoration)}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px dashed var(--border-color)' }}>
              <span>Food & Catering Services</span>
              <strong>{formatCurrency(p.food)}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px dashed var(--border-color)' }}>
              <span>Music & Entertainment</span>
              <strong>{formatCurrency((p.music || 0) + (p.entertainment || 0))}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px dashed var(--border-color)' }}>
              <span>Photography & Additional Amenities</span>
              <strong>{formatCurrency((p.photography || 0) + (p.additionalServices || 0))}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontSize: '1.15rem', color: 'var(--primary-terracotta)', borderTop: '2px solid var(--border-color)' }}>
              <strong>Grand Total Amount</strong>
              <strong>{formatCurrency(p.totalAmount)}</strong>
            </li>
          </ul>

          {booking.specialRequirements && (
            <div style={{ background: '#FFFBF9', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--primary-terracotta)' }}>Special Instructions:</strong>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
                "{booking.specialRequirements}"
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingDetailsModal;
