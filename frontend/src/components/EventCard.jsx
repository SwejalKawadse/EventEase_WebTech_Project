import React from 'react';
import { Link } from 'react-router-dom';

function EventCard({ event }) {
  // Format the ISO date into readable format (e.g., Nov 15, 2026)
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="event-card">
      <div>
        <div className="event-card-header">
          <h3 className="event-card-title">{event.name}</h3>
          <span className="category-badge">{event.category}</span>
        </div>

        <div className="event-info">
          <div className="event-info-item">
            <span>📅</span>
            <span>{formattedDate}</span>
          </div>
          <div className="event-info-item">
            <span>📍</span>
            <span>{event.location}</span>
          </div>
        </div>

        <p className="event-description">{event.description}</p>
      </div>

      <div className="event-card-footer">
        <Link to={`/events/${event._id}`} className="btn btn-outline" style={{ fontSize: '0.88rem', padding: '0.4rem 0.9rem' }}>
          View Details →
        </Link>
      </div>
    </div>
  );
}

export default EventCard;
