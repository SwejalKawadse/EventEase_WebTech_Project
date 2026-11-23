import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';

const API_URL = 'https://eventease-backend-ime3.onrender.com/api/events';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch all events from Express API
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    setLoading(true);
    setError('');

    fetch(API_URL)
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to fetch events from server.');
        }
        return data;
      })
      .then((data) => {
        setEvents(data || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.message && err.message.toLowerCase().includes('fetch')) {
          setError(
            'Cannot connect to backend server. Please make sure your backend is running on https://eventease-backend-ime3.onrender.com (Open terminal, cd backend, and run "npm start").'
          );
        } else {
          setError(err.message || 'Error connecting to server.');
        }
        setLoading(false);
      });
  };

  // Filter events based on search query and category
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>All Events</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Browse and explore events happening around campus.
          </p>
        </div>
        <Link to="/add-event" className="btn btn-primary">
          + Add Event
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          className="form-input"
          placeholder="Search by event name or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, minWidth: '220px' }}
        />

        <select
          className="form-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ width: 'auto', minWidth: '160px' }}
        >
          <option value="All">All Categories</option>
          <option value="Academic">Academic</option>
          <option value="Cultural">Cultural</option>
          <option value="Workshop">Workshop</option>
          <option value="Networking">Networking</option>
          <option value="Sports">Sports</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* States: Loading, Error, Empty, or List */}
      {loading && <div className="loading-box">Loading events...</div>}

      {error && (
        <div className="alert alert-error">
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>⚠️ Connection Notice</p>
          <p>{error}</p>
          <button
            onClick={fetchEvents}
            className="btn btn-outline"
            style={{ marginTop: '0.75rem', backgroundColor: '#fff' }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {!loading && !error && filteredEvents.length === 0 && (
        <div className="empty-box">
          <p>No events found matching your criteria.</p>
          <Link to="/add-event" className="btn btn-primary">
            Create an Event
          </Link>
        </div>
      )}

      {!loading && !error && filteredEvents.length > 0 && (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

export default EventList;
