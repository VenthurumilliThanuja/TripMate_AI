const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Song title is required'],
      trim: true,
    },
    artist: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
    },
    duration: {
      type: String,
      default: '3:30',
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
    },
    spotifyUrl: {
      type: String,
      default: '',
    },
    audioPreviewUrl: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const playlistSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Playlist name is required'],
      trim: true,
    },
    mood: {
      type: String,
      enum: ['Road Trip', 'Party', 'Chill', 'Romantic', 'Telugu Hits', 'Hindi Hits', 'English Hits', 'Other'],
      default: 'Road Trip',
    },
    spotifyEmbedUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    songs: [songSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Playlist', playlistSchema);

