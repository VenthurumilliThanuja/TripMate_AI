import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  DollarSign,
  MapPin,
  Calendar,
  Music,
  Dices,
  Users,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Share2,
  Trash2,
  Plus,
  Clock,
  Heart,
} from 'lucide-react';
import ExpenseTable from '../components/expenses/ExpenseTable';
import ExpenseCharts from '../components/expenses/ExpenseCharts';
import ExpenseFormModal from '../components/expenses/ExpenseFormModal';
import SettlementCard from '../components/expenses/SettlementCard';
import PlaceCard from '../components/places/PlaceCard';
import AddPlaceModal from '../components/places/AddPlaceModal';
import AiPlaceDiscoveryModal from '../components/places/AiPlaceDiscoveryModal';
import DayItinerary from '../components/itinerary/DayItinerary';
import TripReminderControl from '../components/itinerary/TripReminderControl';
import ActivityModal from '../components/itinerary/ActivityModal';
import AiItineraryModal from '../components/itinerary/AiItineraryModal';
import PlaylistCard from '../components/music/PlaylistCard';
import AddSongModal from '../components/music/AddSongModal';
import CreatePlaylistModal from '../components/music/CreatePlaylistModal';
import GameCard from '../components/games/GameCard';
import AddGameModal from '../components/games/AddGameModal';
import RandomPickerModal from '../components/games/RandomPickerModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function TripDetails() {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);

  // Tab data states
  const [expenses, setExpenses] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [places, setPlaces] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [games, setGames] = useState({ customGames: [], suggestedGames: [] });

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteExpenseItem, setDeleteExpenseItem] = useState(null);

  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [isAiPlacesOpen, setIsAiPlacesOpen] = useState(false);
  const [deletePlaceItem, setDeletePlaceItem] = useState(null);

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityDayNumber, setActivityDayNumber] = useState(1);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  const [deleteActivityItem, setDeleteActivityItem] = useState(null);

  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [activePlaylistForSong, setActivePlaylistForSong] = useState(null);

  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [isRandomPickerOpen, setIsRandomPickerOpen] = useState(false);
  const [gameFilter, setGameFilter] = useState('All');

  const currency = user?.currency || '₹';

  // Fetch full trip workspace
  const fetchTripWorkspace = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/trips/${tripId}`);
      if (res.data.success) {
        setTrip(res.data.data);
      }
    } catch (error) {
      showToast('Failed to load trip details.', 'error');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const res = await api.get(`/expenses/trip/${tripId}`);
      if (res.data.success) {
        setExpenses(res.data.data);
        setCategorySummary(res.data.summary.categorySummary || []);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  // Fetch places
  const fetchPlaces = async () => {
    try {
      const res = await api.get(`/places/trip/${tripId}`);
      if (res.data.success) {
        setPlaces(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  // Fetch itinerary
  const fetchItinerary = async () => {
    try {
      const res = await api.get(`/itineraries/trip/${tripId}`);
      if (res.data.success) {
        setItineraries(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching itinerary:', error);
    }
  };

  // Fetch playlists
  const fetchPlaylists = async () => {
    try {
      const res = await api.get(`/music/trip/${tripId}`);
      if (res.data.success) {
        setPlaylists(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching music:', error);
    }
  };

  // Fetch games
  const fetchGames = async () => {
    try {
      const res = await api.get('/games');
      if (res.data.success) {
        setGames({
          customGames: res.data.customGames,
          suggestedGames: res.data.suggestedGames,
        });
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchTripWorkspace();
      fetchExpenses();
      fetchPlaces();
      fetchItinerary();
      fetchPlaylists();
      fetchGames();
    }
  }, [tripId]);

  // Tab definitions
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'expenses', label: 'Expenses', icon: DollarSign, badge: expenses.length },
    { id: 'settlements', label: 'Settlements', icon: Wallet },
    { id: 'places', label: 'Places to Visit', icon: MapPin, badge: places.length },
    { id: 'itinerary', label: 'Day Itinerary', icon: Calendar, badge: itineraries.length },
    { id: 'music', label: 'Music & Playlists', icon: Music, badge: playlists.length },
    { id: 'games', label: 'Group Games', icon: Dices },
    { id: 'friends', label: 'Companions', icon: Users, badge: trip?.friends?.length || 0 },
  ];

  // 1. Expense Handlers
  const handleSaveExpense = async (data) => {
    if (editingExpense) {
      await api.put(`/expenses/${editingExpense._id}`, data);
      showToast('Expense updated!', 'success');
    } else {
      await api.post('/expenses', { ...data, tripId });
      showToast('Expense added!', 'success');
    }
    fetchTripWorkspace();
    fetchExpenses();
  };

  const handleConfirmDeleteExpense = async () => {
    if (!deleteExpenseItem) return;
    try {
      await api.delete(`/expenses/${deleteExpenseItem._id}`);
      showToast('Expense deleted.', 'info');
      setDeleteExpenseItem(null);
      fetchTripWorkspace();
      fetchExpenses();
    } catch (error) {
      showToast('Failed to delete expense.', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get(`/expenses/trip/${tripId}/export-csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tripmate_${trip.title.replace(/\s+/g, '_')}_expenses.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Expense report downloaded!', 'success');
    } catch (error) {
      showToast('Failed to export CSV.', 'error');
    }
  };

  // 2. Place Handlers
  const handleAddPlace = async (data) => {
    await api.post('/places', { ...data, tripId });
    showToast('Place added to trip!', 'success');
    fetchPlaces();
  };

  const handleToggleVisited = async (place) => {
    try {
      await api.put(`/places/${place._id}`, { isVisited: !place.isVisited });
      showToast(place.isVisited ? 'Marked as not visited' : 'Marked as visited!', 'success');
      fetchPlaces();
    } catch (error) {
      showToast('Update failed.', 'error');
    }
  };

  const handleAssignDay = async (place, dayNum) => {
    try {
      await api.put(`/places/${place._id}`, { dayNumber: dayNum });
      showToast(dayNum ? `Assigned to Day ${dayNum}` : 'Moved to Wishlist', 'success');
      fetchPlaces();
    } catch (error) {
      showToast('Failed to assign day.', 'error');
    }
  };

  const handleConfirmDeletePlace = async () => {
    if (!deletePlaceItem) return;
    try {
      await api.delete(`/places/${deletePlaceItem._id}`);
      showToast('Place removed.', 'info');
      setDeletePlaceItem(null);
      fetchPlaces();
    } catch (error) {
      showToast('Failed to delete place.', 'error');
    }
  };

  // 3. Itinerary Handlers
  const handleSaveActivity = async (data) => {
    if (editingActivity) {
      await api.put(`/itineraries/${editingActivity._id}`, data);
      showToast('Activity updated!', 'success');
    } else {
      await api.post('/itineraries', { ...data, tripId });
      showToast('Activity scheduled!', 'success');
    }
    fetchItinerary();
  };

  const handleToggleComplete = async (act) => {
    try {
      await api.put(`/itineraries/${act._id}`, { isCompleted: !act.isCompleted });
      fetchItinerary();
    } catch (error) {
      showToast('Update failed.', 'error');
    }
  };

  const handleConfirmDeleteActivity = async () => {
    if (!deleteActivityItem) return;
    try {
      await api.delete(`/itineraries/${deleteActivityItem._id}`);
      showToast('Activity removed.', 'info');
      setDeleteActivityItem(null);
      fetchItinerary();
    } catch (error) {
      showToast('Failed to delete activity.', 'error');
    }
  };

  // 4. Music Handlers
  const handleCreatePlaylist = async (data) => {
    await api.post('/music/playlists', { ...data, tripId });
    showToast('Playlist created!', 'success');
    fetchPlaylists();
  };

  const handleAddSong = async (songData) => {
    if (!activePlaylistForSong) return;
    await api.post(`/music/playlists/${activePlaylistForSong._id}/songs`, songData);
    showToast('Song added!', 'success');
    fetchPlaylists();
  };

  const handleRemoveSong = async (playlistId, songId) => {
    await api.delete(`/music/playlists/${playlistId}/songs/${songId}`);
    showToast('Song removed.', 'info');
    fetchPlaylists();
  };

  const handleDeletePlaylist = async (playlistId) => {
    await api.delete(`/music/playlists/${playlistId}`);
    showToast('Playlist deleted.', 'info');
    fetchPlaylists();
  };

  // 5. Game Handlers
  const handleAddGame = async (gameData) => {
    await api.post('/games', { ...gameData, tripId });
    showToast('Custom game added!', 'success');
    fetchGames();
  };

  const handleToggleGameFavorite = async (game) => {
    if (!game._id) return;
    await api.put(`/games/${game._id}`, { isFavorite: !game.isFavorite });
    fetchGames();
  };

  const handleToggleGamePlayed = async (game) => {
    if (!game._id) return;
    await api.put(`/games/${game._id}`, { isPlayed: !game.isPlayed });
    fetchGames();
  };

  const handleDeleteGame = async (game) => {
    if (!game._id) return;
    await api.delete(`/games/${game._id}`);
    showToast('Game removed.', 'info');
    fetchGames();
  };

  if (loading || !trip) {
    return (
      <div className="p-16 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-semibold">Opening trip workspace...</p>
        </div>
      </div>
    );
  }

  const spent = trip.totalSpent || 0;
  const budget = trip.totalBudget || 0;
  const remaining = budget - spent;
  const isOverbudget = spent > budget;
  const overspentAmount = isOverbudget ? spent - budget : 0;
  const progressPercent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-navy-900 text-white shadow-elevated border border-navy-800">
        <div className="absolute inset-0 z-0">
          <img
            src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80'}
            alt={trip.title}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 md:p-8 space-y-4">
          {/* Top navigation link */}
          <div className="flex items-center justify-between">
            <Link
              to="/trips"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Trips</span>
            </Link>

            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/80 text-white backdrop-blur-md">
              {trip.status}
            </span>
          </div>

          {/* Title & Metadata */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-brand-300 font-semibold">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>{trip.destination}</span>
                <span>•</span>
                <Calendar className="w-4 h-4 text-brand-400" />
                <span>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)} ({trip.durationDays} Days)
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {trip.title}
              </h1>
              {trip.description && (
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {trip.description}
                </p>
              )}
            </div>

            {/* Quick Financial Health Pill */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-6 self-start md:self-auto">
              <div>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-bold block">
                  Budget Health
                </span>
                <span className="text-lg font-black text-white">
                  {currency}{spent.toLocaleString()} / {currency}{budget.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-bold block">
                  {isOverbudget ? 'Exceeded' : 'Remaining'}
                </span>
                <span
                  className={`text-lg font-black ${
                    isOverbudget ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {isOverbudget
                    ? `+${currency}${overspentAmount.toLocaleString()}`
                    : `${currency}${remaining.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Tab Bar */}
        <div className="relative z-10 px-6 bg-navy-950/60 border-t border-navy-800/80 overflow-x-auto flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-brand-400 text-brand-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-brand-500 text-white' : 'bg-navy-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Tab Contents */}

      {/* A. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Budget Progress Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft space-y-4">
              <h3 className="text-sm font-extrabold text-navy-900">Trip Budget Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Total Budget:</span>
                  <span className="font-extrabold text-navy-900">{currency}{budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Actual Spent:</span>
                  <span className="font-extrabold text-slate-900">{currency}{spent.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverbudget ? 'bg-rose-500' : progressPercent > 80 ? 'bg-amber-500' : 'bg-brand-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold pt-2 border-t border-slate-100">
                  {isOverbudget ? (
                    <>
                      <span className="text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Overbudget
                      </span>
                      <span className="text-rose-600">+{currency}{overspentAmount.toLocaleString()}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Safe Remaining
                      </span>
                      <span className="text-emerald-700">{currency}{remaining.toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('expenses')}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-navy-900 font-bold rounded-xl text-xs border border-slate-200 transition-colors"
                >
                  Manage Transactions
                </button>
              </div>
            </div>

            {/* Quick Companions Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-extrabold text-navy-900">Travel Companions</h3>
                  <span className="text-xs text-slate-400 font-semibold">
                    {trip.friends?.length || 0} Friends
                  </span>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 text-xs font-bold text-navy-900">
                    <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px]">
                      You
                    </span>
                    <span>{user?.name} (Trip Organizer)</span>
                  </div>
                  {(trip.friends || []).map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {f.name[0]}
                        </span>
                        <span>{f.name}</span>
                      </div>
                      {f.phone && <span className="text-[11px] text-slate-400">{f.phone}</span>}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('settlements')}
                className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-navy-900 font-bold rounded-xl text-xs border border-slate-200 transition-colors"
              >
                View Debt Settlements
              </button>
            </div>

            {/* AI Advisor Card */}
            <div className="bg-gradient-to-br from-brand-50 to-teal-50/50 p-6 rounded-2xl border border-brand-200/80 shadow-soft flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-brand-500/20 text-brand-800 text-[11px] font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>AI Travel Advisor</span>
                </div>
                <h3 className="text-sm font-extrabold text-navy-900 mb-1">
                  Smart Spending & Pace Limits
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Safe daily group limit: approximately{' '}
                  <span className="font-extrabold text-navy-900">
                    {currency}{Math.max(0, Math.round(remaining / (trip.durationDays || 3))).toLocaleString()}
                  </span>{' '}
                  per day for {trip.destination}.
                </p>
              </div>

              <div className="space-y-2 mt-4">
                <button
                  onClick={() => navigate('/ai-assistant')}
                  className="w-full py-2 bg-navy-900 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                >
                  Open AI Budget Advisor
                </button>
                <button
                  onClick={() => {
                    setActiveTab('places');
                    setIsAiPlacesOpen(true);
                  }}
                  className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition-colors"
                >
                  Discover AI Places
                </button>
              </div>
            </div>
          </div>

          {/* Quick Expense Visuals in Overview */}
          <ExpenseCharts categorySummary={categorySummary} currency={currency} />
        </div>
      )}

      {/* B. EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <ExpenseTable
            expenses={expenses}
            categorySummary={categorySummary}
            totalBudget={budget}
            totalSpent={spent}
            currency={currency}
            onAddExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onEditExpense={(exp) => {
              setEditingExpense(exp);
              setIsExpenseModalOpen(true);
            }}
            onDeleteExpense={(exp) => setDeleteExpenseItem(exp)}
            onExportCSV={handleExportCSV}
            friendsList={trip.friends || []}
          />

          <ExpenseCharts categorySummary={categorySummary} currency={currency} />
        </div>
      )}

      {/* C. SETTLEMENTS TAB */}
      {activeTab === 'settlements' && (
        <SettlementCard tripId={tripId} currency={currency} />
      )}

      {/* D. PLACES TO VISIT TAB */}
      {activeTab === 'places' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-navy-900">Places to Visit</h3>
              <p className="text-xs text-slate-400">
                Organize attractions, wishlist spots, and day assignments.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsAiPlacesOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>AI Suggest Places</span>
              </button>

              <button
                onClick={() => setIsPlaceModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Place</span>
              </button>
            </div>
          </div>

          {places.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No places added yet</h4>
              <p className="text-xs text-slate-400 mt-1">
                Add must-see landmarks manually or use the AI Discovery tool to get suggestions.
              </p>
              <button
                onClick={() => setIsAiPlacesOpen(true)}
                className="mt-4 px-4 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs"
              >
                AI Suggest Places
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <PlaceCard
                  key={place._id}
                  place={place}
                  currency={currency}
                  tripDays={trip.durationDays || 3}
                  onToggleVisited={handleToggleVisited}
                  onAssignDay={handleAssignDay}
                  onDeletePlace={(p) => setDeletePlaceItem(p)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* E. DAY ITINERARY TAB */}
      {activeTab === 'itinerary' && (
        <div className="space-y-4">
          <TripReminderControl
            tripId={tripId}
            trip={trip}
            activities={itineraries}
            spent={spent}
            budget={budget}
            currency={currency}
            userId={user?._id}
          />
          <DayItinerary
            activities={itineraries}
            tripDays={trip.durationDays || 3}
            currency={currency}
            onAddActivity={(dayNum) => {
              setActivityDayNumber(dayNum);
              setEditingActivity(null);
              setIsActivityModalOpen(true);
            }}
            onEditActivity={(act) => {
              setEditingActivity(act);
              setActivityDayNumber(act.dayNumber || 1);
              setIsActivityModalOpen(true);
            }}
            onDeleteActivity={(act) => setDeleteActivityItem(act)}
            onToggleComplete={handleToggleComplete}
            onOpenAiPlanner={() => setIsAiPlannerOpen(true)}
          />
        </div>
      )}

      {/* F. MUSIC TAB */}
      {activeTab === 'music' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-navy-900">Trip Music Companion</h3>
              <p className="text-xs text-slate-400">
                Playlists, car journey tracks, and Spotify streaming links.
              </p>
            </div>

            <button
              onClick={() => setIsCreatePlaylistOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Playlist</span>
            </button>
          </div>

          {playlists.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <Music className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No playlists created</h4>
              <p className="text-xs text-slate-400 mt-1">
                Create your first playlist for road trips, party evenings, or acoustic chill.
              </p>
              <button
                onClick={() => setIsCreatePlaylistOpen(true)}
                className="mt-4 px-4 py-2 bg-navy-900 text-white font-bold rounded-xl text-xs"
              >
                Create Playlist
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist._id}
                  playlist={playlist}
                  onAddSong={(pl) => {
                    setActivePlaylistForSong(pl);
                  }}
                  onRemoveSong={handleRemoveSong}
                  onDeletePlaylist={handleDeletePlaylist}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* G. GROUP GAMES TAB */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-navy-900">Group Travel Games</h3>
              <p className="text-xs text-slate-400">
                Fun activities for car rides, waiting rooms, and night balconies.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsRandomPickerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                <Dices className="w-3.5 h-3.5 text-brand-500" />
                <span>Random Picker</span>
              </button>

              <button
                onClick={() => setIsAddGameOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Game</span>
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['All', 'party', 'car journey', 'indoor', 'outdoor'].map((cat) => (
              <button
                key={cat}
                onClick={() => setGameFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  gameFilter === cat
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...games.customGames, ...games.suggestedGames]
              .filter(
                (g) => gameFilter === 'All' || g.category.toLowerCase() === gameFilter.toLowerCase()
              )
              .map((game, i) => (
                <GameCard
                  key={game._id || `preset-${i}`}
                  game={game}
                  isCustom={!game.isPreset}
                  onToggleFavorite={handleToggleGameFavorite}
                  onTogglePlayed={handleToggleGamePlayed}
                  onDeleteGame={handleDeleteGame}
                />
              ))}
          </div>
        </div>
      )}

      {/* H. FRIENDS TAB */}
      {activeTab === 'friends' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-navy-900">Trip Companions</h3>
              <p className="text-xs text-slate-400">
                People traveling in this group folder ({trip.friends?.length || 0} friends).
              </p>
            </div>

            <Link
              to="/friends"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage Travel Circle</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-brand-200 shadow-soft flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-500 text-white flex items-center justify-center font-black text-sm">
                You
              </div>
              <div>
                <h4 className="text-sm font-bold text-navy-900">{user?.name}</h4>
                <p className="text-xs text-brand-600 font-semibold">Trip Leader & Admin</p>
              </div>
            </div>

            {(trip.friends || []).map((f, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-navy-900 flex items-center justify-center font-bold text-sm">
                  {f.name[0]}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-navy-900 truncate">{f.name}</h4>
                  {f.phone && <p className="text-xs text-slate-500 truncate">{f.phone}</p>}
                  {f.email && <p className="text-[11px] text-slate-400 truncate">{f.email}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleSaveExpense}
        initialData={editingExpense}
        tripFriends={trip.friends || []}
        currency={currency}
      />

      <AddPlaceModal
        isOpen={isPlaceModalOpen}
        onClose={() => setIsPlaceModalOpen(false)}
        onSubmit={handleAddPlace}
        tripDays={trip.durationDays || 3}
        destination={trip.destination}
        currency={currency}
      />

      <AiPlaceDiscoveryModal
        isOpen={isAiPlacesOpen}
        onClose={() => setIsAiPlacesOpen(false)}
        tripId={tripId}
        destination={trip.destination}
        travelStyle={trip.travelStyle}
        currency={currency}
        onPlacesAdded={fetchPlaces}
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setEditingActivity(null);
        }}
        onSubmit={handleSaveActivity}
        initialData={editingActivity}
        dayNumber={activityDayNumber}
        currency={currency}
      />

      <AiItineraryModal
        isOpen={isAiPlannerOpen}
        onClose={() => setIsAiPlannerOpen(false)}
        tripId={tripId}
        trip={trip}
        currency={currency}
        onItinerarySaved={fetchItinerary}
      />

      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onSubmit={handleCreatePlaylist}
      />

      <AddSongModal
        isOpen={!!activePlaylistForSong}
        onClose={() => setActivePlaylistForSong(null)}
        onSubmit={handleAddSong}
        playlistName={activePlaylistForSong?.name || ''}
      />

      <AddGameModal
        isOpen={isAddGameOpen}
        onClose={() => setIsAddGameOpen(false)}
        onSubmit={handleAddGame}
      />

      <RandomPickerModal
        isOpen={isRandomPickerOpen}
        onClose={() => setIsRandomPickerOpen(false)}
        allGames={[...games.customGames, ...games.suggestedGames]}
      />

      <ConfirmDialog
        isOpen={!!deleteExpenseItem}
        onClose={() => setDeleteExpenseItem(null)}
        onConfirm={handleConfirmDeleteExpense}
        title="Delete Expense?"
        message={`Are you sure you want to delete "${deleteExpenseItem?.title}" (${currency}${deleteExpenseItem?.amount})? This will automatically recalculate all category balances and debt settlements.`}
        confirmText="Delete Expense"
      />

      <ConfirmDialog
        isOpen={!!deletePlaceItem}
        onClose={() => setDeletePlaceItem(null)}
        onConfirm={handleConfirmDeletePlace}
        title="Remove Place?"
        message={`Remove "${deletePlaceItem?.name}" from your trip list?`}
        confirmText="Remove"
      />

      <ConfirmDialog
        isOpen={!!deleteActivityItem}
        onClose={() => setDeleteActivityItem(null)}
        onConfirm={handleConfirmDeleteActivity}
        title="Delete Itinerary Activity?"
        message={`Delete "${deleteActivityItem?.title}" from Day ${deleteActivityItem?.dayNumber}?`}
        confirmText="Delete"
      />
    </div>
  );
}
