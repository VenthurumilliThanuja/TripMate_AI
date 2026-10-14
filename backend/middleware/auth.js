const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ensureGuestUser = async () => {
  const guestEmail = process.env.GUEST_EMAIL || 'guest@tripmate.ai';

  let guestUser = await User.findOne({ email: guestEmail.toLowerCase() });
  if (!guestUser) {
    guestUser = await User.create({
      name: 'Guest Traveler',
      email: guestEmail.toLowerCase(),
      password: process.env.GUEST_PASSWORD || 'guest12345',
      currency: '₹',
      bio: 'Demo traveler access',
    });
  }

  return guestUser;
};

const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      req.user = await ensureGuestUser();
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'tripmate_super_secret_jwt_key_2026_secure'
    );

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      req.user = await ensureGuestUser();
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    req.user = await ensureGuestUser();
    next();
  }
};

module.exports = { protect };

