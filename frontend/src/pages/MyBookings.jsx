import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBookings, deleteBooking } from '../services/api';
import BookingDetailsModal from '../components/BookingDetailsModal';
import Toast from '../components/Toast';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedBookingForModal, setSelectedBookingForModal] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBookings();
      setBookings(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load bookings from MongoDB.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (b.bookingId || b.id || '').toLowerCase().includes(q) ||
      (b.customerEmail || '').toLowerCase().includes(q) ||
      (b.customerPhone || '').includes(q) ||
      (b.customerName || '').toLowerCase().includes(q) ||
      (b.venueName || '').toLowerCase().includes(q)
    );
  });

  const handleOpenDetails = (booking) => {
    setSelectedBookingForModal(booking);
    setModalOpen(true);
  };

  const handleCancelBooking = async (id, ref) => {
    if (!window.confirm(`Are you sure you want to cancel booking reference "${ref}"?`)) {
      return;
    }

    try {
      await deleteBooking(id);
      setToast({ message: `Booking ${ref} was cancelled successfully.`, type: 'success' });
      setBookings((prev) => prev.filter((b) => (b.bookingId || b.id || b._id) !== id));
    } catch (err) {
      setToast({ message: err.message || 'Failed to cancel booking.', type: 'error' });
    }
  };

  return (
    <div className="my-bookings-page">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      <section className="section">
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
              <div className="subtitle">Client Dashboard</div>
              <h2>My Bookings & Reservations</h2>
              <p>Search, review itemized receipts, and manage your booked celebrations stored in MongoDB.</p>
            </div>
            <Link to="/events" className="btn btn-primary">
              <span>+ Plan New Event</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div
            style={{
              background: 'var(--surface-white)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '2rem',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Search by reference ID (EV-XXXXX), email, phone, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="btn btn-secondary" onClick={() => setSearchQuery('')}>
                Clear
              </button>
            )}
          </div>

          {/* Bookings List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3.5rem' }}>
              <span className="spinner" style={{ borderColor: 'var(--primary-terracotta)', borderTopColor: 'transparent', width: '32px', height: '32px' }}></span>
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading your reservations from MongoDB...</p>
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
              <h3>Unable to Load Bookings</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
              <button className="btn btn-primary" onClick={loadBookings}>
                Retry
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3.5rem 1.5rem',
                background: 'var(--surface-white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}
              >
                event_busy
              </span>
              <h3 style={{ marginBottom: '0.5rem' }}>No bookings found.</h3>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                {searchQuery ? 'No reservations match your search query.' : 'Start planning your next celebration with EventEase.'}
              </p>
              <Link to="/events" className="btn btn-primary btn-lg">
                <span>Plan an Event</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          ) : (
            <div className="grid-2">
              {filteredBookings.map((b) => {
                const bookingRef = b.bookingId || b.id || b._id;
                const statusBadge =
                  b.status === 'Confirmed'
                    ? 'badge-confirmed'
                    : b.status === 'Pending'
                    ? 'badge-pending'
                    : b.status === 'Completed'
                    ? 'badge-completed'
                    : 'badge-cancelled';

                return (
                  <div key={b._id || bookingRef} className="card">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                          Ref: {bookingRef}
                        </span>
                        <h3 style={{ marginTop: '0.1rem', fontSize: '1.25rem' }}>
                          {b.eventType} Celebration
                        </h3>
                      </div>
                      <span className={`badge ${statusBadge}`}>{b.status || 'Confirmed'}</span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        background: 'var(--surface-beige)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Venue</span>
                        <strong>{b.venueName}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Event Date</span>
                        <strong>{b.eventDate} ({b.startTime || '18:00'})</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Guest Count</span>
                        <strong>{b.guestCount} Guests</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Total Amount</span>
                        <strong style={{ color: 'var(--primary-terracotta)' }}>
                          {formatCurrency(b.pricing ? b.pricing.totalAmount : 0)}
                        </strong>
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
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Host: <strong>{b.customerName}</strong>
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenDetails(b)}
                        >
                          View Details
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancelBooking(b._id || bookingRef, bookingRef)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBookingForModal}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

export default MyBookings;
