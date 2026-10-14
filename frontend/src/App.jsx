import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import TripFormModal from './components/trips/TripFormModal';

import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import TripDetails from './pages/TripDetails';
import AiAssistant from './pages/AiAssistant';
import Friends from './pages/Friends';
import Profile from './pages/Profile';
import api from './api/axios';
import { useToast } from './context/ToastContext';

// Login has been removed; the app opens directly in guest mode.
const ProtectedRoute = ({ children }) => {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return children;
};

// Main App Layout
function AppLayout() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [friends, setFriends] = useState([]);

  const loadFriends = async () => {
    try {
      const res = await api.get('/friends');
      if (res.data.success) {
        setFriends(res.data.data);
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleOpenCreate = () => {
    loadFriends();
    setIsCreateTripOpen(true);
  };

  const handleCreateTrip = async (data) => {
    try {
      const res = await api.post('/trips', data);
      if (res.data.success) {
        showToast('Trip folder created successfully!', 'success');
        window.location.href = `/trips/${res.data.data._id}`;
      }
    } catch (error) {
      showToast('Failed to create trip.', 'error');
    }
  };

  // Compute page title based on path
  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/') return 'Dashboard';
    if (p.startsWith('/trips/') && p.length > 7) return 'Trip Workspace';
    if (p.startsWith('/trips')) return 'My Trips';
    if (p.startsWith('/ai-assistant')) return 'AI Travel Advisor';
    if (p.startsWith('/friends')) return 'Travel Circle';
    if (p.startsWith('/profile')) return 'Profile & Settings';
    return 'TripMate AI';
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Sidebar for Desktop */}
      <Sidebar onOpenCreateTrip={handleOpenCreate} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Navbar title={getPageTitle()} onOpenCreateTrip={handleOpenCreate} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/trips/:id" element={<TripDetails />} />
            <Route path="/ai-assistant" element={<AiAssistant />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Quick Create Trip Modal */}
      <TripFormModal
        isOpen={isCreateTripOpen}
        onClose={() => setIsCreateTripOpen(false)}
        onSubmit={handleCreateTrip}
        availableFriends={friends}
        currency={user?.currency || '₹'}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

