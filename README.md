# Ticket Planner

Ticket Planner is a comprehensive full-stack web application designed to facilitate event booking and management. It provides a seamless experience for users to discover events, select specific seats, and purchase tickets, while offering organizers robust tools to create events, monitor sales, and validate tickets using QR codes.

## 🚀 Technologies Used

### Frontend
- **React**: UI library for building the user interface.
- **Vite**: Next-generation frontend tooling for fast builds.
- **React Router**: For client-side routing and navigation.
- **Axios**: For making HTTP requests to the backend.
- **Context API**: For global state management (Authentication).

### Backend
- **Node.js & Express**: Runtime and web framework for the API.
- **MongoDB & Mongoose**: NoSQL database and object modeling.
- **JWT (JSON Web Tokens)**: For secure authentication.
- **QRCode**: For generating unique QR codes for tickets.
- **Bcrypt**: For password hashing.

---

## 📂 File Structure

The project is organized into two main directories: `client` and `server`.

### Client Structure (`client/`)
The frontend application built with React.

```
client/
├── index.html              # Entry point
├── src/
│   ├── main.jsx            # Application root
│   ├── App.jsx             # Main App component and Routing
│   ├── styles.css          # Global styles
│   ├── state/
│   │   └── AuthContext.jsx # Authentication state provider
│   ├── utils/
│   │   └── axios.js        # Axios instance configuration
│   └── pages/
│       ├── AuthPage.jsx            # Login and Registration page
│       ├── EventCatalog.jsx        # Home page listing all events
│       ├── EventDetail.jsx         # Single event view with Seat Map
│       ├── MyTickets.jsx           # User's ticket dashboard
│       └── OrganizerDashboard.jsx  # Event management for organizers
```

### Server Structure (`server/`)
The backend API built with Express and MongoDB.

```
server/
├── src/
│   ├── index.js            # Server entry point
│   ├── seed.js             # Script to seed database with initial data
│   ├── lib/
│   │   └── db.js           # Database connection logic
│   ├── middleware/
│   │   └── auth.js         # JWT verification and role checking middleware
│   ├── models/             # Mongoose Data Models
│   │   ├── Event.js        # Event schema (includes SeatMap)
│   │   ├── Ticket.js       # Ticket schema
│   │   └── User.js         # User schema
│   └── routes/             # API Route Definitions
│       ├── auth.js         # Authentication routes
│       ├── events.js       # Event CRUD operations
│       └── tickets.js      # Ticket purchasing and management
```

---

## 🔌 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint    | Description                          | Access |
|--------|-------------|--------------------------------------|--------|
| POST   | `/register` | Register a new user or organizer     | Public |
| POST   | `/login`    | Login and receive HTTP-only cookie   | Public |
| POST   | `/logout`   | Clear authentication cookie          | Public |

### Events (`/api/events`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List all events (supports query params: `date`, `venue`) | Public |
| GET | `/:id` | Get details of a specific event | Public |
| POST | `/` | Create a new event | Organizer |
| PUT | `/:id` | Update an existing event | Organizer |
| DELETE | `/:id` | Delete an event | Organizer |

### Tickets (`/api/tickets`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/purchase` | Purchase tickets for an event | User |
| GET | `/mine` | Get all tickets purchased by the current user | User |
| POST | `/:id/refund` | Refund a ticket (if event hasn't started) | User |
| POST | `/validate` | Validate a ticket via QR payload | Organizer |
| GET | `/stats/:eventId` | Get sales statistics for an event | Organizer |

---

## ✨ Key Features

### Frontend Implementation
- **Responsive UI**: Clean and responsive design.
- **Seat Selection**: Interactive seat map allowing users to pick specific rows and seat numbers.
- **Authentication Flow**: specialized `AuthContext` to handle user sessions and protected routes.
- **Role-Based Views**: Organizers see a dashboard for management, while users see ticket history.

### Backend Implementation
- **Secure API**: Endpoints protected by JWT middleware (`requireAuth`).
- **Role Validation**: Specific endpoints restricted to 'organizer' role (`requireRole`).
- **Data Integrity**: MongoDB relationships between Events, Users, and Tickets.
- **Concurrency Handling**: Basic checks for seat availability during purchase.

---

## 🚀 Getting Started

1.  **Server Setup**:
    ```bash
    cd server
    npm install
    npm run dev
    ```
    *Ensure you have a `.env` file or environment variables set for `JWT_SECRET` and MongoDB connection.*

2.  **Client Setup**:
    ```bash
    cd client
    npm install
    npm run dev
    ```

3.  **Access**:
    Open [http://localhost:5173](http://localhost:5173) to view the application.

