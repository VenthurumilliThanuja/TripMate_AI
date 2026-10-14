import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, RefreshCw, ShieldAlert } from 'lucide-react';
import FriendCard from '../components/friends/FriendCard';
import FriendModal from '../components/friends/FriendModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function Friends() {
  const { showToast } = useToast();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState(null);
  const [friendToDelete, setFriendToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await api.get('/friends');
      if (res.data.success) {
        setFriends(res.data.data);
      }
    } catch (error) {
      showToast('Failed to load companions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleCreateOrEdit = async (data) => {
    if (editingFriend) {
      await api.put(`/friends/${editingFriend._id}`, data);
      showToast('Companion details updated!', 'success');
    } else {
      await api.post('/friends', data);
      showToast('New companion added to your travel circle!', 'success');
    }
    fetchFriends();
  };

  const handleConfirmDelete = async () => {
    if (!friendToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/friends/${friendToDelete._id}`);
      showToast('Companion removed.', 'info');
      setFriendToDelete(null);
      fetchFriends();
    } catch (error) {
      showToast('Failed to delete contact.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.nickname || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.phone || '').includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-navy-900 tracking-tight">Travel Circle</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your travel companions, phone contacts, and designated emergency numbers.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingFriend(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Companion</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search friends by name, nickname, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Friends Cards Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-semibold">Loading companions...</p>
        </div>
      ) : filteredFriends.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No companions saved</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Save your friends once to assign them to trips, split expenses, and keep emergency
            contacts close.
          </p>
          <button
            onClick={() => {
              setEditingFriend(null);
              setIsModalOpen(true);
            }}
            className="mt-4 px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold"
          >
            Add First Companion
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFriends.map((friend) => (
            <FriendCard
              key={friend._id}
              friend={friend}
              onEdit={(f) => {
                setEditingFriend(f);
                setIsModalOpen(true);
              }}
              onDelete={(f) => setFriendToDelete(f)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <FriendModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFriend(null);
        }}
        onSubmit={handleCreateOrEdit}
        initialData={editingFriend}
      />

      <ConfirmDialog
        isOpen={!!friendToDelete}
        onClose={() => setFriendToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Remove ${friendToDelete?.name}?`}
        message="Are you sure you want to remove this companion from your contact list?"
        confirmText="Remove Companion"
        isLoading={isDeleting}
      />
    </div>
  );
}

