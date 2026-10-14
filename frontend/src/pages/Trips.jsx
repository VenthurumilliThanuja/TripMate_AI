import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Compass,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Archive,
  Calendar,
  FolderOpen,
} from 'lucide-react';
import TripCard from '../components/trips/TripCard';
import TripFormModal from '../components/trips/TripFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Trips() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [trips, setTrips] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currency = user?.currency || '₹';

  const fetchTripsAndFriends = async () => {
    try {
      setLoading(true);
      const [tripsRes, friendsRes] = await Promise.all([
        api.get('/trips'),
        api.get('/friends'),
      ]);

      if (tripsRes.data.success) {
        setTrips(tripsRes.data.data);
      }
      if (friendsRes.data.success) {
        setFriends(friendsRes.data.data);
      }
    } catch (error) {
      showToast('Failed to load trips.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsAndFriends();
  }, []);

  // Open create modal if URL has ?action=create
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const handleCreateOrEditTrip = async (tripData) => {
    if (editingTrip) {
      // Update
      const res = await api.put(`/trips/${editingTrip._id}`, tripData);
      if (res.data.success) {
        showToast('Trip folder updated successfully!', 'success');
        fetchTripsAndFriends();
      }
    } else {
      // Create
      const res = await api.post('/trips', tripData);
      if (res.data.success) {
        showToast('New trip folder created!', 'success');
        fetchTripsAndFriends();
      }
    }
  };

  const handleToggleArchive = async (tripId) => {
    try {
      const res = await api.patch(`/trips/${tripId}/archive`);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        fetchTripsAndFriends();
      }
    } catch (error) {
      showToast('Could not update trip archive status.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!tripToDelete) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/trips/${tripToDelete._id}`);
      if (res.data.success) {
        showToast('Trip folder and associated records deleted permanently.', 'info');
        setTripToDelete(null);
        fetchTripsAndFriends();
      }
    } catch (error) {
      showToast('Failed to delete trip.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered list
  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All'
        ? t.status !== 'archived'
        : statusFilter === 'archived'
        ? t.status === 'archived'
        : t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-navy-900 tracking-tight">My Trip Folders</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize separate workspaces for budgets, itineraries, and friends.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTrip(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Trip Folder</span>
        </button>
      </div>

      {/* Search & Status Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search trips by destination or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-slate-50/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['All', 'upcoming', 'active', 'completed', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-semibold">Loading your travel folders...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No trips found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'All'
              ? 'Try adjusting your search criteria or status filter.'
              : 'Create your first trip folder to organize expenses and itineraries.'}
          </p>
          <button
            onClick={() => {
              setEditingTrip(null);
              setIsModalOpen(true);
            }}
            className="mt-4 px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold"
          >
            Create New Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip._id}
              trip={trip}
              currency={currency}
              onEdit={(t) => {
                setEditingTrip(t);
                setIsModalOpen(true);
              }}
              onToggleArchive={handleToggleArchive}
              onDelete={(t) => setTripToDelete(t)}
            />
          ))}
        </div>
      )}

      {/* Trip Form Modal */}
      <TripFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTrip(null);
        }}
        onSubmit={handleCreateOrEditTrip}
        initialData={editingTrip}
        availableFriends={friends}
        currency={currency}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!tripToDelete}
        onClose={() => setTripToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete "${tripToDelete?.title}"?`}
        message="This will permanently delete this trip folder along with all recorded expenses, itineraries, saved places, and playlists. This cannot be undone."
        confirmText="Yes, Delete Trip"
        isLoading={isDeleting}
      />
    </div>
  );
}

