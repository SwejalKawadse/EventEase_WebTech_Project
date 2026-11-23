import React, { useState, useEffect } from 'react';
import { checkEventConflict } from '../services/api';

function EventModal({ isOpen, onClose, onSave, eventToEdit, venueOptions = [] }) {
  const isEditing = Boolean(eventToEdit && eventToEdit._id);

  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    organizerName: '',
    email: '',
    phoneNumber: '',
    eventDate: '',
    startTime: '10:00',
    endTime: '18:00',
    venue: '',
    category: 'Corporate',
    guestCount: 100,
    status: 'Upcoming',
  });

  const [errors, setErrors] = useState({});
  const [conflictWarning, setConflictWarning] = useState('');
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        eventName: eventToEdit.eventName || eventToEdit.name || '',
        description: eventToEdit.description || '',
        organizerName: eventToEdit.organizerName || 'Event Organizer',
        email: eventToEdit.email || '',
        phoneNumber: eventToEdit.phoneNumber || '',
        eventDate: (eventToEdit.eventDate || eventToEdit.date || '').toString().slice(0, 10),
        startTime: eventToEdit.startTime || '10:00',
        endTime: eventToEdit.endTime || '18:00',
        venue: eventToEdit.venue || eventToEdit.location || '',
        category: eventToEdit.category || 'Corporate',
        guestCount: eventToEdit.guestCount || 100,
        status: eventToEdit.status || 'Upcoming',
      });
    } else {
      // Default new event values
      const future = new Date();
      future.setDate(future.getDate() + 7);
      setFormData({
        eventName: '',
        description: '',
        organizerName: '',
        email: '',
        phoneNumber: '',
        eventDate: future.toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '18:00',
        venue: venueOptions.length > 0 ? venueOptions[0].name : 'The Grand Courtyard',
        category: 'Corporate',
        guestCount: 100,
        status: 'Upcoming',
      });
    }
    setErrors({});
    setConflictWarning('');
  }, [eventToEdit, isOpen, venueOptions]);

  // Real-time conflict check on venue or date change
  useEffect(() => {
    if (!formData.venue || !formData.eventDate) return;

    let isMounted = true;
    const runConflictCheck = async () => {
      setCheckingConflict(true);
      try {
        const res = await checkEventConflict({
          venue: formData.venue,
          eventDate: formData.eventDate,
          excludeId: eventToEdit?._id || null,
        });

        if (isMounted) {
          if (res.conflict) {
            setConflictWarning(res.message);
          } else {
            setConflictWarning('');
          }
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        if (isMounted) setCheckingConflict(false);
      }
    };

    const timer = setTimeout(runConflictCheck, 400);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [formData.venue, formData.eventDate, eventToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear individual error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // 1. Event Name
    if (!formData.eventName || !formData.eventName.trim()) {
      newErrors.eventName = 'Event name cannot be empty or contain only spaces.';
    } else if (formData.eventName.trim().length < 2) {
      newErrors.eventName = 'Event name must be at least 2 characters.';
    }

    // 2. Description
    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'Event description cannot be empty or contain only spaces.';
    }

    // 3. Organizer Name
    if (!formData.organizerName || !formData.organizerName.trim()) {
      newErrors.organizerName = 'Organizer name cannot be empty.';
    }

    // 4. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email format (e.g. organizer@example.com).';
    }

    // 5. Phone number validation (10 digits Indian mobile number)
    const rawPhone = String(formData.phoneNumber || '').trim();
    const digitsOnly = rawPhone.replace(/\D/g, '');
    const cleanPhone = (digitsOnly.length === 12 && digitsOnly.startsWith('91'))
      ? digitsOnly.slice(2)
      : (digitsOnly.length === 11 && digitsOnly.startsWith('0'))
        ? digitsOnly.slice(1)
        : digitsOnly;

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!rawPhone) {
      newErrors.phoneNumber = 'Phone number is required.';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phoneNumber = 'Phone number must be a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9).';
    }

    // 6. Venue
    if (!formData.venue || !formData.venue.trim()) {
      newErrors.venue = 'Venue cannot be empty.';
    }

    // 7. Event Date (cannot be in the past)
    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required.';
    } else if (formData.eventDate < todayStr) {
      newErrors.eventDate = 'Event date cannot be in the past. Please select today or a future date.';
    }

    // 8. Time Validation (End time > Start time)
    if (!formData.startTime || !formData.endTime) {
      newErrors.endTime = 'Start time and end time are required.';
    } else if (formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be later than start time.';
    }

    // 9. Guest Count
    if (!formData.guestCount || Number(formData.guestCount) < 1) {
      newErrors.guestCount = 'Guest count must be at least 1.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (conflictWarning) {
      alert(conflictWarning);
      return;
    }

    setIsSubmitting(true);
    try {
      // Normalize clean phone before saving
      const digitsOnly = String(formData.phoneNumber).replace(/\D/g, '');
      const cleanPhone = (digitsOnly.length === 12 && digitsOnly.startsWith('91'))
        ? digitsOnly.slice(2)
        : (digitsOnly.length === 11 && digitsOnly.startsWith('0'))
          ? digitsOnly.slice(1)
          : digitsOnly;

      const payload = {
        ...formData,
        eventName: formData.eventName.trim(),
        description: formData.description.trim(),
        organizerName: formData.organizerName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: cleanPhone,
        venue: formData.venue.trim(),
        guestCount: Number(formData.guestCount),
      };

      await onSave(payload, eventToEdit?._id);
      onClose();
    } catch (err) {
      if (err.data && err.data.conflict) {
        setConflictWarning(err.message);
      } else {
        setErrors((prev) => ({ ...prev, form: err.message || 'Failed to save event.' }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>
            {isEditing ? '✏️ Edit Event Details' : '🎉 Add New Event'}
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Conflict Alert Banner */}
            {conflictWarning && (
              <div className="conflict-alert" role="alert">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  warning
                </span>
                <div>
                  <strong>Scheduling Conflict Detected:</strong>
                  <div style={{ marginTop: '0.2rem' }}>{conflictWarning}</div>
                </div>
              </div>
            )}

            {errors.form && (
              <div className="conflict-alert" role="alert">
                <span className="material-symbols-outlined">error</span>
                <span>{errors.form}</span>
              </div>
            )}

            {/* Event Name */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">
                Event Name <span style={{ color: 'var(--error-red)' }}>*</span>
              </label>
              <input
                type="text"
                name="eventName"
                className={`form-input ${errors.eventName ? 'is-invalid' : ''}`}
                placeholder="e.g. Annual Tech Symposium 2026"
                value={formData.eventName}
                onChange={handleChange}
              />
              {errors.eventName && <span className="field-error show">{errors.eventName}</span>}
            </div>

            {/* Category & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  className="form-input"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Corporate">Corporate / Tech</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Party">Party / Social</option>
                  <option value="Cultural">Cultural / College Fest</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Event Status</label>
                <select
                  name="status"
                  className="form-input"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Venue & Conflict Status */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">
                  Venue / Location <span style={{ color: 'var(--error-red)' }}>*</span>
                </label>
                {checkingConflict && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Checking availability...
                  </span>
                )}
              </div>
              <input
                type="text"
                name="venue"
                list="venue-suggestions"
                className={`form-input ${errors.venue || conflictWarning ? 'is-invalid' : ''}`}
                placeholder="e.g. The Grand Courtyard or Main Auditorium"
                value={formData.venue}
                onChange={handleChange}
              />
              <datalist id="venue-suggestions">
                {venueOptions.map((v) => (
                  <option key={v.id || v._id} value={v.name} />
                ))}
              </datalist>
              {errors.venue && <span className="field-error show">{errors.venue}</span>}
            </div>

            {/* Date, Start Time, End Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  Event Date <span style={{ color: 'var(--error-red)' }}>*</span>
                </label>
                <input
                  type="date"
                  name="eventDate"
                  min={todayStr}
                  className={`form-input ${errors.eventDate || conflictWarning ? 'is-invalid' : ''}`}
                  value={formData.eventDate}
                  onChange={handleChange}
                />
                {errors.eventDate && <span className="field-error show">{errors.eventDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  className="form-input"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  className={`form-input ${errors.endTime ? 'is-invalid' : ''}`}
                  value={formData.endTime}
                  onChange={handleChange}
                />
                {errors.endTime && <span className="field-error show">{errors.endTime}</span>}
              </div>
            </div>

            {/* Organizer Name, Email, Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  Organizer Name <span style={{ color: 'var(--error-red)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="organizerName"
                  className={`form-input ${errors.organizerName ? 'is-invalid' : ''}`}
                  placeholder="e.g. Prof. Abhay Patil"
                  value={formData.organizerName}
                  onChange={handleChange}
                />
                {errors.organizerName && <span className="field-error show">{errors.organizerName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Expected Guests
                </label>
                <input
                  type="number"
                  name="guestCount"
                  min="1"
                  className={`form-input ${errors.guestCount ? 'is-invalid' : ''}`}
                  value={formData.guestCount}
                  onChange={handleChange}
                />
                {errors.guestCount && <span className="field-error show">{errors.guestCount}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  Organizer Email <span style={{ color: 'var(--error-red)' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="e.g. organizer@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="field-error show">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Mobile Number (10 digits) <span style={{ color: 'var(--error-red)' }}>*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  maxLength="13"
                  className={`form-input ${errors.phoneNumber ? 'is-invalid' : ''}`}
                  placeholder="e.g. 9876543210"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
                {errors.phoneNumber && <span className="field-error show">{errors.phoneNumber}</span>}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                Event Description & Schedule <span style={{ color: 'var(--error-red)' }}>*</span>
              </label>
              <textarea
                name="description"
                rows="3"
                className={`form-input ${errors.description ? 'is-invalid' : ''}`}
                placeholder="Describe the event, agenda, special guests, or keynote topics..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
              {errors.description && <span className="field-error show">{errors.description}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || Boolean(conflictWarning)}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span> <span>Saving...</span>
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Create Event in MongoDB'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventModal;
