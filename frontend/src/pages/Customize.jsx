import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { checkBookingConflict, getVenues } from '../services/api';
import Toast from '../components/Toast';

const DECOR_OPTIONS = [
  { name: 'Basic', price: 5000, desc: 'Subtle ambient lighting, crisp linen tables, and minimalist floral vases.' },
  { name: 'Minimalist Modern', price: 15000, desc: 'Sleek architectural lighting, contemporary metallic accents, and bespoke centerpieces.' },
  { name: 'Floral Enchantment', price: 45000, desc: 'Exotic seasonal blooms, floral archways, cascading flower ceiling, and fairy lights.' },
  { name: 'Grand Royal Theme', price: 65000, desc: 'Regal Rajasthani drapes, crystal chandeliers, red carpet entrance, and royal velvet banquet.' },
];

const THEME_OPTIONS = ['Minimal', 'Royal Regal', 'Neon Glow', 'Rustic Bohemia', 'Vintage Elegance'];

const FOOD_OPTIONS = [
  { type: 'Vegetarian', pricePerGuest: 400, desc: 'Authentic Indian regional delicacies, paneer gravies, fresh breads, and traditional desserts.' },
  { type: 'Non-Vegetarian', pricePerGuest: 650, desc: 'Gourmet chicken, mutton curries, barbecue kebabs, aromatic biryanis, and sweets.' },
  { type: 'Royal Multi-Cuisine', pricePerGuest: 1200, desc: 'Five-star global buffet featuring Continental, Pan-Asian, Mughlai & live dessert counters.' },
];

const ALL_FOOD_ITEMS = ['Welcome Drinks', 'Starters', 'Main Course', 'Artisanal Breads', 'Desserts', 'Mocktails'];

const MUSIC_OPTIONS = [
  { type: 'No Music', price: 0, desc: 'Quiet, conversational ambiance without dedicated sound system.' },
  { type: 'DJ Console & Sound', price: 12000, desc: 'Professional sound system, DJ console, dynamic dance floor lighting, and playlist curation.' },
  { type: 'Live Band & Acoustics', price: 25000, desc: '4-piece live musical ensemble performing pop, acoustic rock, and classical Bollywood melodies.' },
  { type: 'Classical Shehnai & Sitar', price: 18000, desc: 'Traditional instrumental maestros creating a serene, auspicious heritage atmosphere.' },
];

const ENTERTAINMENT_OPTIONS = [
  { type: 'None', price: 0, desc: 'No special performers or stage acts.' },
  { type: 'Master of Ceremonies (Emcee)', price: 10000, desc: 'Bilingual energetic host to coordinate games, guest speeches, and announcements.' },
  { type: 'Magician & Illusionist', price: 15000, desc: 'Interactive close-up magic and mind-bending stage illusions for all ages.' },
  { type: 'Stand-up Comedian', price: 20000, desc: '30-minute clean comedy set tailored to your celebration and crowd.' },
];

const PHOTO_OPTIONS = [
  { package: 'None', price: 0, desc: 'Personal photography only.' },
  { package: 'Standard Photography', price: 12000, desc: 'Single professional candid photographer with edited digital album within 48 hours.' },
  { package: 'Drone & Cinematic Video', price: 30000, desc: '2 candid photographers, 4K cinematic highlight reel, and drone aerial coverage.' },
];

const SERVICE_OPTIONS = [
  { name: 'Valet Parking Assistance', price: 5000, desc: 'Dedicated team of 4 valet drivers with luggage assist.' },
  { name: 'Interactive Photo Booth', price: 7500, desc: 'Instant print photo booth with quirky props and digital copy delivery.' },
  { name: 'Bridal / VIP Suite Access', price: 10000, desc: 'Air-conditioned luxury green room with private restroom and refreshments.' },
];

function Customize() {
  const navigate = useNavigate();

  // Load existing draft or sensible defaults
  const [draft, setDraft] = useState(() => {
    try {
      const saved = localStorage.getItem('eventease_booking_draft');
      if (saved) return JSON.parse(saved);
    } catch {}
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    return {
      eventType: 'Wedding',
      venueId: 'v-101',
      venueName: 'The Grand Courtyard',
      venueBasePrice: 35000,
      venueCapacity: 250,
      eventDate: futureDate.toISOString().split('T')[0],
      startTime: '18:00',
      endTime: '23:00',
      guestCount: 100,
      decoration: { package: 'Basic', price: 5000 },
      theme: 'Minimal',
      food: { type: 'Vegetarian', pricePerGuest: 400, items: ['Starters', 'Main Course', 'Desserts'] },
      music: { type: 'No Music', price: 0 },
      entertainment: { type: 'None', price: 0 },
      photography: { package: 'None', price: 0 },
      additionalServices: [],
      specialRequirements: '',
      pricing: {
        venueBase: 35000,
        decoration: 5000,
        food: 40000,
        music: 0,
        entertainment: 0,
        photography: 0,
        additionalServices: 0,
        totalAmount: 80000,
      },
    };
  });

  const [errors, setErrors] = useState({});
  const [conflictMessage, setConflictMessage] = useState('');
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const todayStr = new Date().toISOString().split('T')[0];

  // Recalculate live prices whenever state changes
  const calculatePricing = (currentDraft) => {
    const venueBase = currentDraft.venueBasePrice || 35000;
    const decorPrice = currentDraft.decoration?.price || 0;
    const guests = Number(currentDraft.guestCount) || 100;
    const foodPricePerGuest = currentDraft.food?.pricePerGuest || 400;
    const foodTotal = foodPricePerGuest * guests;
    const musicPrice = currentDraft.music?.price || 0;
    const entPrice = currentDraft.entertainment?.price || 0;
    const photoPrice = currentDraft.photography?.price || 0;
    const servicesTotal = (currentDraft.additionalServices || []).reduce((sum, s) => sum + (s.price || 0), 0);

    const totalAmount = venueBase + decorPrice + foodTotal + musicPrice + entPrice + photoPrice + servicesTotal;

    return {
      venueBase,
      decoration: decorPrice,
      food: foodTotal,
      music: musicPrice,
      entertainment: entPrice,
      photography: photoPrice,
      additionalServices: servicesTotal,
      totalAmount,
    };
  };

  // Sync pricing to draft and localStorage
  const updateDraft = (updater) => {
    setDraft((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      next.pricing = calculatePricing(next);
      localStorage.setItem('eventease_booking_draft', JSON.stringify(next));
      return next;
    });
  };

  // Check venue + date conflict in real time
  useEffect(() => {
    if (!draft.venueName || !draft.eventDate) return;

    let isMounted = true;
    const verifyConflict = async () => {
      setCheckingConflict(true);
      try {
        const res = await checkBookingConflict({
          venueName: draft.venueName,
          eventDate: draft.eventDate,
        });

        if (isMounted) {
          if (res.conflict) {
            setConflictMessage(res.message);
          } else {
            setConflictMessage('');
          }
        }
      } catch (err) {
        // Continue gracefully
      } finally {
        if (isMounted) setCheckingConflict(false);
      }
    };

    const timer = setTimeout(verifyConflict, 500);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [draft.venueName, draft.eventDate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Selection handlers
  const handleDateChange = (e) => {
    const val = e.target.value;
    updateDraft((prev) => ({ ...prev, eventDate: val }));
    if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
  };

  const handleStartTimeChange = (e) => {
    const val = e.target.value;
    updateDraft((prev) => ({ ...prev, startTime: val }));
    if (errors.time) setErrors((prev) => ({ ...prev, time: '' }));
  };

  const handleEndTimeChange = (e) => {
    const val = e.target.value;
    updateDraft((prev) => ({ ...prev, endTime: val }));
    if (errors.time) setErrors((prev) => ({ ...prev, time: '' }));
  };

  const handleGuestsChange = (e) => {
    const val = parseInt(e.target.value, 10) || 1;
    updateDraft((prev) => ({ ...prev, guestCount: val }));
    if (errors.guests) setErrors((prev) => ({ ...prev, guests: '' }));
  };

  const handleDecorSelect = (pkg) => {
    updateDraft((prev) => ({ ...prev, decoration: { package: pkg.name, price: pkg.price } }));
  };

  const handleThemeSelect = (theme) => {
    updateDraft((prev) => ({ ...prev, theme }));
  };

  const handleFoodTypeSelect = (food) => {
    updateDraft((prev) => ({
      ...prev,
      food: { ...prev.food, type: food.type, pricePerGuest: food.pricePerGuest },
    }));
  };

  const handleFoodItemToggle = (item) => {
    updateDraft((prev) => {
      const currentItems = prev.food?.items || [];
      const updated = currentItems.includes(item)
        ? currentItems.filter((i) => i !== item)
        : [...currentItems, item];
      return {
        ...prev,
        food: { ...prev.food, items: updated },
      };
    });
  };

  const handleMusicSelect = (music) => {
    updateDraft((prev) => ({ ...prev, music: { type: music.type, price: music.price } }));
  };

  const handleEntertainmentSelect = (ent) => {
    updateDraft((prev) => ({ ...prev, entertainment: { type: ent.type, price: ent.price } }));
  };

  const handlePhotoSelect = (photo) => {
    updateDraft((prev) => ({ ...prev, photography: { package: photo.package, price: photo.price } }));
  };

  const handleServiceToggle = (svc) => {
    updateDraft((prev) => {
      const list = prev.additionalServices || [];
      const exists = list.some((s) => s.name === svc.name);
      const updated = exists
        ? list.filter((s) => s.name !== svc.name)
        : [...list, { name: svc.name, price: svc.price }];
      return { ...prev, additionalServices: updated };
    });
  };

  // Validate and Proceed
  const handleProceed = () => {
    const newErrors = {};

    // 1. Date validation
    if (!draft.eventDate || draft.eventDate < todayStr) {
      newErrors.date = 'Event date cannot be in the past. Please choose today or a future date.';
    }

    // 2. Time validation (End > Start)
    if (!draft.startTime || !draft.endTime || draft.endTime <= draft.startTime) {
      newErrors.time = 'End time must be later than start time.';
    }

    // 3. Guest count
    const capacity = draft.venueCapacity || 1000;
    if (!draft.guestCount || draft.guestCount < 1 || draft.guestCount > capacity) {
      newErrors.guests = `Guest count must be between 1 and ${capacity}.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setToast({ message: 'Please correct the highlighted form errors before proceeding.', type: 'error' });
      return;
    }

    if (conflictMessage) {
      setToast({ message: conflictMessage, type: 'error' });
      return;
    }

    // Navigate to Review & Confirm
    navigate('/booking');
  };

  const p = draft.pricing || {};

  return (
    <div className="customize-page" style={{ paddingBottom: '100px' }}>
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
          <div className="step-item active">
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

      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="subtitle">Step 3 of 5</div>
          <h2>Customize Your Celebration</h2>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: 'var(--primary-terracotta)', color: '#FFF' }}>
              {draft.eventType || 'Celebration'}
            </span>
            <span className="badge" style={{ background: 'var(--surface-white)', border: '1px solid var(--border-color)' }}>
              🏛️ {draft.venueName || 'Selected Venue'}
            </span>
            <Link to="/venues" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
              Change Venue
            </Link>
          </div>
        </div>

        {/* Conflict Warning Banner */}
        {conflictMessage && (
          <div className="conflict-alert" role="alert">
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              warning
            </span>
            <div>
              <strong style={{ fontSize: '1rem' }}>Venue Booking Conflict:</strong>
              <div style={{ marginTop: '0.25rem' }}>{conflictMessage}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'flex-start' }}>
          {/* LEFT: CUSTOMIZATION CONTROLS */}
          <div className="customization-controls">
            {/* 1. DATE, TIME & GUEST COUNT */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-terracotta)' }}>
                  event
                </span>
                <span>Date, Timings & Capacity</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Event Date *</label>
                    {checkingConflict && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Checking...</span>}
                  </div>
                  <input
                    type="date"
                    min={todayStr}
                    className={`form-input ${errors.date || conflictMessage ? 'is-invalid' : ''}`}
                    value={draft.eventDate}
                    onChange={handleDateChange}
                  />
                  {errors.date && <span className="field-error show">{errors.date}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={draft.startTime}
                    onChange={handleStartTimeChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className={`form-input ${errors.time ? 'is-invalid' : ''}`}
                    value={draft.endTime}
                    onChange={handleEndTimeChange}
                  />
                  {errors.time && <span className="field-error show">{errors.time}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Guest Count (Max {draft.venueCapacity || 500})</label>
                  <input
                    type="number"
                    min="1"
                    max={draft.venueCapacity || 1000}
                    className={`form-input ${errors.guests ? 'is-invalid' : ''}`}
                    value={draft.guestCount}
                    onChange={handleGuestsChange}
                  />
                  {errors.guests && <span className="field-error show">{errors.guests}</span>}
                </div>
              </div>
            </div>

            {/* 2. DECORATION PACKAGE */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-terracotta)' }}>
                  palette
                </span>
                <span>Decoration & Floral Package</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {DECOR_OPTIONS.map((pkg) => {
                  const isSelected = draft.decoration?.package === pkg.name;
                  return (
                    <div
                      key={pkg.name}
                      className={`card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleDecorSelect(pkg)}
                      style={{
                        cursor: 'pointer',
                        padding: '1rem',
                        border: isSelected ? '2px solid var(--primary-terracotta)' : '1px solid var(--border-color)',
                        background: isSelected ? '#FFF8F6' : 'var(--surface-white)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <strong>{pkg.name}</strong>
                        <span style={{ color: 'var(--primary-terracotta)', fontWeight: 700 }}>
                          {formatCurrency(pkg.price)}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{pkg.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Theme Selector */}
              <div style={{ marginTop: '1.25rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  Aesthetic Color Theme
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {THEME_OPTIONS.map((thm) => (
                    <button
                      key={thm}
                      type="button"
                      className={`btn btn-sm ${draft.theme === thm ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleThemeSelect(thm)}
                    >
                      {thm}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. GASTRONOMY & CATERING */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-terracotta)' }}>
                  restaurant
                </span>
                <span>Gastronomy & Catering Menu</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                {FOOD_OPTIONS.map((f) => {
                  const isSelected = draft.food?.type === f.type;
                  return (
                    <div
                      key={f.type}
                      className={`card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleFoodTypeSelect(f)}
                      style={{
                        cursor: 'pointer',
                        padding: '1rem',
                        border: isSelected ? '2px solid var(--primary-terracotta)' : '1px solid var(--border-color)',
                        background: isSelected ? '#FFF8F6' : 'var(--surface-white)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <strong>{f.type}</strong>
                        <span style={{ color: 'var(--primary-terracotta)', fontWeight: 700 }}>
                          {formatCurrency(f.pricePerGuest)}/guest
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{f.desc}</p>
                    </div>
                  );
                })}
              </div>

              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Included Menu Courses:
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {ALL_FOOD_ITEMS.map((item) => {
                  const isChecked = (draft.food?.items || []).includes(item);
                  return (
                    <label
                      key={item}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.4rem 0.75rem',
                        background: isChecked ? 'var(--sage-light)' : 'var(--surface-beige)',
                        color: isChecked ? 'var(--secondary-sage)' : 'var(--text-charcoal)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontWeight: isChecked ? 600 : 400,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleFoodItemToggle(item)}
                      />
                      <span>{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. MUSIC, ENTERTAINMENT & PHOTOGRAPHY */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-terracotta)' }}>
                  music_note
                </span>
                <span>Music, Live Acts & Photography</span>
              </h3>

              {/* Music */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  Live Music & DJ Console
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {MUSIC_OPTIONS.map((m) => {
                    const isSelected = draft.music?.type === m.type;
                    return (
                      <div
                        key={m.type}
                        className={`card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleMusicSelect(m)}
                        style={{
                          cursor: 'pointer',
                          padding: '0.75rem',
                          border: isSelected ? '2px solid var(--primary-terracotta)' : '1px solid var(--border-color)',
                          background: isSelected ? '#FFF8F6' : 'var(--surface-white)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                          <strong>{m.type}</strong>
                          <span style={{ color: 'var(--primary-terracotta)', fontWeight: 600 }}>
                            {formatCurrency(m.price)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Entertainment */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  Stage Performance & Entertainment
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {ENTERTAINMENT_OPTIONS.map((ent) => {
                    const isSelected = draft.entertainment?.type === ent.type;
                    return (
                      <div
                        key={ent.type}
                        className={`card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleEntertainmentSelect(ent)}
                        style={{
                          cursor: 'pointer',
                          padding: '0.75rem',
                          border: isSelected ? '2px solid var(--primary-terracotta)' : '1px solid var(--border-color)',
                          background: isSelected ? '#FFF8F6' : 'var(--surface-white)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                          <strong>{ent.type}</strong>
                          <span style={{ color: 'var(--primary-terracotta)', fontWeight: 600 }}>
                            {formatCurrency(ent.price)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Photography */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  Photography & Cinematic Drone Package
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {PHOTO_OPTIONS.map((photo) => {
                    const isSelected = draft.photography?.package === photo.package;
                    return (
                      <div
                        key={photo.package}
                        className={`card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handlePhotoSelect(photo)}
                        style={{
                          cursor: 'pointer',
                          padding: '0.75rem',
                          border: isSelected ? '2px solid var(--primary-terracotta)' : '1px solid var(--border-color)',
                          background: isSelected ? '#FFF8F6' : 'var(--surface-white)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                          <strong>{photo.package}</strong>
                          <span style={{ color: 'var(--primary-terracotta)', fontWeight: 600 }}>
                            {formatCurrency(photo.price)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 5. ADDITIONAL SERVICES */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-terracotta)' }}>
                  add_task
                </span>
                <span>Additional Bespoke Services</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {SERVICE_OPTIONS.map((svc) => {
                  const isChecked = (draft.additionalServices || []).some((s) => s.name === svc.name);
                  return (
                    <label
                      key={svc.name}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.6rem',
                        padding: '0.85rem',
                        border: isChecked ? '1px solid var(--primary-terracotta)' : '1px solid var(--border-color)',
                        background: isChecked ? '#FFF8F6' : 'var(--surface-white)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleServiceToggle(svc)}
                        style={{ marginTop: '0.2rem' }}
                      />
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.9rem' }}>{svc.name}</strong>
                          <span style={{ color: 'var(--primary-terracotta)', fontWeight: 600, fontSize: '0.85rem' }}>
                            {formatCurrency(svc.price)}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>{svc.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: DESKTOP STICKY LIVE PRICE DRAWER */}
          <div
            className="price-drawer-desktop"
            style={{
              position: 'sticky',
              top: '90px',
              background: 'var(--surface-white)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              Live Price Summary
            </h3>

            <div style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Event Occasion:</span>
                <strong>{draft.eventType}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Venue:</span>
                <strong>{draft.venueName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date & Capacity:</span>
                <strong>{draft.eventDate || 'Select Date'} ({draft.guestCount} Guests)</strong>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed var(--border-color)', margin: '0.75rem 0' }} />

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                <span>Venue Rental</span>
                <strong>{formatCurrency(p.venueBase)}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                <span>Decoration</span>
                <strong>{formatCurrency(p.decoration)}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                <span>Food & Catering</span>
                <strong>{formatCurrency(p.food)}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                <span>Music & DJ</span>
                <strong>{formatCurrency(p.music)}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                <span>Entertainment</span>
                <strong>{formatCurrency(p.entertainment)}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                <span>Photography</span>
                <strong>{formatCurrency(p.photography)}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                <span>Extra Services</span>
                <strong>{formatCurrency(p.additionalServices)}</strong>
              </li>
              <li
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0 0.25rem',
                  borderTop: '2px solid var(--border-color)',
                  marginTop: '0.5rem',
                  fontSize: '1.15rem',
                  color: 'var(--primary-terracotta)',
                }}
              >
                <strong>Estimated Total</strong>
                <strong>{formatCurrency(p.totalAmount)}</strong>
              </li>
            </ul>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleProceed}
              disabled={Boolean(conflictMessage)}
            >
              <span>Proceed to Review →</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div
        className="mobile-sticky-bar"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--surface-white)',
          borderTop: '1px solid var(--border-color)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
          zIndex: 99,
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Estimated Total</span>
          <strong style={{ fontSize: '1.15rem', color: 'var(--primary-terracotta)' }}>
            {formatCurrency(p.totalAmount)}
          </strong>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleProceed}
          disabled={Boolean(conflictMessage)}
        >
          Proceed to Review →
        </button>
      </div>
    </div>
  );
}

export default Customize;
