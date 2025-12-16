## EventPass – Ticketing Platform (MERN)

EventPass is a learning project that simulates a concert/festival ticketing system.
Users can browse events, select seats, purchase tickets, and view QR codes.
Organizers can create events, monitor sales, validate tickets at entry, and process refunds.

### Stack
- **Frontend**: React (Vite) – event catalog, checkout, QR display
- **Backend**: Node.js + Express – events, tickets, validation APIs
- **Database**: MongoDB + Mongoose – users, events, tickets, seat maps
- **Auth**: JWT with user/organizer roles

### Structure
- `server` – Node/Express API
- `client` – React frontend

### Quick Start

1. **Backend setup**
   - In `server/.env` (create from `.env.example`):

     ```bash
     MONGODB_URI=mongodb://localhost:27017/eventpass
     JWT_SECRET=supersecretjwt
     PORT=5000
     ```

   - Install & run:

     ```bash
     cd server
     npm install
     npm run dev
     ```

2. **Frontend setup**

   ```bash
   cd client
   npm install
   npm run dev
   ```

   The app will start on the port printed by Vite (usually `5173`).

### High-Level Features Implemented
- **Auth**: Register/login with role (`user` or `organizer`), JWT cookies
- **Events**: CRUD for events (organizer-only for create/update/delete)
- **Tickets**: Purchase single/group tickets with seat selection and refund
- **QR Codes**: Server generates QR payload; frontend renders via client-side lib
- **Validation**: Endpoint to validate ticket QR at check-in

This is a starter skeleton so you can focus on learning and extending features
like live sales counters, email with QR, loyalty discounts, and sales analytics.


