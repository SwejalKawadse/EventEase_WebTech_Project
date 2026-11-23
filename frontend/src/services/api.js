/**
 * EventEase Frontend API Service
 * Centralizes all HTTP communication with the Express/MongoDB backend.
 */

const API_BASE = 'https://eventease-backend-ime3.onrender.com/api';

/**
 * Generic Fetch wrapper with JSON parsing and error extraction
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const connErr = new Error('Cannot connect to EventEase backend server. Please verify backend is running on https://eventease-backend-ime3.onrender.com');
      connErr.status = 503;
      throw connErr;
    }
    throw error;
  }
}

// -------------------------------------------------------------
// EVENT APIs (Full CRUD + Conflict Detection)
// -------------------------------------------------------------

export const getEvents = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.date) query.append('date', params.date);
  if (params.venue) query.append('venue', params.venue);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return request(`/events${qs}`);
};

export const getEventById = async (id) => {
  return request(`/events/${id}`);
};

export const createEvent = async (eventData) => {
  return request('/events', {
    method: 'POST',
    body: eventData,
  });
};

export const updateEvent = async (id, eventData) => {
  return request(`/events/${id}`, {
    method: 'PUT',
    body: eventData,
  });
};

export const deleteEvent = async (id) => {
  return request(`/events/${id}`, {
    method: 'DELETE',
  });
};

export const checkEventConflict = async ({ venue, eventDate, excludeId }) => {
  return request('/events/check-conflict', {
    method: 'POST',
    body: { venue, eventDate, excludeId },
  });
};

// -------------------------------------------------------------
// VENUE APIs
// -------------------------------------------------------------

export const getVenues = async () => {
  return request('/venues');
};

export const getVenueById = async (id) => {
  return request(`/venues/${id}`);
};

export const createVenue = async (venueData) => {
  return request('/venues', {
    method: 'POST',
    body: venueData,
  });
};

export const updateVenue = async (id, venueData) => {
  return request(`/venues/${id}`, {
    method: 'PUT',
    body: venueData,
  });
};

export const deleteVenue = async (id) => {
  return request(`/venues/${id}`, {
    method: 'DELETE',
  });
};

// -------------------------------------------------------------
// BOOKING APIs (Customer & Admin)
// -------------------------------------------------------------

export const getBookings = async () => {
  return request('/bookings');
};

export const getBookingById = async (id) => {
  return request(`/bookings/${id}`);
};

export const createBooking = async (bookingData) => {
  return request('/bookings', {
    method: 'POST',
    body: bookingData,
  });
};

export const updateBookingStatus = async (id, status) => {
  return request(`/bookings/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
};

export const deleteBooking = async (id) => {
  return request(`/bookings/${id}`, {
    method: 'DELETE',
  });
};

export const checkBookingConflict = async ({ venueName, eventDate, excludeBookingId }) => {
  return request('/bookings/check-conflict', {
    method: 'POST',
    body: { venueName, eventDate, excludeBookingId },
  });
};

// -------------------------------------------------------------
// System Health Check
// -------------------------------------------------------------

export const getHealth = async () => {
  return request('/health');
};
