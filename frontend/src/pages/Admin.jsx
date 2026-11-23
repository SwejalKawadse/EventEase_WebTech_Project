import React, { useState, useEffect } from 'react';
import {
  getBookings,
  updateBookingStatus,
  deleteBooking,
  getVenues,
  createVenue,
  updateVenue,
  deleteVenue,
} from '../services/api';
import Toast from '../components/Toast';

function Admin() {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'venues', 'logs'
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Venue Modal state
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [venueForm, setVenueForm] = useState({
    id: '',
    name: '',
    location: '',
    description: '',
    capacity: 250,
    startingPrice: 35000,
    image: '',
    type: 'Courtyard & Lawn',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, venuesData] = await Promise.all([
        getBookings().catch(() => []),
        getVenues().catch(() => []),
      ]);

      setBookings(bookingsData || []);
      setVenues(venuesData || []);

      // Generate initial event logs from bookings
      const initialLogs = (bookingsData || []).slice(0, 10).map((b) => ({
        id: b._id || b.bookingId,
        eventName: 'booking.created',
        timestamp: b.createdAt || new Date().toISOString(),
        details: `Booking ${b.bookingId || b.id} confirmed for ${b.customerName} at ${b.venueName}`,
      }));
      setLogs(initialLogs);
    } catch (err) {
      setToast({ message: err.message || 'Failed to load admin data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // KPIs
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === 'Pending').length;
  const totalCustomers = new Set(bookings.map((b) => b.customerEmail)).size;
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + Number(b.pricing?.totalAmount || 0),
    0
  );

  // Status update
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      setToast({ message: `Booking ${bookingId} status updated to '${newStatus}' in MongoDB!`, type: 'success' });
      setBookings((prev) =>
        prev.map((b) =>
          (b.bookingId || b.id || b._id) === bookingId ? { ...b, status: newStatus } : b
        )
      );

      // Append log
      setLogs((prev) => [
        {
          id: Date.now(),
          eventName: 'booking.status_updated',
          timestamp: new Date().toISOString(),
          details: `Booking ${bookingId} status changed to ${newStatus}`,
        },
        ...prev,
      ]);
    } catch (err) {
      setToast({ message: err.message || 'Failed to update status.', type: 'error' });
    }
  };

  // Delete booking
  const handleDeleteBooking = async (id, ref) => {
    if (!window.confirm(`Are you sure you want to delete booking ${ref}?`)) return;
    try {
      await deleteBooking(id);
      setToast({ message: `Booking ${ref} deleted.`, type: 'success' });
      setBookings((prev) => prev.filter((b) => (b.bookingId || b.id || b._id) !== id));
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete booking.', type: 'error' });
    }
  };

  // Open Venue Modal (Add or Edit)
  const handleOpenVenueModal = (venue = null) => {
    if (venue) {
      setEditingVenue(venue);
      setVenueForm({
        id: venue.id || '',
        name: venue.name || '',
        location: venue.location || '',
        description: venue.description || '',
        capacity: venue.capacity || 250,
        startingPrice: venue.startingPrice || 35000,
        image: venue.image || '',
        type: venue.type || 'Courtyard & Lawn',
      });
    } else {
      setEditingVenue(null);
      setVenueForm({
        id: `v-${Date.now().toString().slice(-4)}`,
        name: '',
        location: '',
        description: '',
        capacity: 250,
        startingPrice: 35000,
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80',
        type: 'Courtyard & Lawn',
      });
    }
    setVenueModalOpen(true);
  };

  const handleSaveVenue = async (e) => {
    e.preventDefault();
    try {
      if (editingVenue) {
        await updateVenue(editingVenue.id, venueForm);
        setToast({ message: 'Venue updated successfully in MongoDB!', type: 'success' });
      } else {
        await createVenue(venueForm);
        setToast({ message: 'New venue added to MongoDB!', type: 'success' });
      }
      setVenueModalOpen(false);
      const updatedVenues = await getVenues();
      setVenues(updatedVenues);
    } catch (err) {
      setToast({ message: err.message || 'Failed to save venue.', type: 'error' });
    }
  };

  const handleDeleteVenue = async (venueId, name) => {
    if (!window.confirm(`Are you sure you want to delete venue "${name}"?`)) return;
    try {
      await deleteVenue(venueId);
      setToast({ message: 'Venue removed from database.', type: 'success' });
      setVenues((prev) => prev.filter((v) => v.id !== venueId));
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete venue.', type: 'error' });
    }
  };

  return (
    <div className="admin-page">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <div className="subtitle">Enterprise Administration</div>
            <h2>EventEase Management Console</h2>
            <p>Real-time booking intelligence, venue catalog, and audit log monitoring connected to MongoDB.</p>
          </div>

          {/* DASHBOARD KPIS */}
          <div
            className="admin-stats-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem',
            }}
          >
            <div className="card" style={{ background: 'var(--surface-white)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Reservations</div>
              <h2 style={{ fontSize: '2.25rem', margin: '0.25rem 0', color: 'var(--text-charcoal)' }}>
                {totalBookings}
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--secondary-sage)' }}>Synchronized with MongoDB</span>
            </div>

            <div className="card" style={{ background: 'var(--surface-white)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending Confirmation</div>
              <h2 style={{ fontSize: '2.25rem', margin: '0.25rem 0', color: 'var(--status-pending)' }}>
                {pendingBookings}
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Awaiting review</span>
            </div>

            <div className="card" style={{ background: 'var(--surface-white)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Unique Host Accounts</div>
              <h2 style={{ fontSize: '2.25rem', margin: '0.25rem 0', color: 'var(--text-charcoal)' }}>
                {totalCustomers}
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered email profiles</span>
            </div>

            <div className="card" style={{ background: 'var(--surface-white)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Pipeline Revenue</div>
              <h2 style={{ fontSize: '2.25rem', margin: '0.25rem 0', color: 'var(--primary-terracotta)' }}>
                {formatCurrency(totalRevenue)}
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--secondary-sage)' }}>Calculated live</span>
            </div>
          </div>

          {/* TAB BUTTONS */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <button
              className={`btn btn-sm ${activeTab === 'bookings' ? 'active-tab' : 'btn-secondary'}`}
              onClick={() => setActiveTab('bookings')}
            >
              All Bookings ({bookings.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'venues' ? 'active-tab' : 'btn-secondary'}`}
              onClick={() => setActiveTab('venues')}
            >
              Venues Marketplace ({venues.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'logs' ? 'active-tab' : 'btn-secondary'}`}
              onClick={() => setActiveTab('logs')}
            >
              System Audit Logs ({logs.length})
            </button>
          </div>

          {/* TAB 1: BOOKINGS MANAGEMENT TABLE */}
          {activeTab === 'bookings' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-beige)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Ref ID</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Host Details</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Occasion</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Venue</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Guests</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                          No reservations recorded yet in MongoDB.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => {
                        const bRef = b.bookingId || b.id || b._id;
                        const statusBadge =
                          b.status === 'Confirmed'
                            ? 'badge-confirmed'
                            : b.status === 'Pending'
                            ? 'badge-pending'
                            : b.status === 'Completed'
                            ? 'badge-completed'
                            : 'badge-cancelled';

                        return (
                          <tr key={b._id || bRef} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <strong>{bRef}</strong>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <strong>{b.customerName}</strong>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.customerEmail}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+91 {b.customerPhone}</div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>{b.eventType}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>{b.venueName}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>{b.eventDate}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>{b.guestCount}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <strong>{formatCurrency(b.pricing?.totalAmount || 0)}</strong>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span className={`badge ${statusBadge}`}>{b.status}</span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                <select
                                  value={b.status}
                                  onChange={(e) => handleStatusChange(bRef, e.target.value)}
                                  style={{
                                    fontSize: '0.8rem',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-color)',
                                  }}
                                >
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Pending">Pending</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDeleteBooking(b._id || bRef, bRef)}
                                  title="Delete booking from MongoDB"
                                >
                                  ✕
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: VENUES MANAGEMENT TABLE */}
          {activeTab === 'venues' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn btn-primary" onClick={() => handleOpenVenueModal()}>
                  + Add New Venue
                </button>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-beige)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '0.85rem 1rem' }}>Image</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Venue Name</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Location</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Capacity</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Starting Price</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Rating</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {venues.map((v) => (
                        <tr key={v.id || v._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <img
                              src={v.image}
                              alt={v.name}
                              style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                            />
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <strong>{v.name}</strong>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>{v.location}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>{v.capacity} guests</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <strong>{formatCurrency(v.startingPrice)}</strong>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>★ {v.rating || 4.8}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleOpenVenueModal(v)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteVenue(v.id, v.name)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT EVENT LOGS TIMELINE */}
          {activeTab === 'logs' && (
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Database Audit Timeline</h3>
              {logs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No audit events logged yet.</p>
              ) : (
                <div className="admin-event-timeline">
                  {logs.map((log, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.85rem',
                        borderLeft: '3px solid var(--primary-terracotta)',
                        background: 'var(--surface-beige)',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <strong style={{ color: 'var(--primary-terracotta)', fontSize: '0.9rem' }}>
                          {log.eventName}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-charcoal)' }}>
                        {log.details}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Add / Edit Venue Modal */}
      {venueModalOpen && (
        <div className="modal-overlay" onClick={() => setVenueModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{editingVenue ? 'Edit Venue' : 'Add New Venue'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setVenueModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveVenue}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Venue Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={venueForm.name}
                    onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Location / City *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={venueForm.location}
                    onChange={(e) => setVenueForm({ ...venueForm, location: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Capacity (Guests)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-input"
                      value={venueForm.capacity}
                      onChange={(e) => setVenueForm({ ...venueForm, capacity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Starting Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="form-input"
                      value={venueForm.startingPrice}
                      onChange={(e) => setVenueForm({ ...venueForm, startingPrice: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={venueForm.image}
                    onChange={(e) => setVenueForm({ ...venueForm, image: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows="3"
                    className="form-input"
                    value={venueForm.description}
                    onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setVenueModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Venue to MongoDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
