import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getVenues } from '../services/api';
import VenueModal from '../components/VenueModal';

function Venues() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEventType, setFilterEventType] = useState(
    searchParams.get('eventType') || 'All'
  );
  const [filterCapacity, setFilterCapacity] = useState('0');
  const [filterMaxPrice, setFilterMaxPrice] = useState('0');

  // Modal
  const [selectedVenueForModal, setSelectedVenueForModal] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Read draft venue if already selected
  const draft = JSON.parse(localStorage.getItem('eventease_booking_draft') || '{}');
  const selectedVenueId = draft.venueId;

  const loadVenues = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVenues();
      setVenues(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load venues from MongoDB.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const filteredVenues = venues.filter((v) => {
    const s = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !s ||
      v.name.toLowerCase().includes(s) ||
      v.location.toLowerCase().includes(s) ||
      v.type.toLowerCase().includes(s);

    const matchesEvent =
      filterEventType === 'All' ||
      (v.eventTypes && v.eventTypes.includes(filterEventType));

    const capacityNum = parseInt(filterCapacity, 10) || 0;
    const matchesCapacity = !capacityNum || v.capacity >= capacityNum;

    const maxPriceNum = parseInt(filterMaxPrice, 10) || 0;
    const matchesPrice = !maxPriceNum || v.startingPrice <= maxPriceNum;

    return matchesSearch && matchesEvent && matchesCapacity && matchesPrice;
  });

  const handleSelectVenue = (venue) => {
    const currentDraft = JSON.parse(localStorage.getItem('eventease_booking_draft') || '{}');
    currentDraft.venueId = venue.id || venue._id;
    currentDraft.venueName = venue.name;
    currentDraft.venueBasePrice = venue.startingPrice;
    currentDraft.venueCapacity = venue.capacity;
    if (!currentDraft.pricing) currentDraft.pricing = {};
    currentDraft.pricing.venueBase = venue.startingPrice;

    localStorage.setItem('eventease_booking_draft', JSON.stringify(currentDraft));
    navigate('/customize');
  };

  const handleOpenModal = (venue) => {
    setSelectedVenueForModal(venue);
    setModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterEventType('All');
    setFilterCapacity('0');
    setFilterMaxPrice('0');
  };

  return (
    <div className="venues-page">
      {/* STEPPER */}
      <div className="stepper-wrapper">
        <div className="stepper">
          <div className="step-item completed">
            <div className="step-circle">✓</div>
            <div className="step-label">Select Event</div>
          </div>
          <div className="step-divider"></div>
          <div className="step-item active">
            <div className="step-circle">2</div>
            <div className="step-label">Choose Venue</div>
          </div>
          <div className="step-divider"></div>
          <div className="step-item">
            <div className="step-circle">3</div>
            <div className="step-label">Customize</div>
          </div>
          <div className="step-divider"></div>
          <div className="step-item">
            <div className="step-circle">4</div>
            <div className="step-label">Review</div>
          </div>
          <div className="step-divider"></div>
          <div className="step-item">
            <div className="step-circle">5</div>
            <div className="step-label">Confirmed</div>
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: '1.5rem' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <div className="subtitle">Step 2 of 5</div>
              <h2>Select an Architectural Venue</h2>
              <p>
                Browse handpicked courtyards, luxury villas, beachfront lawns, and grand ballrooms.
                {draft.eventType && (
                  <span style={{ marginLeft: '0.5rem', fontWeight: 600, color: 'var(--primary-terracotta)' }}>
                    (Planning: {draft.eventType})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div
            className="filter-bar"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2.5rem',
              background: 'var(--surface-white)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div>
              <label className="form-label">Search Venue</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search by name, city, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Event Type</label>
              <select
                className="form-input"
                value={filterEventType}
                onChange={(e) => setFilterEventType(e.target.value)}
              >
                <option value="All">All Events</option>
                <option value="Wedding">Wedding</option>
                <option value="Birthday">Birthday</option>
                <option value="Party">Social Party</option>
                <option value="Corporate">Corporate</option>
                <option value="Graduation">Graduation</option>
              </select>
            </div>

            <div>
              <label className="form-label">Min Guest Capacity</label>
              <select
                className="form-input"
                value={filterCapacity}
                onChange={(e) => setFilterCapacity(e.target.value)}
              >
                <option value="0">Any Capacity</option>
                <option value="150">150+ Guests</option>
                <option value="250">250+ Guests</option>
                <option value="350">350+ Guests</option>
                <option value="500">500+ Guests</option>
              </select>
            </div>

            <div>
              <label className="form-label">Max Starting Price</label>
              <select
                className="form-input"
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
              >
                <option value="0">Any Price</option>
                <option value="35000">Up to ₹35,000</option>
                <option value="50000">Up to ₹50,000</option>
                <option value="75000">Up to ₹75,000</option>
                <option value="120000">Up to ₹1,20,000</option>
              </select>
            </div>
          </div>

          {/* Venues Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <span className="spinner" style={{ width: '32px', height: '32px', borderColor: 'var(--primary-terracotta)', borderTopColor: 'transparent' }}></span>
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading venues from MongoDB...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--error-red)' }}>
                error_outline
              </span>
              <h3 style={{ marginTop: '0.5rem' }}>Unable to Load Venues</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
              <button className="btn btn-primary" onClick={loadVenues}>Retry</button>
            </div>
          ) : filteredVenues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <h3>No Venues Found</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>No venues match your search filters.</p>
              <button className="btn btn-secondary" onClick={handleResetFilters}>Reset Filters</button>
            </div>
          ) : (
            <div className="grid-3">
              {filteredVenues.map((v) => {
                const isSelected = selectedVenueId === (v.id || v._id);
                return (
                  <div key={v.id || v._id} className={`venue-card ${isSelected ? 'selected' : ''}`}>
                    <div className="venue-media">
                      <img src={v.image} alt={`${v.name} - ${v.location}`} />
                      <div className="venue-rating" aria-label={`Rating ${v.rating || 4.8} stars`}>
                        <span>★</span> {v.rating || 4.8}
                      </div>
                    </div>
                    <div className="venue-body">
                      <div className="venue-location">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          location_on
                        </span>
                        <span>{v.location}</span>
                      </div>
                      <h3>{v.name}</h3>
                      <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', flex: 'none', color: 'var(--text-muted)' }}>
                        {v.type} • Up to {v.capacity} guests
                      </p>

                      <div className="venue-facilities">
                        {(v.facilities || []).slice(0, 4).map((f, i) => (
                          <span key={i} className="facility-tag">{f}</span>
                        ))}
                      </div>

                      <div className="venue-footer">
                        <div className="venue-price">
                          <span className="price-label">Starting Price</span>
                          <span className="price-value">{formatCurrency(v.startingPrice)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenModal(v)}
                            aria-label={`View details for ${v.name}`}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleSelectVenue(v)}
                            aria-label={`Select venue ${v.name}`}
                          >
                            {isSelected ? 'Selected ✓' : 'Customize Event →'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Venue Details Modal */}
      <VenueModal
        venue={selectedVenueForModal}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectVenue={handleSelectVenue}
      />
    </div>
  );
}

export default Venues;
