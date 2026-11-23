import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleSelectCategory = (category) => {
    navigate(`/events?select=${encodeURIComponent(category)}`);
  };

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section className="section hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="subtitle">The Quintessential Event Planner</div>
              <h1>
                Plan a celebration <br />
                <span className="italic">worth remembering.</span>
              </h1>
              <p>
                Choose your event, match with handpicked architectural venues, and
                customize gastronomy, decor, and live entertainment — powered by MongoDB and REST APIs.
              </p>
              <div className="hero-actions">
                <Link to="/events" className="btn btn-primary btn-lg">
                  <span>Plan an Event</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <Link to="/venues" className="btn btn-secondary btn-lg">
                  <span className="material-symbols-outlined">domain</span>
                  <span>Explore Venues</span>
                </Link>
              </div>
            </div>

            <div className="hero-media">
              <div className="hero-image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80"
                  alt="Luxury Open-Air Evening Event Courtyard"
                />
              </div>
              <div className="hero-badge">
                <div className="badge-icon">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>
                    100% Conflict Prevention
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    MongoDB Scheduling Verification
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EVENT CATEGORIES SECTION */}
      <section className="section" style={{ backgroundColor: 'var(--surface-beige)' }}>
        <div className="container">
          <div className="section-title-wrapper text-center">
            <div className="subtitle">Curated Occasions</div>
            <h2>Whatever the occasion, make it memorable.</h2>
            <p>Select your event type to start your personalized planning experience.</p>
          </div>

          <div className="grid-3">
            {/* Birthday */}
            <div
              className="event-card card-hover"
              onClick={() => handleSelectCategory('Birthday')}
              style={{ cursor: 'pointer' }}
            >
              <div className="event-card-media">
                <img
                  src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80"
                  alt="Birthday Celebration"
                />
              </div>
              <div className="event-card-body">
                <h3>Birthday Celebration</h3>
                <p>Milestone birthdays, themed kids parties, and intimate candlelit dinners with custom decor.</p>
                <div className="event-card-footer">
                  <span>Start Planning</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </div>
              </div>
            </div>

            {/* Wedding */}
            <div
              className="event-card card-hover"
              onClick={() => handleSelectCategory('Wedding')}
              style={{ cursor: 'pointer' }}
            >
              <div className="event-card-media">
                <img
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80"
                  alt="Wedding Reception"
                />
              </div>
              <div className="event-card-body">
                <h3>Wedding & Reception</h3>
                <p>Bespoke floral mandaps, grand ballrooms, luxury catering, and unforgettable moments.</p>
                <div className="event-card-footer">
                  <span>Start Planning</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </div>
              </div>
            </div>

            {/* Party */}
            <div
              className="event-card card-hover"
              onClick={() => handleSelectCategory('Party')}
              style={{ cursor: 'pointer' }}
            >
              <div className="event-card-media">
                <img
                  src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80"
                  alt="Social Party"
                />
              </div>
              <div className="event-card-body">
                <h3>Social Party & Gala</h3>
                <p>Cocktail nights, anniversary galas, DJ sets, and rooftop lounge gatherings.</p>
                <div className="event-card-footer">
                  <span>Start Planning</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </div>
              </div>
            </div>

            {/* Graduation */}
            <div
              className="event-card card-hover"
              onClick={() => handleSelectCategory('Graduation')}
              style={{ cursor: 'pointer' }}
            >
              <div className="event-card-media">
                <img
                  src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80"
                  alt="Graduation Event"
                />
              </div>
              <div className="event-card-body">
                <h3>Graduation & Convocation</h3>
                <p>Celebrate academic milestones with friends, family, and memorable evening banquets.</p>
                <div className="event-card-footer">
                  <span>Start Planning</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </div>
              </div>
            </div>

            {/* Corporate */}
            <div
              className="event-card card-hover"
              onClick={() => handleSelectCategory('Corporate')}
              style={{ cursor: 'pointer' }}
            >
              <div className="event-card-media">
                <img
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80"
                  alt="Corporate Event"
                />
              </div>
              <div className="event-card-body">
                <h3>Corporate & Executive</h3>
                <p>Conferences, hackathons, product launches, annual banquets, and executive retreats.</p>
                <div className="event-card-footer">
                  <span>Start Planning</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </div>
              </div>
            </div>

            {/* Custom */}
            <div
              className="event-card card-hover"
              onClick={() => handleSelectCategory('Other')}
              style={{ cursor: 'pointer' }}
            >
              <div className="event-card-media">
                <img
                  src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80"
                  alt="Custom Event"
                />
              </div>
              <div className="event-card-body">
                <h3>Custom Celebration</h3>
                <p>Have a unique vision? Tailor every aspect of decor, menu, and entertainment.</p>
                <div className="event-card-footer">
                  <span>Start Planning</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-title-wrapper text-center">
            <div className="subtitle">Seamless Journey</div>
            <h2>How EventEase Works</h2>
            <p>From initial vision to confirmation in 5 easy steps.</p>
          </div>

          <div
            className="grid-3"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
            }}
          >
            <div className="card text-center">
              <div
                className="step-number"
                style={{
                  margin: '0 auto 0.75rem',
                  backgroundColor: 'var(--primary-terracotta)',
                  color: 'white',
                }}
              >
                1
              </div>
              <h4>Choose Event</h4>
              <p style={{ fontSize: '0.85rem' }}>Select Birthday, Wedding, Corporate, or Party.</p>
            </div>
            <div className="card text-center">
              <div
                className="step-number"
                style={{
                  margin: '0 auto 0.75rem',
                  backgroundColor: 'var(--primary-terracotta)',
                  color: 'white',
                }}
              >
                2
              </div>
              <h4>Choose Venue</h4>
              <p style={{ fontSize: '0.85rem' }}>Match with top handpicked architectural venues.</p>
            </div>
            <div className="card text-center">
              <div
                className="step-number"
                style={{
                  margin: '0 auto 0.75rem',
                  backgroundColor: 'var(--primary-terracotta)',
                  color: 'white',
                }}
              >
                3
              </div>
              <h4>Customize</h4>
              <p style={{ fontSize: '0.85rem' }}>Pick Decor, Food, Music & see instant Live Price.</p>
            </div>
            <div className="card text-center">
              <div
                className="step-number"
                style={{
                  margin: '0 auto 0.75rem',
                  backgroundColor: 'var(--primary-terracotta)',
                  color: 'white',
                }}
              >
                4
              </div>
              <h4>Review</h4>
              <p style={{ fontSize: '0.85rem' }}>Review itemized breakdown and enter details.</p>
            </div>
            <div className="card text-center">
              <div
                className="step-number"
                style={{
                  margin: '0 auto 0.75rem',
                  backgroundColor: 'var(--secondary-sage)',
                  color: 'white',
                }}
              >
                5
              </div>
              <h4>Confirmed</h4>
              <p style={{ fontSize: '0.85rem' }}>Receive a reference ID & instant booking ticket.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="section" style={{ backgroundColor: 'var(--text-charcoal)', color: 'var(--surface-white)' }}>
        <div className="container text-center" style={{ maxWidth: '800px' }}>
          <h2 style={{ color: 'var(--surface-white)', marginBottom: '1rem' }}>
            Ready to bring your event to life?
          </h2>
          <p style={{ color: '#DDD', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Browse our verified venues or explore all community events stored securely in MongoDB.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/events" className="btn btn-primary btn-lg">
              Start Planning Event
            </Link>
            <Link to="/admin" className="btn btn-secondary btn-lg" style={{ borderColor: '#666', color: '#FFF' }}>
              Open Admin Console
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
