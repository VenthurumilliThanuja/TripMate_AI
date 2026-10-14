const Game = require('../models/Game');

// Preset group travel games library
const DEFAULT_PRESET_GAMES = [
  {
    title: 'Truth or Dare (Travel Confidential)',
    category: 'party',
    minPlayers: 3,
    maxPlayers: 15,
    durationMinutes: 45,
    rules:
      'Players take turns choosing Truth or Dare. Truths explore funniest travel secrets, dares involve playful group challenges (e.g. sing in foreign accent, order food using gestures only).',
    materialsNeeded: 'Spin bottle (or phone app)',
    isPreset: true,
    isFavorite: true,
  },
  {
    title: 'Dumb Charades — Bollywood & Hollywood',
    category: 'party',
    minPlayers: 4,
    maxPlayers: 20,
    durationMinutes: 40,
    rules:
      'Teams take turns acting out movie titles without uttering any sound. 60 seconds per turn.',
    materialsNeeded: 'Timer',
    isPreset: true,
    isFavorite: true,
  },
  {
    title: 'Antakshari — Nonstop Road Melodies',
    category: 'car journey',
    minPlayers: 4,
    maxPlayers: 20,
    durationMinutes: 45,
    rules:
      'Split into two sides of the vehicle or group. Each team sings a song starting with the final consonant/letter of the last song. No repeats!',
    materialsNeeded: 'Zero props required',
    isPreset: true,
    isFavorite: true,
  },
  {
    title: '20 Questions — Landmark Edition',
    category: 'car journey',
    minPlayers: 2,
    maxPlayers: 12,
    durationMinutes: 20,
    rules:
      'One player chooses a secret travel spot, animal, or friend. The others have up to 20 Yes/No questions to identify it.',
    materialsNeeded: 'None',
    isPreset: true,
    isFavorite: false,
  },
  {
    title: 'Never Have I Ever',
    category: 'indoor',
    minPlayers: 3,
    maxPlayers: 12,
    durationMinutes: 30,
    rules:
      'Hold up 5 fingers. Players announce statements like "Never have I ever lost my passport". Those who have done it drop a finger.',
    materialsNeeded: 'Beverages or snacks',
    isPreset: true,
    isFavorite: true,
  },
  {
    title: 'Would You Rather? (Extreme Travel Edition)',
    category: 'indoor',
    minPlayers: 2,
    maxPlayers: 15,
    durationMinutes: 25,
    rules:
      'Pose dilemma questions: "Would you rather sleep at an airport bench or camp in pouring rain?" Group discusses and votes.',
    materialsNeeded: 'None',
    isPreset: true,
    isFavorite: false,
  },
  {
    title: 'Word Association Blitz',
    category: 'car journey',
    minPlayers: 2,
    maxPlayers: 8,
    durationMinutes: 15,
    rules:
      'First player says a word, next has 3 seconds to say an associated word without hesitation or repetition. Slip up and you receive a fun penalty!',
    materialsNeeded: 'None',
    isPreset: true,
    isFavorite: false,
  },
  {
    title: 'Scavenger Hunt & Photo Challenge',
    category: 'outdoor',
    minPlayers: 4,
    maxPlayers: 20,
    durationMinutes: 60,
    rules:
      'Compete to find and photograph 5 unusual local items, street art, or landmark angles in the destination.',
    materialsNeeded: 'Phone cameras',
    isPreset: true,
    isFavorite: true,
  },
  {
    title: 'Guess the Song (3-Second Intro)',
    category: 'car journey',
    minPlayers: 3,
    maxPlayers: 15,
    durationMinutes: 25,
    rules:
      'DJ plays the first 3 seconds of a song. First person to shout the title or singer earns a point.',
    materialsNeeded: 'Phone & Car speaker',
    isPreset: true,
    isFavorite: false,
  },
  {
    title: 'Travel Bingo',
    category: 'outdoor',
    minPlayers: 2,
    maxPlayers: 10,
    durationMinutes: 50,
    rules:
      'Spot items during transit: yellow vintage scooter, sleeping dog, foreign license plate, street vendor yelling. First to 5 in a row yells Bingo!',
    materialsNeeded: 'Paper & pen or phone notes',
    isPreset: true,
    isFavorite: false,
  },
];

// @desc    Get games list (combines user custom games and preset catalog)
// @route   GET /api/games
// @access  Private
exports.getGames = async (req, res, next) => {
  try {
    const { category, isFavorite, search } = req.query;

    const userQuery = { userId: req.user._id };
    if (category && category !== 'All') userQuery.category = category;
    if (isFavorite === 'true') userQuery.isFavorite = true;
    if (search) userQuery.title = { $regex: search, $options: 'i' };

    const userGames = await Game.find(userQuery).sort({ createdAt: -1 });

    // Filter preset catalog
    let presets = DEFAULT_PRESET_GAMES;
    if (category && category !== 'All') {
      presets = presets.filter((g) => g.category.toLowerCase() === category.toLowerCase());
    }
    if (isFavorite === 'true') {
      presets = presets.filter((g) => g.isFavorite);
    }
    if (search) {
      presets = presets.filter((g) => g.title.toLowerCase().includes(search.toLowerCase()));
    }

    res.status(200).json({
      success: true,
      customGames: userGames,
      suggestedGames: presets,
      totalCount: userGames.length + presets.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add custom game
// @route   POST /api/games
// @access  Private
exports.createGame = async (req, res, next) => {
  try {
    const {
      title,
      category,
      minPlayers,
      maxPlayers,
      durationMinutes,
      rules,
      materialsNeeded,
      tripId,
      isFavorite,
    } = req.body;

    if (!title || !rules) {
      return res.status(400).json({ success: false, message: 'Game title and rules are required.' });
    }

    const game = await Game.create({
      userId: req.user._id,
      tripId: tripId || null,
      title,
      category: category || 'party',
      minPlayers: Number(minPlayers) || 2,
      maxPlayers: Number(maxPlayers) || 12,
      durationMinutes: Number(durationMinutes) || 30,
      rules,
      materialsNeeded: materialsNeeded || 'None',
      isFavorite: Boolean(isFavorite),
      isPreset: false,
    });

    res.status(201).json({
      success: true,
      data: game,
      message: 'Custom game created!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update custom game
// @route   PUT /api/games/:id
// @access  Private
exports.updateGame = async (req, res, next) => {
  try {
    let game = await Game.findOne({ _id: req.params.id, userId: req.user._id });
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found.' });
    }

    game = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: game,
      message: 'Game updated!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom game
// @route   DELETE /api/games/:id
// @access  Private
exports.deleteGame = async (req, res, next) => {
  try {
    const game = await Game.findOne({ _id: req.params.id, userId: req.user._id });
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found.' });
    }

    await Game.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Game deleted.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Pick a random game from presets & custom games
// @route   GET /api/games/random-picker
// @access  Private
exports.pickRandomGame = async (req, res, next) => {
  try {
    const { category, minPlayers } = req.query;

    const userGames = await Game.find({ userId: req.user._id });
    let pool = [...DEFAULT_PRESET_GAMES, ...userGames];

    if (category && category !== 'All') {
      pool = pool.filter((g) => g.category.toLowerCase() === category.toLowerCase());
    }
    if (minPlayers) {
      pool = pool.filter((g) => (g.minPlayers || 2) <= Number(minPlayers));
    }

    if (pool.length === 0) {
      pool = DEFAULT_PRESET_GAMES;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const selected = pool[randomIndex];

    res.status(200).json({
      success: true,
      data: selected,
    });
  } catch (error) {
    next(error);
  }
};

