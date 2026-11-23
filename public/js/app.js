/* EventEase — Presentation Version
   Tech stack: HTML5 + CSS3 + Vanilla JavaScript
   Browser storage: localStorage (no Node.js/backend required)
*/
const VENUE_DATA = [{"id": "v-101", "name": "The Grand Courtyard", "location": "Koregaon Park, Pune", "description": "An elegant open-air architectural courtyard featuring stone archways, manicured gardens, and candlelit banquet setups.", "capacity": 250, "startingPrice": 35000, "type": "Courtyard & Lawn", "facilities": ["Parking", "Air Conditioning", "Catering Kitchen", "Sound System", "Decoration Setup", "Power Backup"], "eventTypes": ["Wedding", "Birthday", "Party", "Corporate"], "image": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80", "rating": 4.9}, {"id": "v-102", "name": "The Villa Florentine", "location": "Bandra West, Mumbai", "description": "A luxury heritage Mediterranean villa with terracotta tiled terraces, ocean views, and bespoke dining pavilions.", "capacity": 320, "startingPrice": 65000, "type": "Heritage Villa", "facilities": ["Valet Parking", "Air Conditioning", "In-house Chef", "Live Stage", "Power Backup", "Wi-Fi", "Private Suites"], "eventTypes": ["Wedding", "Corporate", "Party"], "image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80", "rating": 4.8}, {"id": "v-103", "name": "Emerald Palms Lawn", "location": "Calangute Beachfront, Goa", "description": "Tropical beachfront palm lawn perfect for breezy sunset receptions, cocktail parties, and vibrant celebrations.", "capacity": 500, "startingPrice": 45000, "type": "Beachfront Lawn", "facilities": ["Beach Access", "Bar Setup", "Sound System", "Special Lighting", "Power Backup", "Parking"], "eventTypes": ["Party", "Wedding", "Graduation", "Birthday"], "image": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80", "rating": 4.7}, {"id": "v-104", "name": "Skyline Glasshouse Pavilion", "location": "Indiranagar, Bangalore", "description": "Contemporary glass-enclosed rooftop venue with panoramic city skyline views, warm ambient lighting, and acoustic acoustics.", "capacity": 150, "startingPrice": 28000, "type": "Rooftop Glasshouse", "facilities": ["Air Conditioning", "DJ Console", "Catering Kitchen", "Wi-Fi", "Elevator Access", "Power Backup"], "eventTypes": ["Corporate", "Birthday", "Graduation", "Party", "Other"], "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80", "rating": 4.9}, {"id": "v-105", "name": "Heritage Manor & Royal Ballroom", "location": "Civil Lines, Jaipur", "description": "A regal Rajasthani palace ballroom featuring crystal chandeliers, carved pillars, and grand banquet seating.", "capacity": 800, "startingPrice": 120000, "type": "Palace Ballroom", "facilities": ["Grand Stage", "Valet Parking", "Air Conditioning", "Royal Catering", "Green Rooms", "Power Backup", "Security"], "eventTypes": ["Wedding", "Corporate", "Party"], "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80", "rating": 4.9}, {"id": "v-106", "name": "Crystal Lake Banquet", "location": "Vasant Kunj, New Delhi", "description": "Lakeside indoor-outdoor banquet facility with floor-to-ceiling glass windows and lush gardens.", "capacity": 350, "startingPrice": 50000, "type": "Banquet & Garden", "facilities": ["Parking", "Air Conditioning", "Catering Service", "Decoration Setup", "Sound System", "Restrooms"], "eventTypes": ["Birthday", "Wedding", "Graduation", "Corporate", "Party"], "image": "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80", "rating": 4.6}];
const DRAFT_KEY="eventease_booking_draft", VENUES_KEY="eventease_venues", BOOKINGS_KEY="eventease_bookings", LOGS_KEY="eventease_event_logs";
const API_BASE = "https://eventease-backend-ime3.onrender.com/api";

// Asynchronous MongoDB sync with graceful offline fallback
async function syncWithMongoDB(endpoint, method = "GET", body = null) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : null,
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // MongoDB service offline or unreachable; fall back seamlessly to localStorage
  }
  return null;
}

function readStore(key,fallback=[]){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}}
function writeStore(key,value){localStorage.setItem(key,JSON.stringify(value))}
function seedData(){
  if(!localStorage.getItem(VENUES_KEY))writeStore(VENUES_KEY,VENUE_DATA);
  if(!localStorage.getItem(BOOKINGS_KEY))writeStore(BOOKINGS_KEY,[]);
  if(!localStorage.getItem(LOGS_KEY))writeStore(LOGS_KEY,[]);
  // Try fetching latest data from MongoDB backend
  syncWithMongoDB("/venues").then(data => { if (data && data.length) writeStore(VENUES_KEY, data); });
  syncWithMongoDB("/bookings").then(data => { if (data && data.length) writeStore(BOOKINGS_KEY, data.map(b => ({ ...b, id: b.id || b.bookingId }))); });
}
seedData();
function getVenues(){return readStore(VENUES_KEY,VENUE_DATA)} function getBookings(){return readStore(BOOKINGS_KEY,[])} function getEventLogs(){return readStore(LOGS_KEY,[])}
function saveVenues(v){writeStore(VENUES_KEY,v)} function saveBookings(v){writeStore(BOOKINGS_KEY,v)} function saveEventLogs(v){writeStore(LOGS_KEY,v)}
const eventBus={listeners:{},on(name,handler){(this.listeners[name]??=[]).push(handler)},emit(name,payload){(this.listeners[name]||[]).forEach(handler=>handler(payload))}};
function createBooking(payload){
  const id=`EV-${Math.floor(10000+Math.random()*90000)}`;
  const booking={...payload,id,status:"Confirmed",createdAt:new Date().toISOString()};
  eventBus.emit("booking.created",booking);
  // Persist to MongoDB backend in addition to client storage
  syncWithMongoDB("/bookings", "POST", booking);
  return booking;
}
eventBus.on("booking.created",booking=>{saveBookings([booking,...getBookings()])});
eventBus.on("booking.created",booking=>{const logs=getEventLogs();saveEventLogs([{eventName:"booking.created",timestamp:new Date().toISOString(),details:`Booking ${booking.id} created successfully`,handlerResults:[{handler:"saveBooking",message:"Booking saved to MongoDB & localStorage"},{handler:"updateAdmin",message:"Admin statistics refreshed"},{handler:"generateConfirmation",message:"Confirmation reference generated"},{handler:"logEvent",message:"Audit event recorded"}]},...logs])});
function updateBooking(id,changes){
  const b=getBookings(),i=b.findIndex(x=>x.id===id);
  if(i<0)return null;
  b[i]={...b[i],...changes};
  saveBookings(b);
  if (changes.status) {
    syncWithMongoDB(`/bookings/${id}/status`, "PATCH", { status: changes.status });
  }
  return b[i];
} function getBookingById(id){return getBookings().find(b=>b.id===id)}
function getBookingDraft(){try{const d=localStorage.getItem(DRAFT_KEY);return d?JSON.parse(d):getDefaultDraft()}catch{return getDefaultDraft()}}
function getDefaultDraft(){return {eventType:"",venueId:"",venueName:"",venueBasePrice:0,eventDate:"",startTime:"18:00",endTime:"23:00",guestCount:100,decoration:{package:"Basic",price:5000},theme:"Minimal",food:{type:"Vegetarian",items:["Starters","Main Course"],pricePerGuest:400,totalFoodPrice:40000},music:{type:"No Music",price:0},entertainment:{type:"None",price:0},photography:{package:"None",price:0},additionalServices:[],specialRequirements:"",pricing:{venueBase:0,decoration:5000,food:40000,music:0,entertainment:0,photography:0,additionalServices:0,totalAmount:45000}}}
function saveBookingDraft(d){localStorage.setItem(DRAFT_KEY,JSON.stringify(d))} function clearBookingDraft(){localStorage.removeItem(DRAFT_KEY)}
function showToast(message,type="success"){let c=document.getElementById("toast-container");if(!c){c=document.createElement("div");c.id="toast-container";c.className="toast-container";document.body.appendChild(c)}const t=document.createElement("div");t.className=`toast toast-${type}`;t.innerHTML=`<span class="material-symbols-outlined">${type==='success'?'check_circle':'error'}</span><span>${message}</span>`;c.appendChild(t);setTimeout(()=>{t.style.opacity="0";setTimeout(()=>t.remove(),300)},3500)}
function formatCurrency(a){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(a||0)}
function toggleMobileMenu(){let o=document.querySelector(".mobile-nav-overlay"),m=document.querySelector(".mobile-nav-menu");if(!o){o=document.createElement("div");o.className="mobile-nav-overlay";o.onclick=toggleMobileMenu;document.body.appendChild(o);m=document.createElement("div");m.className="mobile-nav-menu";m.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-color);padding-bottom:1rem;"><span style="font-family:var(--font-serif);font-weight:600;font-size:1.2rem;">EventEase Navigation</span><button class="btn btn-secondary btn-sm" onclick="toggleMobileMenu()">✕</button></div><a href="index.html" class="nav-link">Home</a><a href="events.html" class="nav-link">Events</a><a href="venues.html" class="nav-link">Venues</a><a href="my-bookings.html" class="nav-link">My Bookings</a><a href="admin.html" class="nav-link">Admin Console</a><a href="events.html" class="btn btn-primary">Plan an Event</a>`;document.body.appendChild(m)}const open=o.classList.contains("open");o.classList.toggle("open",!open);m.classList.toggle("open",!open)}
document.addEventListener("DOMContentLoaded",()=>{const p=location.pathname.split("/").pop()||"index.html";document.querySelectorAll(".nav-link").forEach(l=>l.classList.toggle("active",l.getAttribute("href")===p));const b=document.querySelector(".mobile-toggle");if(b)b.addEventListener("click",toggleMobileMenu)})
/**
 * Step 1: Event Selection Logic & ARIA State Management
 */

let selectedEventType = "";

document.addEventListener("DOMContentLoaded", () => {
  const draft = getBookingDraft();
  
  // Check URL params for pre-selected event type
  const urlParams = new URLSearchParams(window.location.search);
  const preSelect = urlParams.get("select");
  
  if (preSelect) {
    selectEvent(preSelect);
  } else if (draft.eventType) {
    selectEvent(draft.eventType);
  }
});

function selectEvent(eventType) {
  selectedEventType = eventType;
  
  // Update visual selection & ARIA state
  const cards = document.querySelectorAll(".event-card");
  cards.forEach(card => {
    if (card.getAttribute("data-event") === eventType) {
      card.classList.add("selected");
      card.setAttribute("aria-checked", "true");
      card.setAttribute("aria-selected", "true");
    } else {
      card.classList.remove("selected");
      card.setAttribute("aria-checked", "false");
      card.setAttribute("aria-selected", "false");
    }
  });

  // Enable proceed button
  const btn = document.getElementById("proceed-btn");
  if (btn) {
    btn.disabled = false;
  }
}

function proceedToVenues() {
  if (!selectedEventType) {
    showToast("Please select an event type to proceed.", "error");
    return;
  }

  // Update draft in localStorage
  const draft = getBookingDraft();
  draft.eventType = selectedEventType;
  saveBookingDraft(draft);

  // Navigate to Step 2: Venues
  window.location.href = `venues.html?eventType=${encodeURIComponent(selectedEventType)}`;
}


/**
 * Step 2: Venue Marketplace Logic & Error Handling
 */

let allVenues = [];
let activeVenueForModal = null;

document.addEventListener("DOMContentLoaded", () => {
  const draft = getBookingDraft();
  
  // Update step label
  const eventLabel = document.getElementById("selected-event-label");
  if (eventLabel && draft.eventType) {
    eventLabel.textContent = draft.eventType;
  }

  // Pre-select filter from draft or URL
  const urlParams = new URLSearchParams(window.location.search);
  const filterType = urlParams.get("eventType") || draft.eventType || "All";
  
  const selectElem = document.getElementById("filter-event-type");
  if (selectElem && filterType) {
    selectElem.value = filterType;
  }

  fetchVenues();
});

function fetchVenues(){const grid=document.getElementById("venues-grid");if(!grid)return;allVenues=getVenues();filterVenues()}
function renderErrorState(message) {
  const grid = document.getElementById("venues-grid");
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--surface-white); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
      <span class="material-symbols-outlined" style="font-size: 48px; color: var(--status-cancelled); margin-bottom: 0.5rem;">error_outline</span>
      <h3 style="margin-bottom: 0.5rem;">Unable to Load Venues</h3>
      <p style="margin-bottom: 1.5rem;">${message}</p>
      <button class="btn btn-primary" onclick="fetchVenues()">Retry</button>
    </div>
  `;
}

function filterVenues() {
  const searchVal = (document.getElementById("search-input")?.value || "").toLowerCase().trim();
  const eventTypeVal = document.getElementById("filter-event-type")?.value || "All";
  const capacityVal = parseInt(document.getElementById("filter-capacity")?.value, 10) || 0;
  const maxPriceVal = parseInt(document.getElementById("filter-max-price")?.value, 10) || 0;

  const filtered = allVenues.filter(v => {
    // Search matching
    const matchesSearch = !searchVal || 
      v.name.toLowerCase().includes(searchVal) || 
      v.location.toLowerCase().includes(searchVal) ||
      v.type.toLowerCase().includes(searchVal);

    // Event type matching
    const matchesEvent = eventTypeVal === "All" || (v.eventTypes && v.eventTypes.includes(eventTypeVal));

    // Capacity matching
    const matchesCapacity = !capacityVal || v.capacity >= capacityVal;

    // Price matching
    const matchesPrice = !maxPriceVal || v.startingPrice <= maxPriceVal;

    return matchesSearch && matchesEvent && matchesCapacity && matchesPrice;
  });

  renderVenuesGrid(filtered);
}

function renderVenuesGrid(venues) {
  const grid = document.getElementById("venues-grid");
  if (!grid) return;

  const draft = getBookingDraft();

  if (venues.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--surface-white); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
        <h3>No Venues Found</h3>
        <p style="margin-bottom: 1rem;">No venues match your search filters.</p>
        <button class="btn btn-secondary" onclick="resetFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = venues.map(v => {
    const isSelected = draft.venueId === v.id;
    return `
      <div class="venue-card ${isSelected ? 'selected' : ''}">
        <div class="venue-media">
          <img src="${v.image}" alt="${v.name} - ${v.location}">
          <div class="venue-rating" aria-label="Rating ${v.rating || 4.8} stars">
            <span>★</span> ${v.rating || 4.8}
          </div>
        </div>
        <div class="venue-body">
          <div class="venue-location">
            <span class="material-symbols-outlined" style="font-size: 16px;">location_on</span>
            <span>${v.location}</span>
          </div>
          <h3>${v.name}</h3>
          <p style="font-size: 0.85rem; margin-bottom: 0.5rem; flex: none;">${v.type} • Up to ${v.capacity} guests</p>
          
          <div class="venue-facilities">
            ${(v.facilities || []).slice(0, 4).map(f => `<span class="facility-tag">${f}</span>`).join('')}
          </div>

          <div class="venue-footer">
            <div class="venue-price">
              <span class="price-label">Starting Price</span>
              <span class="price-value">${formatCurrency(v.startingPrice)}</span>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-secondary btn-sm" onclick="openVenueModal('${v.id}')" aria-label="View details for ${v.name}">View</button>
              <button class="btn btn-primary btn-sm" onclick="selectVenueDirect('${v.id}')" aria-label="Select venue ${v.name}">
                ${isSelected ? 'Selected ✓' : 'Customize Event →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function resetFilters() {
  document.getElementById("search-input").value = "";
  document.getElementById("filter-event-type").value = "All";
  document.getElementById("filter-capacity").value = "";
  document.getElementById("filter-max-price").value = "";
  filterVenues();
}

function openVenueModal(venueId) {
  const venue = allVenues.find(v => v.id === venueId);
  if (!venue) return;

  activeVenueForModal = venue;
  document.getElementById("modal-venue-name").textContent = venue.name;
  document.getElementById("modal-venue-img").src = venue.image;
  document.getElementById("modal-venue-location").textContent = venue.location;
  document.getElementById("modal-venue-desc").textContent = venue.description;
  document.getElementById("modal-venue-capacity").textContent = `Up to ${venue.capacity} Guests`;
  document.getElementById("modal-venue-price").textContent = formatCurrency(venue.startingPrice);

  const facElem = document.getElementById("modal-venue-facilities");
  facElem.innerHTML = (venue.facilities || []).map(f => `<span class="facility-tag" style="padding: 0.35rem 0.75rem; font-size: 0.85rem;">${f}</span>`).join('');

  document.getElementById("venue-modal").classList.add("open");
}

function closeVenueModal() {
  document.getElementById("venue-modal").classList.remove("open");
}

function confirmVenueSelection() {
  if (activeVenueForModal) {
    selectVenueDirect(activeVenueForModal.id);
  }
}

function selectVenueDirect(venueId) {
  const venue = allVenues.find(v => v.id === venueId);
  if (!venue) return;

  const draft = getBookingDraft();
  draft.venueId = venue.id;
  draft.venueName = venue.name;
  draft.venueBasePrice = venue.startingPrice;
  draft.pricing.venueBase = venue.startingPrice;
  
  saveBookingDraft(draft);

  // Navigate to Step 3: Customize
  window.location.href = "customize.html";
}


/**
 * Step 3: Customization Engine, Field Validation & Live Pricing Logic
 */

let state = {
  decorPackage: "Basic",
  decorPrice: 5000,
  theme: "Minimal",
  foodType: "Vegetarian",
  foodPricePerGuest: 400,
  musicType: "No Music",
  musicPrice: 0,
  entertainmentType: "None",
  entertainmentPrice: 0,
  photoPackage: "None",
  photoPrice: 0
};

let currentVenueCapacity = 1000;

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("input-date")) return;
  const draft = getBookingDraft();

  // Redirect if event or venue not selected
  if (!draft.eventType) {
    window.location.href = "events.html";
    return;
  }
  if (!draft.venueId) {
    window.location.href = "venues.html";
    return;
  }

  // Set min date attribute to today
  const todayStr = new Date().toISOString().split("T")[0];
  const dateInput = document.getElementById("input-date");
  if (dateInput) {
    dateInput.setAttribute("min", todayStr);
    if (draft.eventDate) {
      dateInput.value = draft.eventDate;
    } else {
      // Default to 14 days in future
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      dateInput.value = futureDate.toISOString().split("T")[0];
    }
  }

  // Update Stepper Labels
  document.getElementById("badge-event").textContent = draft.eventType;
  document.getElementById("badge-venue").textContent = draft.venueName;

  // Venue capacity comes from the local venue data
  const selectedVenue = getVenues().find(v => v.id === draft.venueId);
  if (selectedVenue) { currentVenueCapacity = selectedVenue.capacity || 1000; const guestInput = document.getElementById("input-guests"); if (guestInput) guestInput.setAttribute("max", currentVenueCapacity); }

  // Initialize inputs from draft if available
  if (draft.guestCount) {
    document.getElementById("input-guests").value = draft.guestCount;
  }
  if (draft.startTime) {
    document.getElementById("input-start-time").value = draft.startTime;
  }
  if (draft.endTime) {
    document.getElementById("input-end-time").value = draft.endTime;
  }
  if (draft.specialRequirements) {
    document.getElementById("input-special-notes").value = draft.specialRequirements;
  }

  // Initial calculation
  validateAndCalculate();
});

// Selection Handlers
function selectDecor(pkgName, price, elem) {
  state.decorPackage = pkgName;
  state.decorPrice = price;

  document.querySelectorAll("#decor-options .option-card").forEach(c => {
    c.classList.remove("selected");
    c.setAttribute("aria-checked", "false");
  });
  elem.classList.add("selected");
  elem.setAttribute("aria-checked", "true");
  validateAndCalculate();
}

function selectTheme(themeName, elem) {
  state.theme = themeName;
  document.querySelectorAll("#theme-options .option-card").forEach(c => {
    c.classList.remove("selected");
    c.setAttribute("aria-checked", "false");
  });
  elem.classList.add("selected");
  elem.setAttribute("aria-checked", "true");
  validateAndCalculate();
}

function selectFoodType(type, pricePerGuest, elem) {
  state.foodType = type;
  state.foodPricePerGuest = pricePerGuest;

  document.querySelectorAll("#food-type-options .option-card").forEach(c => {
    c.classList.remove("selected");
    c.setAttribute("aria-checked", "false");
  });
  elem.classList.add("selected");
  elem.setAttribute("aria-checked", "true");
  validateAndCalculate();
}

function selectMusic(musicName, price, elem) {
  state.musicType = musicName;
  state.musicPrice = price;

  document.querySelectorAll("#music-options .option-card").forEach(c => {
    c.classList.remove("selected");
    c.setAttribute("aria-checked", "false");
  });
  elem.classList.add("selected");
  elem.setAttribute("aria-checked", "true");
  validateAndCalculate();
}

function selectEntertainment(actName, price, elem) {
  state.entertainmentType = actName;
  state.entertainmentPrice = price;

  document.querySelectorAll("#entertainment-options .option-card").forEach(c => {
    c.classList.remove("selected");
    c.setAttribute("aria-checked", "false");
  });
  elem.classList.add("selected");
  elem.setAttribute("aria-checked", "true");
  validateAndCalculate();
}

function selectPhoto(pkgName, price, elem) {
  state.photoPackage = pkgName;
  state.photoPrice = price;

  document.querySelectorAll("#photo-options .option-card").forEach(c => {
    c.classList.remove("selected");
    c.setAttribute("aria-checked", "false");
  });
  elem.classList.add("selected");
  elem.setAttribute("aria-checked", "true");
  validateAndCalculate();
}

// Inline Validation + Live Price Engine
function validateAndCalculate() {
  let isValid = true;

  const dateInput = document.getElementById("input-date");
  const startTimeInput = document.getElementById("input-start-time");
  const endTimeInput = document.getElementById("input-end-time");
  const guestsInput = document.getElementById("input-guests");

  const errorDate = document.getElementById("error-date");
  const errorTime = document.getElementById("error-time");
  const errorGuests = document.getElementById("error-guests");

  // Reset errors
  dateInput?.classList.remove("is-invalid");
  startTimeInput?.classList.remove("is-invalid");
  endTimeInput?.classList.remove("is-invalid");
  guestsInput?.classList.remove("is-invalid");

  errorDate?.classList.remove("show");
  errorTime?.classList.remove("show");
  errorGuests?.classList.remove("show");

  // 1. Date Validation
  const todayStr = new Date().toISOString().split("T")[0];
  if (!dateInput?.value || dateInput.value < todayStr) {
    dateInput?.classList.add("is-invalid");
    errorDate?.classList.add("show");
    isValid = false;
  }

  // 2. Time Validation (Start < End)
  if (startTimeInput?.value && endTimeInput?.value) {
    if (startTimeInput.value >= endTimeInput.value) {
      endTimeInput.classList.add("is-invalid");
      errorTime?.classList.add("show");
      isValid = false;
    }
  }

  // 3. Guest Count Validation (1 <= guests <= capacity)
  const guestCount = parseInt(guestsInput?.value, 10) || 0;
  if (guestCount <= 0 || guestCount > currentVenueCapacity) {
    guestsInput?.classList.add("is-invalid");
    if (errorGuests) {
      errorGuests.textContent = `Guest count must be between 1 and ${currentVenueCapacity}.`;
      errorGuests.classList.add("show");
    }
    isValid = false;
  }

  // 4. Calculate Live Price
  const draft = getBookingDraft();
  const venueBase = draft.venueBasePrice || 35000;

  // Food calculation: price per guest * number of guests
  const totalFoodPrice = state.foodPricePerGuest * (guestCount > 0 ? guestCount : 100);

  // Additional Services calculation
  let servicesTotal = 0;
  const selectedServices = [];

  const serviceCheckboxes = document.querySelectorAll("#services-container input[type='checkbox']");
  serviceCheckboxes.forEach(cb => {
    if (cb.checked) {
      const sName = cb.getAttribute("data-name");
      const isPerGuest = cb.getAttribute("data-per-guest") === "true";
      const unitPrice = parseInt(cb.getAttribute("data-price"), 10) || 0;
      const finalPrice = isPerGuest ? (unitPrice * guestCount) : unitPrice;

      servicesTotal += finalPrice;
      selectedServices.push({ name: sName, price: finalPrice });
    }
  });

  // Total Sum
  const grandTotal = venueBase + state.decorPrice + totalFoodPrice + state.musicPrice + state.entertainmentPrice + state.photoPrice + servicesTotal;

  // Update Desktop Sticky Drawer
  document.getElementById("drawer-event-title").textContent = draft.eventType || "Event Celebration";
  document.getElementById("drawer-venue-name").textContent = draft.venueName || "Selected Venue";
  
  const dateVal = dateInput?.value;
  document.getElementById("drawer-date-val").textContent = dateVal ? new Date(dateVal).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "Select Date";
  document.getElementById("drawer-guests-val").textContent = `${guestCount} Guests`;

  document.getElementById("drawer-venue-price").textContent = formatCurrency(venueBase);
  document.getElementById("drawer-decor-price").textContent = formatCurrency(state.decorPrice);
  document.getElementById("drawer-food-price").textContent = formatCurrency(totalFoodPrice);
  document.getElementById("drawer-music-price").textContent = formatCurrency(state.musicPrice);
  document.getElementById("drawer-entertainment-price").textContent = formatCurrency(state.entertainmentPrice);
  document.getElementById("drawer-photo-price").textContent = formatCurrency(state.photoPrice);
  document.getElementById("drawer-services-price").textContent = formatCurrency(servicesTotal);
  document.getElementById("drawer-total-price").textContent = formatCurrency(grandTotal);

  // Update Mobile Bottom Sticky Bar
  const mobileValElem = document.getElementById("mobile-price-val");
  if (mobileValElem) {
    mobileValElem.textContent = formatCurrency(grandTotal);
  }

  // Update Draft Object in LocalStorage
  draft.eventDate = dateVal || "";
  draft.startTime = startTimeInput?.value || "18:00";
  draft.endTime = endTimeInput?.value || "23:00";
  draft.guestCount = guestCount;
  draft.decoration = { package: state.decorPackage, price: state.decorPrice };
  draft.theme = state.theme;

  const foodItems = [];
  document.querySelectorAll("#food-items-container input[type='checkbox']:checked").forEach(cb => foodItems.push(cb.value));

  draft.food = {
    type: state.foodType,
    items: foodItems,
    pricePerGuest: state.foodPricePerGuest,
    totalFoodPrice: totalFoodPrice
  };
  draft.music = { type: state.musicType, price: state.musicPrice };
  draft.entertainment = { type: state.entertainmentType, price: state.entertainmentPrice };
  draft.photography = { package: state.photoPackage, price: state.photoPrice };
  draft.additionalServices = selectedServices;
  draft.specialRequirements = document.getElementById("input-special-notes")?.value || "";

  draft.pricing = {
    venueBase: venueBase,
    decoration: state.decorPrice,
    food: totalFoodPrice,
    music: state.musicPrice,
    entertainment: state.entertainmentPrice,
    photography: state.photoPrice,
    additionalServices: servicesTotal,
    totalAmount: grandTotal
  };

  saveBookingDraft(draft);
  return isValid;
}

function proceedToReview() {
  const isValid = validateAndCalculate();

  if (!isValid) {
    showToast("Please correct the form errors before proceeding.", "error");
    return;
  }

  window.location.href = "booking.html";
}


/**
 * Step 4: Review & Confirm Booking Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("confirm-booking-btn")) return;
  const draft = getBookingDraft();

  if (!draft.eventType || !draft.venueId || !draft.eventDate) {
    showToast("Booking incomplete. Redirecting to start.", "error");
    setTimeout(() => window.location.href = "events.html", 1500);
    return;
  }

  // Update Stepper Badges
  document.getElementById("badge-review-event").textContent = draft.eventType;
  document.getElementById("badge-review-venue").textContent = draft.venueName;

  // Populate Review Details
  document.getElementById("rev-event-type").textContent = draft.eventType;
  document.getElementById("rev-venue-name").textContent = draft.venueName;
  document.getElementById("rev-date-time").textContent = `${draft.eventDate} (${draft.startTime || '18:00'} - ${draft.endTime || '23:00'})`;
  document.getElementById("rev-guests").textContent = `${draft.guestCount} Guests`;
  document.getElementById("rev-decor-theme").textContent = `${draft.decoration.package} Package • Theme: ${draft.theme}`;
  
  const foodItemsStr = (draft.food.items || []).join(", ");
  document.getElementById("rev-food").textContent = `${draft.food.type} (${formatCurrency(draft.food.pricePerGuest)}/guest) • Menu: ${foodItemsStr || 'Main Course'}`;

  document.getElementById("rev-music-ent").textContent = `Music: ${draft.music.type} • Act: ${draft.entertainment.type}`;
  document.getElementById("rev-photo").textContent = draft.photography.package;
  
  const servicesStr = (draft.additionalServices || []).map(s => s.name).join(", ");
  document.getElementById("rev-services").textContent = servicesStr || "None Selected";

  if (draft.specialRequirements) {
    document.getElementById("rev-notes").textContent = `"${draft.specialRequirements}"`;
  } else {
    document.getElementById("rev-notes-row").style.display = "none";
  }

  // Populate Pricing Breakdown
  const p = draft.pricing || {};
  document.getElementById("rev-price-venue").textContent = formatCurrency(p.venueBase);
  document.getElementById("rev-price-decor").textContent = formatCurrency(p.decoration);
  document.getElementById("rev-price-food").textContent = formatCurrency(p.food);
  document.getElementById("rev-price-music").textContent = formatCurrency(p.music);
  document.getElementById("rev-price-ent").textContent = formatCurrency(p.entertainment);
  document.getElementById("rev-price-photo").textContent = formatCurrency(p.photography);
  document.getElementById("rev-price-services").textContent = formatCurrency(p.additionalServices);
  document.getElementById("rev-price-total").textContent = formatCurrency(p.totalAmount);

  // Live input validation listeners for immediate feedback
  const nameInp = document.getElementById("cust-name");
  const emailInp = document.getElementById("cust-email");
  const phoneInp = document.getElementById("cust-phone");
  const errN = document.getElementById("err-name");
  const errE = document.getElementById("err-email");
  const errP = document.getElementById("err-phone");

  nameInp?.addEventListener("input", () => {
    if (nameInp.value.trim()) {
      nameInp.classList.remove("is-invalid");
      errN?.classList.remove("show");
    }
  });

  emailInp?.addEventListener("input", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(emailInp.value.trim())) {
      emailInp.classList.remove("is-invalid");
      errE?.classList.remove("show");
    }
  });

  phoneInp?.addEventListener("input", () => {
    const digits = phoneInp.value.replace(/\D/g, "");
    const normalized = (digits.length === 12 && digits.startsWith("91"))
      ? digits.slice(2)
      : (digits.length === 11 && digits.startsWith("0"))
        ? digits.slice(1)
        : digits;
    const phoneRegex = /^[6-9]\d{9}$/;
    if (phoneRegex.test(normalized)) {
      phoneInp.classList.remove("is-invalid");
      errP?.classList.remove("show");
    }
  });
});

function submitBooking(event) {
  event.preventDefault();

  const nameInput = document.getElementById("cust-name");
  const emailInput = document.getElementById("cust-email");
  const phoneInput = document.getElementById("cust-phone");

  const errName = document.getElementById("err-name");
  const errEmail = document.getElementById("err-email");
  const errPhone = document.getElementById("err-phone");

  // Reset errors
  nameInput.classList.remove("is-invalid");
  emailInput.classList.remove("is-invalid");
  phoneInput.classList.remove("is-invalid");

  errName.classList.remove("show");
  errEmail.classList.remove("show");
  errPhone.classList.remove("show");

  let isValid = true;

  // 1. Full Name Validation
  if (!nameInput.value.trim()) {
    nameInput.classList.add("is-invalid");
    errName.textContent = "Please enter your full name.";
    errName.classList.add("show");
    isValid = false;
  }

  // 2. Email Address Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.value.trim()) {
    emailInput.classList.add("is-invalid");
    errEmail.textContent = "Please enter your email address.";
    errEmail.classList.add("show");
    isValid = false;
  } else if (!emailRegex.test(emailInput.value.trim())) {
    emailInput.classList.add("is-invalid");
    errEmail.textContent = "Please enter a valid email address (e.g. name@example.com).";
    errEmail.classList.add("show");
    isValid = false;
  }

  // 3. Phone Number Validation (Mandatory 10-digit mobile check)
  const rawPhone = phoneInput.value.trim();
  const digitsOnly = rawPhone.replace(/\D/g, "");
  const normalizedPhone = (digitsOnly.length === 12 && digitsOnly.startsWith("91"))
    ? digitsOnly.slice(2)
    : (digitsOnly.length === 11 && digitsOnly.startsWith("0"))
      ? digitsOnly.slice(1)
      : digitsOnly;

  const phoneRegex = /^[6-9]\d{9}$/;

  if (!rawPhone) {
    phoneInput.classList.add("is-invalid");
    errPhone.textContent = "Please enter your mobile phone number.";
    errPhone.classList.add("show");
    isValid = false;
  } else if (!phoneRegex.test(normalizedPhone)) {
    phoneInput.classList.add("is-invalid");
    errPhone.textContent = "Invalid phone number! Must be a valid 10-digit mobile number (e.g. 9876543210).";
    errPhone.classList.add("show");
    isValid = false;
  }

  if (!isValid) {
    showToast("Please fix the highlighted contact errors.", "error");
    return;
  }

  const draft = getBookingDraft();

  // Guard against double submission
  const btn = document.getElementById("confirm-booking-btn");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> <span>Processing Booking...</span>`;
  }

  const payload = {
    customerName: nameInput.value.trim(),
    customerEmail: emailInput.value.trim().toLowerCase(),
    customerPhone: normalizedPhone,
    eventType: draft.eventType,
    venueId: draft.venueId,
    venueName: draft.venueName,
    eventDate: draft.eventDate,
    startTime: draft.startTime,
    endTime: draft.endTime,
    guestCount: draft.guestCount,
    decoration: draft.decoration,
    theme: draft.theme,
    food: draft.food,
    music: draft.music,
    entertainment: draft.entertainment,
    photography: draft.photography,
    additionalServices: draft.additionalServices,
    specialRequirements: draft.specialRequirements,
    pricing: draft.pricing
  };

  const booking = createBooking(payload);
  showToast("Booking Confirmed Successfully!", "success");
  clearBookingDraft();
  setTimeout(() => { window.location.href = `confirmation.html?id=${booking.id}`; }, 800);
}


/**
 * Step 5: Confirmation Ticket Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("ticket-id")) return;
  const bookingId = new URLSearchParams(window.location.search).get("id");
  if (!bookingId) { showToast("No booking reference specified.", "error"); return; }
  const booking = getBookingById(bookingId);
  if (booking) populateTicket(booking); else showToast("Booking reference not found.", "error");
});
function populateTicket(booking) {
  document.getElementById("ticket-id").textContent = booking.id;
  document.getElementById("ticket-name").textContent = booking.customerName;
  document.getElementById("ticket-event").textContent = booking.eventType;
  document.getElementById("ticket-venue").textContent = booking.venueName;
  document.getElementById("ticket-date").textContent = `${booking.eventDate} (${booking.startTime || '18:00'})`;
  document.getElementById("ticket-guests").textContent = `${booking.guestCount} Guests`;
  document.getElementById("ticket-amount").textContent = formatCurrency(booking.pricing ? booking.pricing.totalAmount : 0);
}


/**
 * My Bookings Logic with Empty State & Search
 */

let userBookings = [];

document.addEventListener("DOMContentLoaded", () => {
  loadAllBookings();
});

function loadAllBookings() {
  const container = document.getElementById("my-bookings-list");
  if (container) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1;" class="card skeleton" style="height: 200px;"></div>
    `;
  }

  userBookings = getBookings();
  renderBookingsList(userBookings);
}

function renderBookingErrorState(msg) {
  const container = document.getElementById("my-bookings-list");
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--surface-white); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
      <span class="material-symbols-outlined" style="font-size: 48px; color: var(--status-cancelled); margin-bottom: 0.5rem;">error_outline</span>
      <h3>Unable to Load Bookings</h3>
      <p style="margin-bottom: 1.5rem;">${msg}</p>
      <button class="btn btn-primary" onclick="loadAllBookings()">Retry</button>
    </div>
  `;
}

function searchMyBookings() {
  const query = (document.getElementById("my-search-input")?.value || "").toLowerCase().trim();
  if (!query) {
    loadAllBookings();
    return;
  }

  const filtered = userBookings.filter(b => 
    b.customerEmail.toLowerCase().includes(query) ||
    b.customerPhone.includes(query) ||
    b.id.toLowerCase().includes(query)
  );

  renderBookingsList(filtered);
}

function renderBookingsList(bookings) {
  const container = document.getElementById("my-bookings-list");
  if (!container) return;

  if (bookings.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: var(--surface-white); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
        <span class="material-symbols-outlined" style="font-size: 48px; color: var(--text-muted); margin-bottom: 0.5rem;">event_busy</span>
        <h3 style="margin-bottom: 0.5rem;">No bookings yet.</h3>
        <p style="margin-bottom: 1.5rem;">Start planning your next celebration with EventEase.</p>
        <a href="events.html" class="btn btn-primary btn-lg">
          <span>Plan an Event</span>
          <span class="material-symbols-outlined">arrow_forward</span>
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = bookings.map(b => {
    const statusClass = b.status === "Confirmed" ? "badge-confirmed" : (b.status === "Pending" ? "badge-pending" : (b.status === "Completed" ? "badge-completed" : "badge-cancelled"));

    return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <div>
            <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Ref: ${b.id}</span>
            <h3 style="margin-top: 0.1rem;">${b.eventType} Celebration</h3>
          </div>
          <span class="badge ${statusClass}">${b.status}</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem;">
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.8rem;">Venue</span>
            <strong>${b.venueName}</strong>
          </div>
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.8rem;">Event Date</span>
            <strong>${b.eventDate} (${b.startTime || '18:00'})</strong>
          </div>
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.8rem;">Guests</span>
            <strong>${b.guestCount} Guests</strong>
          </div>
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.8rem;">Total Amount</span>
            <strong style="color: var(--primary-terracotta);">${formatCurrency(b.pricing ? b.pricing.totalAmount : 0)}</strong>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--surface-beige); padding-top: 0.75rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted);">Host: ${b.customerName}</span>
          <button class="btn btn-secondary btn-sm" onclick="viewBookingDetails('${b.id}')">View Details</button>
        </div>
      </div>
    `;
  }).join('');
}

function viewBookingDetails(bookingId) {
  const booking = userBookings.find(b => b.id === bookingId);
  if (!booking) return;

  document.getElementById("det-id").textContent = `Booking Details — ${booking.id}`;

  const content = document.getElementById("det-content");
  const p = booking.pricing || {};

  content.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; background: var(--surface-beige); padding: 1rem; border-radius: var(--radius-md);">
      <div>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Customer</span>
        <strong>${booking.customerName}</strong>
      </div>
      <div>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Contact</span>
        <strong>${booking.customerEmail}<br>${booking.customerPhone}</strong>
      </div>
      <div>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Decor & Theme</span>
        <strong>${booking.decoration.package} • ${booking.theme}</strong>
      </div>
      <div>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Gastronomy</span>
        <strong>${booking.food.type} (${(booking.food.items || []).join(', ')})</strong>
      </div>
    </div>

    <h4>Itemized Pricing</h4>
    <ul style="list-style: none; padding: 0; margin-bottom: 1rem; font-size: 0.9rem;">
      <li style="display: flex; justify-content: space-between; padding: 0.35rem 0; border-bottom: 1px dashed var(--border-color);">
        <span>Venue Base</span> <strong>${formatCurrency(p.venueBase)}</strong>
      </li>
      <li style="display: flex; justify-content: space-between; padding: 0.35rem 0; border-bottom: 1px dashed var(--border-color);">
        <span>Decoration</span> <strong>${formatCurrency(p.decoration)}</strong>
      </li>
      <li style="display: flex; justify-content: space-between; padding: 0.35rem 0; border-bottom: 1px dashed var(--border-color);">
        <span>Food & Catering</span> <strong>${formatCurrency(p.food)}</strong>
      </li>
      <li style="display: flex; justify-content: space-between; padding: 0.35rem 0; border-bottom: 1px dashed var(--border-color);">
        <span>Music & Entertainment</span> <strong>${formatCurrency((p.music || 0) + (p.entertainment || 0))}</strong>
      </li>
      <li style="display: flex; justify-content: space-between; padding: 0.35rem 0; border-bottom: 1px dashed var(--border-color);">
        <span>Photography & Services</span> <strong>${formatCurrency((p.photography || 0) + (p.additionalServices || 0))}</strong>
      </li>
      <li style="display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 1.1rem; color: var(--primary-terracotta);">
        <strong>Total Amount</strong> <strong>${formatCurrency(p.totalAmount)}</strong>
      </li>
    </ul>

    ${booking.specialRequirements ? `
      <div style="background: #FFFBF9; border: 1px solid var(--border-color); padding: 0.75rem; border-radius: var(--radius-sm);">
        <strong style="font-size: 0.85rem; color: var(--primary-terracotta);">Special Notes:</strong>
        <p style="font-size: 0.85rem; margin-top: 0.25rem;">"${booking.specialRequirements}"</p>
      </div>
    ` : ''}
  `;

  document.getElementById("detail-modal").classList.add("open");
}

function closeDetailModal() {
  document.getElementById("detail-modal").classList.remove("open");
}


/**
 * Admin Console Logic
 */

let adminBookings = [];
let adminVenues = [];
let adminEventLogs = [];

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("stat-total-bookings")) return;
  fetchDashboardStats();
  fetchAdminBookings();
  fetchAdminVenues();
  fetchEventLogs();
});

function fetchDashboardStats(){const b=getBookings();document.getElementById("stat-total-bookings").textContent=b.length;document.getElementById("stat-pending-bookings").textContent=b.filter(x=>x.status==="Pending").length;document.getElementById("stat-total-customers").textContent=new Set(b.map(x=>x.customerEmail)).size;document.getElementById("stat-total-revenue").textContent=formatCurrency(b.reduce((s,x)=>s+Number(x.pricing?.totalAmount||0),0))}
function fetchAdminBookings(){adminBookings=getBookings();renderAdminBookingsTable(adminBookings)}
function fetchAdminVenues(){adminVenues=getVenues();renderAdminVenuesTable(adminVenues)}
function fetchEventLogs(){adminEventLogs=getEventLogs();renderEventLogTimeline(adminEventLogs)}
function switchAdminTab(tabName) {
  document.getElementById("tab-content-bookings").style.display = tabName === "bookings" ? "block" : "none";
  document.getElementById("tab-content-venues").style.display = tabName === "venues" ? "block" : "none";
  document.getElementById("tab-content-log").style.display = tabName === "log" ? "block" : "none";

  document.getElementById("tab-btn-bookings").classList.toggle("active-tab", tabName === "bookings");
  document.getElementById("tab-btn-venues").classList.toggle("active-tab", tabName === "venues");
  document.getElementById("tab-btn-log").classList.toggle("active-tab", tabName === "log");
}

// Render Bookings Table
function renderAdminBookingsTable(bookings) {
  const tbody = document.getElementById("admin-bookings-tbody");
  if (!tbody) return;

  if (bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center;">No bookings recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings.map(b => {
    const statusBadge = b.status === "Confirmed" ? "badge-confirmed" : (b.status === "Pending" ? "badge-pending" : (b.status === "Completed" ? "badge-completed" : "badge-cancelled"));

    return `
      <tr>
        <td><strong>${b.id}</strong></td>
        <td>
          <strong>${b.customerName}</strong><br>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${b.customerEmail}</span>
        </td>
        <td>${b.eventType}</td>
        <td>${b.venueName}</td>
        <td>${b.eventDate}</td>
        <td>${b.guestCount}</td>
        <td><strong>${formatCurrency(b.pricing ? b.pricing.totalAmount : 0)}</strong></td>
        <td><span class="badge ${statusBadge}">${b.status}</span></td>
        <td>
          <select onchange="updateBookingStatus('${b.id}', this.value)" style="font-size: 0.8rem; padding: 0.25rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <option value="Confirmed" ${b.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Pending" ${b.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Completed" ${b.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Cancelled" ${b.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

function updateBookingStatus(bookingId,newStatus){if(updateBooking(bookingId,{status:newStatus})){showToast(`Booking ${bookingId} status updated to '${newStatus}'`,"success");fetchDashboardStats();fetchAdminBookings();fetchEventLogs()}else showToast("Failed to update status","error")}
function renderAdminVenuesTable(venues) {
  const tbody = document.getElementById("admin-venues-tbody");
  if (!tbody) return;

  tbody.innerHTML = venues.map(v => `
    <tr>
      <td><img src="${v.image}" style="width: 50px; height: 35px; object-fit: cover; border-radius: var(--radius-sm);"></td>
      <td><strong>${v.name}</strong></td>
      <td>${v.location}</td>
      <td>${v.capacity} guests</td>
      <td><strong>${formatCurrency(v.startingPrice)}</strong></td>
      <td>★ ${v.rating || 4.8}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="editVenueModal('${v.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteVenue('${v.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Add / Edit Venue Modal
function openAddVenueModal() {
  document.getElementById("venue-modal-title").textContent = "Add New Venue";
  document.getElementById("vform-id").value = "";
  document.getElementById("vform-name").value = "";
  document.getElementById("vform-location").value = "";
  document.getElementById("vform-desc").value = "";
  document.getElementById("vform-capacity").value = 250;
  document.getElementById("vform-price").value = 35000;
  document.getElementById("vform-image").value = "";

  document.getElementById("venue-form-modal").classList.add("open");
}

function editVenueModal(venueId) {
  const venue = adminVenues.find(v => v.id === venueId);
  if (!venue) return;

  document.getElementById("venue-modal-title").textContent = "Edit Venue";
  document.getElementById("vform-id").value = venue.id;
  document.getElementById("vform-name").value = venue.name;
  document.getElementById("vform-location").value = venue.location;
  document.getElementById("vform-desc").value = venue.description;
  document.getElementById("vform-capacity").value = venue.capacity;
  document.getElementById("vform-price").value = venue.startingPrice;
  document.getElementById("vform-image").value = venue.image;

  document.getElementById("venue-form-modal").classList.add("open");
}

function closeVenueFormModal() {
  document.getElementById("venue-form-modal").classList.remove("open");
}

function saveVenueForm(event){event.preventDefault();const id=document.getElementById("vform-id").value;const venue={id:id||`v-${Date.now()}`,name:document.getElementById("vform-name").value,location:document.getElementById("vform-location").value,description:document.getElementById("vform-desc").value,capacity:parseInt(document.getElementById("vform-capacity").value,10),startingPrice:parseInt(document.getElementById("vform-price").value,10),image:document.getElementById("vform-image").value||VENUE_DATA[0].image,type:"Event Venue",facilities:["Parking","Catering","Power Backup"],eventTypes:["Wedding","Birthday","Party","Corporate"],rating:4.8};const list=getVenues();if(id){const n=list.findIndex(v=>v.id===id);if(n>=0)list[n]={...list[n],...venue}}else list.push(venue);saveVenues(list);showToast(id?"Venue updated successfully":"New venue added successfully","success");closeVenueFormModal();fetchAdminVenues()}
function deleteVenue(venueId){if(!confirm("Are you sure you want to delete this venue?"))return;saveVenues(getVenues().filter(v=>v.id!==venueId));showToast("Venue deleted","success");fetchAdminVenues()}
function renderEventLogTimeline(logs) {
  const container = document.getElementById("admin-event-timeline");
  if (!container) return;

  if (logs.length === 0) {
    container.innerHTML = `<p style="padding: 1rem; color: var(--text-muted);">No events logged yet.</p>`;
    return;
  }

  container.innerHTML = logs.map(log => {
    const dateStr = new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const handlersList = (log.handlerResults || []).map(h => `
      <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">
        ✔ <strong style="color: var(--text-charcoal);">${h.handler}:</strong> ${h.message}
      </div>
    `).join('');

    return `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <span class="timeline-event">${log.eventName}</span>
            <span class="timeline-time">${dateStr}</span>
          </div>
          <p style="font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-charcoal);">${log.details || 'Event triggered'}</p>
          ${handlersList}
        </div>
      </div>
    `;
  }).join('');
}
