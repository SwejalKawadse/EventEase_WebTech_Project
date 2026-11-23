import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const API_URL = 'https://eventease-backend-ime3.onrender.com/api/events';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = () => {
    setLoading(true);
    fetch(`${API_URL}/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Event not found or failed to load.');
        }
        return res.json();
      })
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Delete event with BOM confirmation dialog
  const handleDelete = async () => {
    // JavaScript BOM confirm() dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${event.name}"? This action cannot be undone.`
    );

    if (!isConfirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event.');
      }

      // JavaScript BOM alert() dialog
      window.alert('Event was successfully deleted.');
      navigate('/events');
    } catch (err) {
      window.alert(err.message || 'Error occurred while deleting event.');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="loading-box">Loading event details...</div>;
  }

  if (error || !event) {
    return (
      <div className="empty-box" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <p style={{ color: 'var(--danger)', fontSize: '1.1rem' }}>
          {error || 'Event could not be found.'}
        </p>
        <Link to="/events" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          ← Back to All Events
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="details-card">
      <div className="details-header">
        <div>
          <span className="category-badge" style={{ marginBottom: '0.5rem' }}>
            {event.category}
          </span>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginTop: '0.4rem' }}>
            {event.name}
          </h1>
        </div>
      </div>

      <div className="details-meta">
        <div className="meta-item">
          <strong>Date & Day</strong>
          <span>📅 {formattedDate}</span>
        </div>
        <div className="meta-item">
          <strong>Location</strong>
          <span>📍 {event.location}</span>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          About This Event
        </h3>
        <p className="details-body">{event.description}</p>
      </div>

      <div className="details-actions">
        <Link to="/events" className="btn btn-outline">
          ← Back to Events
        </Link>
        <button
          onClick={handleDelete}
          className="btn btn-danger"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : '🗑️ Delete Event'}
        </button>
      </div>
    </div>
  );
}

export default EventDetails;
