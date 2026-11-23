import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'https://eventease-backend-ime3.onrender.com/api/events';

function AddEvent() {
  const navigate = useNavigate();

  // Form input state
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    category: 'Academic',
    description: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle changes to form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend validation
    if (!formData.name.trim()) {
      setError('Please provide an event name.');
      return;
    }
    if (!formData.date) {
      setError('Please select a valid event date.');
      return;
    }
    if (!formData.location.trim()) {
      setError('Please enter the event location.');
      return;
    }
    if (!formData.category.trim()) {
      setError('Please select a category.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide a short description of the event.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event.');
      }

      setSuccess('Event created successfully!');
      // Navigate to events list after a brief pause
      setTimeout(() => {
        navigate('/events');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Add New Event</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Fill out the form below to publish an upcoming event.
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Event Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-input"
            placeholder="e.g. Annual Hackathon 2026"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="date">
            Event Date *
          </label>
          <input
            id="date"
            name="date"
            type="date"
            className="form-input"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="location">
            Location / Venue *
          </label>
          <input
            id="location"
            name="location"
            type="text"
            className="form-input"
            placeholder="e.g. Seminar Hall 2, Block C"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="category">
            Category *
          </label>
          <select
            id="category"
            name="category"
            className="form-select"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="Academic">Academic</option>
            <option value="Cultural">Cultural</option>
            <option value="Workshop">Workshop</option>
            <option value="Networking">Networking</option>
            <option value="Sports">Sports</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            className="form-textarea"
            placeholder="Write a clear summary about what the event entails..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Event...' : 'Create Event'}
          </button>
          <Link to="/events" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AddEvent;
