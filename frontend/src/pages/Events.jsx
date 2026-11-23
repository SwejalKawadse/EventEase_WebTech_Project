import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getEvents, createEvent, updateEvent, deleteEvent, getVenues } from '../services/api';
import EventModal from '../components/EventModal';
import Toast from '../components/Toast';

const EVENT_TYPES = [
  {
    type: 'Birthday',
    title: 'Birthday Celebration',
    desc: 'Milestone birthdays, themed kids parties, and intimate candlelit dinners with custom decor.',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
  },
  {
    type: 'Wedding',
    title: 'Wedding & Reception',
    desc: 'Bespoke floral mandaps, grand ballrooms, luxury catering, and unforgettable moments.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80',
  },
  {
    type: 'Party',
    title: 'Social Party & Gala',
    desc: 'Cocktail nights, anniversary galas, DJ sets, and rooftop lounge gatherings.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
  },
  {
    type: 'Graduation',
    title: 'Graduation & Convocation',
    desc: 'Celebrate academic milestones with friends, family, and memorable evening banquets.',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80',
  },
  {
    type: 'Corporate',
    title: 'Corporate & Executive',
    desc: 'Conferences, hackathons, product launches, annual banquets, and executive retreats.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
  },
  {
    type: 'Other',
    title: 'Custom Celebration',
    desc: 'Have a unique vision? Tailor every aspect of decor, menu, and entertainment.',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80',
  },
];

function Events() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Selection state for multi-step planning
  const [selectedEventType, setSelectedEventType] = useState(
    searchParams.get('select') || 'Wedding'
  );

  // MongoDB Events state (CRUD)
  const [events, setEvents] = useState([]);
  const [venuesList, setVenuesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Modal & Toast states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Load events from MongoDB
  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvents({
        search: searchTerm,
        category: categoryFilter,
        date: dateFilter,
      });
      setEvents(data || []);
    } catch (err) {
      setError(err.message || 'Unable to fetch events from database.');
    } finally {
      setLoading(false);
    }
  };

  // Load venues for dropdown autocomplete
  useEffect(() => {
    getVenues()
      .then((data) => setVenuesList(data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadEvents();
  }, [categoryFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadEvents();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setDateFilter('');
    setTimeout(loadEvents, 0);
  };

  // Step 1 Proceed Handler
  const handleProceedToVenues = () => {
    if (!selectedEventType) {
      setToast({ message: 'Please select an event type to proceed.', type: 'error' });
      return;
    }
    // Save draft in localStorage for multi-step booking continuity
    const draft = JSON.parse(localStorage.getItem('eventease_booking_draft') || '{}');
    draft.eventType = selectedEventType;
    localStorage.setItem('eventease_booking_draft', JSON.stringify(draft));

    navigate(`/venues?eventType=${encodeURIComponent(selectedEventType)}`);
  };

  // CRUD: Open Add Modal
  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  // CRUD: Open Edit Modal
  const handleOpenEditModal = (event) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  // CRUD: Save (Create or Update)
  const handleSaveEvent = async (formData, id) => {
    try {
      if (id) {
        await updateEvent(id, formData);
        setToast({ message: 'Event updated successfully in MongoDB!', type: 'success' });
      } else {
        await createEvent(formData);
        setToast({ message: 'New event created successfully in MongoDB!', type: 'success' });
      }
      loadEvents();
    } catch (err) {
      throw err;
    }
  };

  // CRUD: Delete
  const handleDeleteEvent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteEvent(id);
      setToast({ message: 'Event deleted successfully from MongoDB.', type: 'success' });
      setEvents((prev) => prev.filter((ev) => ev._id !== id));
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete event.', type: 'error' });
    }
  };

  return (
    <div className="events-page">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* STEPPER BAR (Presentation & Flow) */}
      <div className="stepper-wrapper">
        <div className="stepper">
          <div className="step-item active">
            <div className="step-circle">1</div>
            <div className="step-label">Select Event</div>
          </div>
          <div className="step-divider"></div>
          <div className="step-item">
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

      {/* STEP 1: EVENT SELECTION SECTION */}
      <section className="section" style={{ paddingTop: '1.5rem', paddingBottom: '2.5rem' }}>
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
              <div className="subtitle">Step 1 of 5</div>
              <h2>Select an Event Type</h2>
              <p>Choose the kind of celebration you want to plan, or browse all scheduled community events below.</p>
            </div>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleProceedToVenues}
              disabled={!selectedEventType}
            >
              <span>Continue with {selectedEventType} →</span>
            </button>
          </div>

          <div className="grid-3" role="radiogroup" aria-label="Event Types">
            {EVENT_TYPES.map((item) => {
              const isSelected = selectedEventType === item.type;
              return (
                <div
                  key={item.type}
                  className={`event-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedEventType(item.type)}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex="0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedEventType(item.type);
                    }
                  }}
                  style={{
                    cursor: 'pointer',
                    border: isSelected ? '2px solid var(--primary-terracotta)' : '1px solid var(--border-color)',
                    boxShadow: isSelected ? '0 0 0 3px rgba(201, 111, 91, 0.2)' : 'var(--shadow-card)',
                  }}
                >
                  <div className="event-card-media">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="event-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>{item.title}</h3>
                      {isSelected && (
                        <span
                          className="material-symbols-outlined"
                          style={{ color: 'var(--primary-terracotta)', fontSize: '24px' }}
                        >
                          check_circle
                        </span>
                      )}
                    </div>
                    <p>{item.desc}</p>
                    <div className="event-card-footer">
                      <span style={{ fontWeight: 600, color: isSelected ? 'var(--primary-terracotta)' : 'var(--text-charcoal)' }}>
                        {isSelected ? 'Selected ✓' : 'Click to Select'}
                      </span>
                      <span className="material-symbols-outlined">
                        {isSelected ? 'arrow_forward' : 'radio_button_unchecked'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CRUD SECTION: ALL SCHEDULED EVENTS FROM MONGODB */}
      <section className="section" style={{ backgroundColor: 'var(--surface-beige)', padding: '3rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <div className="subtitle">Database Explorer (CRUD)</div>
              <h2>Scheduled Events & Activities</h2>
              <p>All records below are fetched in real-time from MongoDB with venue conflict validation.</p>
            </div>
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              <span className="material-symbols-outlined">add_circle</span>
              <span>+ Add New Event</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div
            className="filter-bar"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
              marginBottom: '2rem',
              background: 'var(--surface-white)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', gridColumn: 'span 2' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search events by name, organizer, venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary">
                Search
              </button>
            </form>

            <div>
              <select
                className="form-input"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Corporate">Corporate / Tech</option>
                <option value="Wedding">Wedding</option>
                <option value="Birthday">Birthday</option>
                <option value="Party">Party / Social</option>
                <option value="Cultural">Cultural</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <input
                type="date"
                className="form-input"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                title="Filter by event date"
              />
            </div>

            <div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%' }}
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Event Cards Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <span className="spinner" style={{ width: '32px', height: '32px', borderColor: 'var(--primary-terracotta)', borderTopColor: 'transparent' }}></span>
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading events from MongoDB...</p>
            </div>
          ) : error ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'var(--surface-white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--error-red)' }}>
                error_outline
              </span>
              <h3 style={{ marginTop: '0.5rem' }}>Unable to Load Events</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
              <button className="btn btn-primary" onClick={loadEvents}>
                Retry
              </button>
            </div>
          ) : events.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'var(--surface-white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-muted)' }}>
                event_busy
              </span>
              <h3 style={{ marginTop: '0.5rem' }}>No Events Found</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                No events match your current search/filter criteria.
              </p>
              <button className="btn btn-primary" onClick={handleOpenAddModal}>
                + Create the First Event
              </button>
            </div>
          ) : (
            <div className="grid-3">
              {events.map((ev) => {
                const statusBadge =
                  ev.status === 'Confirmed'
                    ? 'badge-confirmed'
                    : ev.status === 'Completed'
                    ? 'badge-completed'
                    : ev.status === 'Cancelled'
                    ? 'badge-cancelled'
                    : 'badge-upcoming';

                return (
                  <div
                    key={ev._id}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: 'var(--surface-white)',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <span className="badge" style={{ background: 'var(--surface-beige)', color: 'var(--text-charcoal)' }}>
                          {ev.category}
                        </span>
                        <span className={`badge ${statusBadge}`}>{ev.status || 'Upcoming'}</span>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                        {ev.eventName || ev.name}
                      </h3>

                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.5' }}>
                        {ev.description}
                      </p>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr',
                          gap: '0.4rem',
                          fontSize: '0.85rem',
                          background: 'var(--surface-beige)',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          marginBottom: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary-terracotta)' }}>
                            location_on
                          </span>
                          <strong>{ev.venue || ev.location}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--secondary-sage)' }}>
                            calendar_today
                          </span>
                          <span>
                            {ev.eventDate || (ev.date ? ev.date.toString().slice(0, 10) : 'TBD')} ({ev.startTime || '10:00'} - {ev.endTime || '18:00'})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
                            person
                          </span>
                          <span>
                            Host: {ev.organizerName || 'Organizer'} • {ev.guestCount || 100} Guests
                          </span>
                        </div>
                        {ev.phoneNumber && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
                              phone
                            </span>
                            <span>+91 {ev.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '0.75rem',
                      }}
                    >
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEditModal(ev)}
                        title="Edit event details"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteEvent(ev._id, ev.eventName || ev.name)}
                        title="Delete event from MongoDB"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Add / Edit Event Modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEvent}
        eventToEdit={editingEvent}
        venueOptions={venuesList}
      />
    </div>
  );
}

export default Events;
