import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Dices, Sparkles, Users, Clock, BookOpen, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RandomPickerModal({ isOpen, onClose, allGames = [] }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const pickRandom = () => {
    if (allGames.length === 0) return;
    setIsSpinning(true);

    let count = 0;
    const interval = setInterval(() => {
      const rand = allGames[Math.floor(Math.random() * allGames.length)];
      setSelectedGame(rand);
      count++;
      if (count > 12) {
        clearInterval(interval);
        setIsSpinning(false);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    }, 100);
  };

  useEffect(() => {
    if (isOpen && allGames.length > 0) {
      pickRandom();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Random Group Game Picker"
      subtitle="Can't agree on what to play? Let the travel roulette decide!"
      maxWidth="max-w-md"
    >
      <div className="space-y-5 text-center">
        {selectedGame ? (
          <div
            className={`p-6 rounded-2xl border transition-all ${
              isSpinning
                ? 'bg-slate-50 border-slate-200 animate-pulse'
                : 'bg-gradient-to-b from-brand-50/50 to-white border-brand-200 shadow-card'
            }`}
          >
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-500 text-white mb-3">
              {selectedGame.category}
            </div>

            <h3 className="text-xl font-extrabold text-navy-900 mb-2">{selectedGame.title}</h3>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 font-semibold mb-4">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-brand-500" />
                {selectedGame.minPlayers}-{selectedGame.maxPlayers} Players
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                {selectedGame.durationMinutes} mins
              </span>
            </div>

            <div className="text-left bg-white p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-navy-900 block mb-1">Rules:</span>
              <p>{selectedGame.rules}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-6">No games available to pick from.</p>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={pickRandom}
            disabled={isSpinning}
            className="px-5 py-2.5 bg-navy-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Dices className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>Spin Again</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
          >
            Let's Play!
          </button>
        </div>
      </div>
    </Modal>
  );
}

