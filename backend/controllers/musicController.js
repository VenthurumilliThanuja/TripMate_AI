const Playlist = require('../models/Playlist');

// @desc    Get all playlists for a trip
// @route   GET /api/music/trip/:tripId
// @access  Private
exports.getTripPlaylists = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const playlists = await Playlist.find({ tripId, userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: playlists.length,
      data: playlists,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new trip playlist
// @route   POST /api/music/playlists
// @access  Private
exports.createPlaylist = async (req, res, next) => {
  try {
    const { tripId, name, mood, spotifyEmbedUrl, description, songs } = req.body;

    if (!tripId || !name) {
      return res.status(400).json({ success: false, message: 'Trip ID and playlist name are required.' });
    }

    const playlist = await Playlist.create({
      tripId,
      userId: req.user._id,
      name,
      mood: mood || 'Road Trip',
      spotifyEmbedUrl: spotifyEmbedUrl || '',
      description: description || '',
      songs: songs || [],
    });

    res.status(201).json({
      success: true,
      data: playlist,
      message: 'Playlist created!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add song to playlist
// @route   POST /api/music/playlists/:id/songs
// @access  Private
exports.addSong = async (req, res, next) => {
  try {
    const { title, artist, duration, coverImage, spotifyUrl, audioPreviewUrl } = req.body;

    if (!title || !artist) {
      return res.status(400).json({ success: false, message: 'Song title and artist are required.' });
    }

    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user._id });
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    playlist.songs.push({
      title,
      artist,
      duration: duration || '3:30',
      coverImage:
        coverImage ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
      spotifyUrl: spotifyUrl || '',
      audioPreviewUrl: audioPreviewUrl || '',
    });

    await playlist.save();

    res.status(200).json({
      success: true,
      data: playlist,
      message: 'Song added to playlist!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove song from playlist
// @route   DELETE /api/music/playlists/:id/songs/:songId
// @access  Private
exports.removeSong = async (req, res, next) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user._id });
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    playlist.songs = playlist.songs.filter((s) => s._id.toString() !== req.params.songId);
    await playlist.save();

    res.status(200).json({
      success: true,
      data: playlist,
      message: 'Song removed from playlist.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete playlist
// @route   DELETE /api/music/playlists/:id
// @access  Private
exports.deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user._id });
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    await Playlist.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Playlist deleted.',
    });
  } catch (error) {
    next(error);
  }
};

