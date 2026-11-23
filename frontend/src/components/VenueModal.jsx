import React from 'react';

function VenueModal({ venue, isOpen, onClose, onSelectVenue }) {
  if (!isOpen || !venue) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>{venue.name}</h3>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <img
            src={venue.image}
            alt={venue.name}
            style={{
              width: '100%',
              height: '240px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem',
              fontSize: '0.9rem',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              location_on
            </span>
            <span>{venue.location}</span>
          </div>

          <p style={{ marginBottom: '1.25rem', lineHeight: '1.6' }}>
            {venue.description}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
              background: 'var(--surface-beige)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                Type & Architecture
              </span>
              <strong>{venue.type}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                Guest Capacity
              </span>
              <strong>Up to {venue.capacity} Guests</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                Starting Venue Price
              </span>
              <strong style={{ color: 'var(--primary-terracotta)' }}>
                {formatCurrency(venue.startingPrice)}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                Customer Rating
              </span>
              <strong>★ {venue.rating || 4.8} / 5.0</strong>
            </div>
          </div>

          <h4 style={{ marginBottom: '0.5rem' }}>Venue Facilities</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {(venue.facilities || []).map((f, idx) => (
              <span key={idx} className="facility-tag" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                {f}
              </span>
            ))}
          </div>

          <h4 style={{ marginBottom: '0.5rem' }}>Supported Celebrations</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {(venue.eventTypes || []).map((et, idx) => (
              <span key={idx} className="facility-tag" style={{ background: 'var(--sage-light)', color: 'var(--secondary-sage)', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                {et}
              </span>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Back
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onSelectVenue(venue);
              onClose();
            }}
          >
            Select & Customize Event →
          </button>
        </div>
      </div>
    </div>
  );
}

export default VenueModal;
