import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './state/AuthContext.jsx';
import EventCatalog from './pages/EventCatalog.jsx';
import EventDetail from './pages/EventDetail.jsx';
import MyTickets from './pages/MyTickets.jsx';
import OrganizerDashboard from './pages/OrganizerDashboard.jsx';
import AuthPage from './pages/AuthPage.jsx';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="navbar">
        <div className="nav-left">
          <Link to="/" className="logo">
            ticket<span>planner</span>
          </Link>
          <button className="city-selector">
            Mumbai
            <span className="chevron">▾</span>
          </button>
        </div>

        <div className="nav-search">
          <input
            type="text"
            placeholder="Search for movies, events, sports, activities"
          />
        </div>

        <div className="nav-right">
          <nav className="nav-links">
            <Link to="/">Events</Link>
            {user && <Link to="/tickets">My Tickets</Link>}
            {user?.role === 'organizer' && <Link to="/organizer">Organizer</Link>}
          </nav>
          <div className="auth-section">
            {user ? (
              <>
                <span className="user-pill">
                  {user.name} ({user.role})
                </span>
                <button onClick={logout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn btn-primary">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<EventCatalog />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer"
            element={
              <ProtectedRoute role="organizer">
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}


