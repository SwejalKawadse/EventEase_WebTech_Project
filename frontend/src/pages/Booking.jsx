import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createBooking } from '../services/api';
import Toast from '../components/Toast';

function Booking() {
  const navigate = useNavigate();

  const [draft, setDraft] = useState(() => {
    try {
      const saved = localStorage.getItem('eventease_booking_draft');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    specialRequirements: '',
  });

  const [errors, setErrors] = useState({});
  const [conflictError, setConflictError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    if (!draft || !draft.eventType || !draft.venueName || !draft.eventDate) {
      setToast({ message: 'Booking details incomplete. Redirecting to start...', type: 'error' });
      const timer = setTimeout(() => navigate('/events'), 1500);
      return () => clearTimeout(timer);
    }
  }, [draft, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // 1. Full Name
    if (!customer.name || !customer.name.trim()) {
      newErrors.name = 'Please enter your full name.';
    } else if (customer.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long.';
    }

    // 2. Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customer.email || !customer.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!emailRegex.test(customer.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    // 3. Indian Phone Number (10 digits starting with 6-9)
    const rawPhone = String(customer.phone || '').trim();
    const digitsOnly = rawPhone.replace(/\D/g, '');
    const cleanPhone = (digitsOnly.length === 12 && digitsOnly.startsWith('91'))
      ? digitsOnly.slice(2)
      : (digitsOnly.length === 11 && digitsOnly.startsWith('0'))
        ? digitsOnly.slice(1)
        : digitsOnly;

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!rawPhone) {
      newErrors.phone = 'Please enter your mobile phone number.';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Invalid phone number! Must be a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflictError('');

    if (!validate()) {
      setToast({ message: 'Please correct the highlighted contact errors.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const digitsOnly = String(customer.phone).replace(/\D/g, '');
      const cleanPhone = (digitsOnly.length === 12 && digitsOnly.startsWith('91'))
        ? digitsOnly.slice(2)
        : (digitsOnly.length === 11 && digitsOnly.startsWith('0'))
          ? digitsOnly.slice(1)
          : digitsOnly;

      const payload = {
        customerName: customer.name.trim(),
        customerEmail: customer.email.trim().toLowerCase(),
        customerPhone: cleanPhone,
        eventType: draft.eventType,
        venueId: draft.venueId || 'v-101',
        venueName: draft.venueName,
        eventDate: draft.eventDate,
        startTime: draft.startTime || '18:00',
        endTime: draft.endTime || '23:00',
        guestCount: draft.guestCount || 100,
        decoration: draft.decoration,
        theme: draft.theme,
        food: draft.food,
        music: draft.music,
        entertainment: draft.entertainment,
        photography: draft.photography,
        additionalServices: draft.additionalServices,
        specialRequirements: customer.specialRequirements.trim() || draft.specialRequirements,
        pricing: draft.pricing,
        status: 'Confirmed',
      };

      const booking = await createBooking(payload);

      setToast({ message: 'Booking confirmed successfully in MongoDB!', type: 'success' });
      localStorage.removeItem('eventease_booking_draft');

      setTimeout(() => {
        navigate(`/confirmation/${booking.bookingId || booking.id || booking._id}`);
      }, 700);
    } catch (err) {
      if (err.data && err.data.conflict) {
        setConflictError(err.message);
      } else {
        setToast({ message: err.message || 'Failed to complete booking. Please try again.', type: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!draft) return null;

  const p = draft.pricing || {};

  return (
    <div className="booking-page">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* STEPPER */}
      <div className="stepper-wrapper">
        <div className="stepper">
          <div className="step-item completed">
            <div className="step-circle">✓</div>
            <div className="step-label">Select Event</div>
          </div>
          <div className="step-divider"></div>
          <div className="step-item completed">
            <div className="step-circle">✓</div>
            <div className="step-label">Choose Venue</div>
          </div>
          <div className="step-divider"></div>
          <div className="step-item completed">
            <div className="step-circle">✓</div>
            <div className="step-label">Customize</div>
          </div>
          <div className="step-divider"></div>
          <div className="step-item active">
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

      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div className="subtitle">Step 4 of 5</div>
          <h2>Review & Confirm Booking</h2>
          <p>Carefully verify your itemized event selection and enter host contact details.</p>
        </div>

        {/* Conflict Alert Banner */}
        {conflictError && (
          <div className="conflict-alert" role="alert">
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              warning
            </span>
            <div>
              <strong style={{ fontSize: '1rem' }}>Scheduling Conflict Detected:</strong>
              <div style={{ marginTop: '0.25rem' }}>{conflictError}</div>
              <div style={{ marginTop: '0.5rem' }}>
                <Link to="/customize" className="btn btn-secondary btn-sm" style={{ background: '#FFF' }}>
                  ← Change Date or Venue
                </Link>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2rem', alignItems: 'flex-start' }}>
          {/* LEFT: ITEMIZED DETAILS */}
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Celebration Details</h3>
                <Link to="/customize" style={{ fontSize: '0.85rem', color: 'var(--primary-terracotta)', textDecoration: 'underline' }}>
                  Edit Selection
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--surface-beige)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Occasion</span>
                  <strong>{draft.eventType} Celebration</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Venue Location</span>
                  <strong>{draft.venueName}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Date & Schedule</span>
                  <strong>{draft.eventDate} ({draft.startTime || '18:00'} - {draft.endTime || '23:00'})</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Expected Guests</span>
                  <strong>{draft.guestCount} Guests</strong>
                </div>
              </div>

              <h4 style={{ marginBottom: '0.5rem' }}>Selected Packages</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                <li style={{ padding: '0.35rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                  <strong>Decor & Theme:</strong> {draft.decoration?.package} Package • Theme: {draft.theme}
                </li>
                <li style={{ padding: '0.35rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                  <strong>Food & Catering:</strong> {draft.food?.type} ({formatCurrency(draft.food?.pricePerGuest)}/guest) • Menu: {(draft.food?.items || []).join(', ')}
                </li>
                <li style={{ padding: '0.35rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                  <strong>Music:</strong> {draft.music?.type} • <strong>Act:</strong> {draft.entertainment?.type}
                </li>
                <li style={{ padding: '0.35rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                  <strong>Photography:</strong> {draft.photography?.package}
                </li>
                <li style={{ padding: '0.35rem 0' }}>
                  <strong>Extra Amenities:</strong> {(draft.additionalServices || []).map((s) => s.name).join(', ') || 'None selected'}
                </li>
              </ul>
            </div>

            {/* ITEMIZED PRICING BREAKDOWN */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Financial Breakdown</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                  <span>Venue Base Rental</span>
                  <strong>{formatCurrency(p.venueBase)}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                  <span>Decoration Setup</span>
                  <strong>{formatCurrency(p.decoration)}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                  <span>Food & Catering Total</span>
                  <strong>{formatCurrency(p.food)}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                  <span>Music & Live Entertainment</span>
                  <strong>{formatCurrency((p.music || 0) + (p.entertainment || 0))}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                  <span>Photography & Bespoke Services</span>
                  <strong>{formatCurrency((p.photography || 0) + (p.additionalServices || 0))}</strong>
                </li>
                <li
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.85rem 0 0.25rem',
                    borderTop: '2px solid var(--border-color)',
                    marginTop: '0.5rem',
                    fontSize: '1.25rem',
                    color: 'var(--primary-terracotta)',
                  }}
                >
                  <strong>Total Amount Payable</strong>
                  <strong>{formatCurrency(p.totalAmount)}</strong>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT: CONTACT DETAILS FORM */}
          <div className="card" style={{ background: 'var(--surface-white)' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Primary Host Contact</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Your booking confirmation and e-ticket reference will be registered under this contact.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">
                  Full Name <span style={{ color: 'var(--error-red)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="e.g. Rahul Sharma"
                  value={customer.name}
                  onChange={handleInputChange}
                />
                {errors.name && <span className="field-error show">{errors.name}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">
                  Email Address <span style={{ color: 'var(--error-red)' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="e.g. rahul.sharma@example.com"
                  value={customer.email}
                  onChange={handleInputChange}
                />
                {errors.email && <span className="field-error show">{errors.email}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">
                  Mobile Number (10 digits Indian) <span style={{ color: 'var(--error-red)' }}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  maxLength="13"
                  className={`form-input ${errors.phone ? 'is-invalid' : ''}`}
                  placeholder="e.g. 9876543210"
                  value={customer.phone}
                  onChange={handleInputChange}
                />
                {errors.phone && <span className="field-error show">{errors.phone}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Special Requirements / Setup Notes</label>
                <textarea
                  name="specialRequirements"
                  rows="3"
                  className="form-input"
                  placeholder="Any floral preferences, dietary restrictions, or schedule requests..."
                  value={customer.specialRequirements}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={isSubmitting || Boolean(conflictError)}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span> <span>Processing Booking...</span>
                  </>
                ) : (
                  <span>Confirm & Save Booking →</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Booking;
