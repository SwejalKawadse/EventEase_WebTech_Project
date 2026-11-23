# 🎉 EventEase — Event Planning & Management Platform (MERN Stack)

A complete, production-grade, college-level MERN stack application converted from the original HTML5/CSS3/Vanilla JS EventEase presentation project.

EventEase retains **100% of the authentic design system** (warm ivory, charcoal, terracotta, sage palette, bespoke typography, cards, and interactive flows) while replacing browser `localStorage` with a robust **Node.js, Express.js, and MongoDB** backend architecture.

---

## 🚀 Key Features

1. **Full CRUD Operations for Events & Bookings**
   - **Create**: Add new events and customer bookings with strict validation.
   - **Read**: Fetch events, venues, and bookings from MongoDB with search and filtering.
   - **Update**: Edit existing events or update booking status (`Confirmed`, `Pending`, `Completed`, `Cancelled`).
   - **Delete**: Cancel/remove events and bookings from MongoDB.

2. **Venue & Date Conflict Detection (Database-Level Guarantee)**
   - Prevents double booking: If a venue is already booked on a date, subsequent bookings are rejected with:
     > *"This venue is already booked for another event on the selected date. Please select another date or venue."*
   - Events at **different venues on the same date** are permitted.
   - Events at the **same venue on different dates** are permitted.
   - **Self-Exclusion on Edit**: When updating an event, the event's own ID is excluded so updating notes or guest count does not trigger a false conflict.
   - **Database-Level Protection**: Compound unique index `{ venue: 1, eventDate: 1 }` guarantees zero duplicates even during simultaneous concurrent submissions.

3. **Strict Two-Tier Validation (Frontend & Backend)**
   - Event Name & Description: Cannot be empty or whitespace-only; minimum character thresholds.
   - Email: RFC regex validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
   - Phone Number: Mandatory 10-digit Indian mobile number validation (`/^[6-9]\d{9}$/`).
   - Event Date: Cannot be in the past (minimum is today's date).
   - Event Time: Start and end time validation; End time must be strictly later than start time.
   - Inline feedback with `.is-invalid` borders and understandable error badges.

4. **Multi-Step Interactive Booking Engine**
   - Step 1: Select Event Type (`/events`)
   - Step 2: Choose Venue (`/venues`)
   - Step 3: Customize Gastronomy, Theme, Decor, DJ, Photography with Live Price Calculator (`/customize`)
   - Step 4: Contact & Review with Conflict Detection (`/booking`)
   - Step 5: Confirmation Ticket Receipt with Printable E-Ticket (`/confirmation/:id`)

5. **Client & Enterprise Dashboards**
   - **My Bookings (`/my-bookings`)**: View all past and upcoming reservations, search by Ref ID / email / phone, view full itemized breakdown modal, cancel booking.
   - **Admin Console (`/admin`)**: Real-time KPI statistics (Total Reservations, Pending, Unique Hosts, Pipeline Revenue), Bookings table with status changer, Venue marketplace manager (Add/Edit/Delete venues), and real-time audit log timeline.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 (Vite) | Single-Page Application, component reusability, virtual DOM |
| **Routing** | React Router DOM v7 | Client-side declarative routing and history navigation |
| **Styling** | Native CSS3 | Authentic EventEase design system (Terracotta `#C96F5B`, Sage `#879B88`) |
| **Icons & Fonts** | Google Fonts | `Newsreader` (serif), `Plus Jakarta Sans`, Material Symbols |
| **Backend** | Node.js + Express.js | REST API server, route controllers, validation, and error handling |
| **Database** | MongoDB Atlas / Local | Cloud/Local NoSQL document database |
| **ODM** | Mongoose 8 | Schema definition, data casting, validations, compound unique indices |
| **Config** | Dotenv & CORS | Environment variables and Cross-Origin Resource Sharing |

---

## 📁 Project Structure

```
EventEase/
│
├── frontend/                          # React + Vite Single Page Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Responsive navigation header & mobile drawer
│   │   │   ├── Footer.jsx             # Site footer with platform links
│   │   │   ├── Toast.jsx              # Reusable success/error notification banners
│   │   │   ├── VenueModal.jsx         # Venue preview & selection modal
│   │   │   ├── EventModal.jsx         # Add/Edit event modal with conflict check
│   │   │   └── BookingDetailsModal.jsx# Itemized breakdown view for bookings
│   │   ├── pages/
│   │   │   ├── Home.jsx               # Landing page, hero, categories, workflow
│   │   │   ├── Events.jsx             # Event explorer & full MongoDB CRUD
│   │   │   ├── Venues.jsx             # Venue catalog with search & capacity filters
│   │   │   ├── Customize.jsx          # Live pricing engine, decor, food, conflict check
│   │   │   ├── Booking.jsx            # Review & customer contact form with validation
│   │   │   ├── Confirmation.jsx       # E-ticket receipt view with print action
│   │   │   ├── MyBookings.jsx         # User reservations list & cancellation
│   │   │   └── Admin.jsx              # Analytics KPIs, booking table, venue editor
│   │   ├── services/
│   │   │   └── api.js                 # Centralized API service methods
│   │   ├── App.jsx                    # Route switch definitions
│   │   ├── main.jsx                   # React root rendering
│   │   └── index.css                  # Complete EventEase design system CSS
│   ├── index.html                     # HTML5 shell with font preconnects
│   └── package.json
│
├── backend/                           # Node.js + Express.js REST API Server
│   ├── config/
│   │   └── db.js                      # Mongoose connection & connection guard
│   ├── controllers/
│   │   ├── eventController.js         # Event CRUD & conflict detection logic
│   │   ├── bookingController.js       # Booking checkout & status transitions
│   │   └── venueController.js         # Venue catalog management
│   ├── models/
│   │   ├── Event.js                   # Schema with compound index { venue, eventDate }
│   │   ├── Booking.js                 # Customer reservation schema
│   │   └── Venue.js                   # Architectural venue schema
│   ├── routes/
│   │   ├── eventRoutes.js             # /api/events routes
│   │   ├── bookingRoutes.js           # /api/bookings routes
│   │   └── venueRoutes.js             # /api/venues routes
│   ├── middleware/
│   │   └── errorHandler.js            # Global error, CastError & 11000 duplicate handler
│   ├── test-suite.js                  # Automated validation & conflict test runner
│   ├── seed.js                        # Database population script
│   ├── server.js                      # Express application entry point
│   ├── .env                           # Local environment variables
│   ├── .env.example                   # Environment configuration template
│   └── package.json
│
├── public/                            # Original HTML/CSS/JS presentation files preserved
├── package.json                       # Root script shortcuts (concurrent scripts)
└── README.md
```

---

## 🌐 Step-by-Step MongoDB Atlas Setup Guide

To connect your project to the free cloud database on **MongoDB Atlas**:

### Step 1: Create an Account
1. Visit [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register).
2. Sign up with your email or Google Account.

### Step 2: Create a Free Shared Cluster
1. Choose the **M0 Free** tier (free forever, 512 MB storage).
2. Select your nearest cloud provider and region (e.g. AWS / Mumbai `ap-south-1`).
3. Click **Create Deployment**.

### Step 3: Create Database User Credentials
1. Under **Security → Database Access**, click **Add New Database User**.
2. Set Authentication Method: **Password**.
3. Enter a Username (e.g., `eventease_admin`) and a secure Password.
4. Set Database User Privileges: **Read and write to any database**.
5. Click **Add User**. *(Remember this username and password!)*

### Step 4: Whitelist Network IP Address
1. Go to **Security → Network Access**.
2. Click **Add IP Address**.
3. Choose **Allow Access from Anywhere** (`0.0.0.0/0`) for development/presentation mobility, or click **Add Current IP Address**.
4. Click **Confirm**.

### Step 5: Obtain Connection String
1. Go to **Deployments → Database → Clusters**.
2. Click **Connect** next to your cluster.
3. Select **Drivers** (Node.js).
4. Copy the connection string. It will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Insert into `backend/.env`
1. Open the file `backend/.env` in VS Code or your text editor.
2. Replace `<username>` with your Atlas user, `<password>` with your password, and specify the database name `eventease`:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://eventease_admin:YourSecretPassword123@cluster0.xxxxx.mongodb.net/eventease?retryWrites=true&w=majority
   NODE_ENV=development
   ```
3. Save the file.

---

## 💻 How to Run the Project

### Prerequisites
- Node.js (version 18 or newer recommended).
- Internet access (for MongoDB Atlas) OR local MongoDB service running.

---

### Method A: Running with Two Separate Terminals (Recommended for Viva)

#### Terminal 1 — Backend Server:
```bash
# Navigate to the backend folder
cd backend

# Install dependencies (if not already done)
npm install

# (Optional) Seed initial venues and events into MongoDB
npm run seed

# Run automated validation & conflict test suite
npm test

# Start the Express server
npm start
```
*Expected Console Output:*
```
====================================================
✅ MongoDB Connected Successfully!
   Host: cluster0-shard-00-00.xxxxx.mongodb.net
   Database Name: eventease
   Connection State: Ready (readyState = 1)
====================================================
🚀 EventEase Server running on https://eventease-backend-ime3.onrender.com
```

#### Terminal 2 — Frontend Application:
```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies (if not already done)
npm install

# Start Vite React development server
npm run dev
```
*Open your browser and navigate to: **http://localhost:5173***

---

### Method B: Running from Root Directory

From the project root folder:
```bash
# Run the test suite:
npm test

# Run backend:
npm run start-backend

# Run frontend (in a second terminal):
npm run start-frontend
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Request Body / Query |
|---|---|---|---|
| `GET` | `/api/health` | Check API & MongoDB health | None |
| `GET` | `/api/events` | List all events (supports search, category, date) | `?search=tech&category=Corporate` |
| `GET` | `/api/events/:id` | Get single event details | None |
| `POST` | `/api/events` | Create new event (with validation & conflict check) | `{ eventName, venue, eventDate, startTime, endTime, ... }` |
| `POST` | `/api/events/check-conflict`| Real-time conflict availability check | `{ venue, eventDate, excludeId }` |
| `PUT` | `/api/events/:id` | Update event (excludes self ID from conflict check)| Updated event JSON |
| `DELETE`| `/api/events/:id` | Delete an event from MongoDB | None |
| `GET` | `/api/venues` | List all architectural venues | None |
| `POST` | `/api/venues` | Add new venue | `{ name, location, capacity, startingPrice, ... }` |
| `DELETE`| `/api/venues/:id` | Delete venue | None |
| `GET` | `/api/bookings` | List all customer bookings | None |
| `GET` | `/api/bookings/:id` | Get single booking receipt | None |
| `POST` | `/api/bookings` | Create confirmed customer booking | `{ customerName, customerEmail, customerPhone, venueName, eventDate, ... }` |
| `PATCH` | `/api/bookings/:id/status`| Update status (`Confirmed`, `Pending`, etc.) | `{ status: "Confirmed" }` |
| `DELETE`| `/api/bookings/:id` | Cancel/delete booking from MongoDB | None |

---

## 🎓 College Viva & Presentation Preparation Guide

### 1. What was changed from the original project to make it MERN stack?
**Answer:** The original presentation project was client-side only, persisting data temporarily in browser `localStorage`. We transformed it into a distributed full-stack architecture:
1. **Frontend**: Converted static HTML files (`index.html`, `events.html`, `venues.html`, `customize.html`, `booking.html`, `confirmation.html`, `my-bookings.html`, `admin.html`) into modular React JSX components managed by React Router DOM.
2. **Backend**: Built an Express.js server on Node.js featuring clean MVC architectural separation (Controllers, Models, Routes, Middleware).
3. **Database**: Migrated data storage to MongoDB via Mongoose schemas.
4. **Validation & Security**: Replaced client-only form checks with strict two-tier validation and database compound unique indices.

### 2. How does the Venue and Date Conflict Detection work?
**Answer:** Conflict detection is implemented at two distinct levels:
- **Application Level (Controller)**: When a booking or event is submitted, the controller executes a query:
  `Event.findOne({ venue: new RegExp('^' + venue + '$', 'i'), eventDate: eventDate, status: { $ne: 'Cancelled' } })`
  If a record is found, it immediately responds with HTTP status `409 Conflict` and the message: *"This venue is already booked for another event on the selected date. Please select another date or venue."*
- **Self-Exclusion on Edit**: When updating an existing event, we pass `{ _id: { $ne: eventId } }` so the event being edited does not conflict with itself.
- **Database Level (Compound Unique Index)**: In `Event.js`, we define `eventSchema.index({ venue: 1, eventDate: 1 }, { unique: true, partialFilterExpression: { status: { $ne: 'Cancelled' } } })`. If two users submit simultaneous requests at the exact same millisecond, MongoDB's atomic index engine rejects the second transaction with error code `11000`.

### 3. What is the role of React Hooks in this project?
**Answer:**
- `useState`: Holds component-level state such as form field inputs, active tab, modal visibility, live calculated pricing, and error messages.
- `useEffect`: Manages side-effects, such as fetching events and venues from MongoDB on page load, and debounced real-time conflict checking as the user changes dates or venues.
- `useParams`: Extracts route parameters (e.g. `confirmation/:id` to fetch the specific booking reference).
- `useNavigate`: Programmatically redirects users through the multi-step booking stepper.

### 4. How do frontend and backend communicate?
**Answer:** Communication occurs over asynchronous HTTP using JSON. The frontend uses the centralized service `frontend/src/services/api.js` which wraps `fetch()`. It sends requests with headers `'Content-Type': 'application/json'` to `https://eventease-backend-ime3.onrender.com/api`. The Express backend processes the request through CORS and `express.json()` body-parser middleware, routes it to the matching controller, interacts with MongoDB through Mongoose models, and returns JSON responses with appropriate HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `409 Conflict`, `500 Server Error`).
