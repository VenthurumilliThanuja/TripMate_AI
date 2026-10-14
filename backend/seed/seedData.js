const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const Friend = require('../models/Friend');
const Place = require('../models/Place');
const ItineraryActivity = require('../models/Itinerary');
const Playlist = require('../models/Playlist');
const Game = require('../models/Game');

dotenv.config();

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tripmate';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Trip.deleteMany({});
    await Expense.deleteMany({});
    await Friend.deleteMany({});
    await Place.deleteMany({});
    await ItineraryActivity.deleteMany({});
    await Playlist.deleteMany({});
    await Game.deleteMany({});

    console.log('Cleared existing collections.');

    // 1. Create Demo User
    const user = await User.create({
      name: 'Venkata Thanuja',
      email: 'demo@tripmate.ai',
      password: 'password123',
      currency: '₹',
      bio: 'Travel enthusiast, photographer & group trip coordinator.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    });

    console.log(`Created user: ${user.email} (Password: password123)`);

    // 2. Create Friends
    const friendRahul = await Friend.create({
      userId: user._id,
      name: 'Rahul Sharma',
      nickname: 'Captain',
      phone: '+91 98765 43210',
      email: 'rahul.s@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      isEmergencyContact: true,
      relationship: 'Friend',
      notes: 'Car driver & navigator on highway trips.',
    });

    const friendPriya = await Friend.create({
      userId: user._id,
      name: 'Priya Patel',
      nickname: 'DJ Priya',
      phone: '+91 98765 43211',
      email: 'priya.p@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isEmergencyContact: false,
      relationship: 'Friend',
      notes: 'Handles music playlists & food orders.',
    });

    const friendAmit = await Friend.create({
      userId: user._id,
      name: 'Amit Verma',
      nickname: 'Bunny',
      phone: '+91 98765 43212',
      email: 'amit.v@example.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      isEmergencyContact: false,
      relationship: 'Travel Buddy',
      notes: 'Keeps track of tickets and reservations.',
    });

    console.log('Created 3 travel companions.');

    // 3. Create Goa Trip 2027
    const trip = await Trip.create({
      userId: user._id,
      title: 'Goa Friends Trip 2027',
      destination: 'Goa, India',
      startDate: new Date('2027-02-14'),
      endDate: new Date('2027-02-18'),
      totalBudget: 20000,
      numTravelers: 4,
      friends: [
        { friendId: friendRahul._id, name: friendRahul.name, phone: friendRahul.phone, email: friendRahul.email },
        { friendId: friendPriya._id, name: friendPriya.name, phone: friendPriya.phone, email: friendPriya.email },
        { friendId: friendAmit._id, name: friendAmit.name, phone: friendAmit.phone, email: friendAmit.email },
      ],
      description: 'Annual beach vacation with college friends exploring sun, sand, shacks, and seafood.',
      coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      travelStyle: 'Moderate',
      status: 'upcoming',
      categoryBudgets: [
        { category: 'Food', description: 'Restaurants and snacks', plannedAmount: 5000 },
        { category: 'Stay', description: 'Hotels and rooms', plannedAmount: 8000 },
        { category: 'Transport', description: 'Bus, train, fuel', plannedAmount: 4000 },
        { category: 'Activities', description: 'Tickets and activities', plannedAmount: 2000 },
        { category: 'Shopping', description: 'Personal shopping', plannedAmount: 1000 },
      ],
    });

    console.log(`Created Trip: ${trip.title}`);

    // 4. Create Initial Expenses matching the prompt specification
    // Food: 1800, Stay: 6000, Transport: 2500, Activities: 700, Shopping: 400 -> Total Spent: 11400 / 20000 -> Remaining: 8600
    const expenses = [
      {
        tripId: trip._id,
        userId: user._id,
        title: 'Seaside Dinner at Fisherman’s Wharf',
        amount: 1800,
        category: 'Food',
        date: new Date('2027-02-14T20:00:00Z'),
        payer: { name: 'Venkata Thanuja' },
        splitType: 'equal',
        participants: [
          { name: 'Venkata Thanuja', shareAmount: 450 },
          { name: 'Rahul Sharma', shareAmount: 450 },
          { name: 'Priya Patel', shareAmount: 450 },
          { name: 'Amit Verma', shareAmount: 450 },
        ],
        status: 'paid',
        notes: 'Delicious prawns curry, garlic naan and juices.',
      },
      {
        tripId: trip._id,
        userId: user._id,
        title: 'Boutique Beach Resort Villa (2 Nights)',
        amount: 6000,
        category: 'Stay',
        date: new Date('2027-02-14T12:00:00Z'),
        payer: { name: 'Rahul Sharma' },
        splitType: 'equal',
        participants: [
          { name: 'Venkata Thanuja', shareAmount: 1500 },
          { name: 'Rahul Sharma', shareAmount: 1500 },
          { name: 'Priya Patel', shareAmount: 1500 },
          { name: 'Amit Verma', shareAmount: 1500 },
        ],
        status: 'paid',
        notes: 'Ocean view 2BHK villa with pool access.',
      },
      {
        tripId: trip._id,
        userId: user._id,
        title: 'Self-Drive SUV Rental & Fuel',
        amount: 2500,
        category: 'Transport',
        date: new Date('2027-02-14T10:00:00Z'),
        payer: { name: 'Venkata Thanuja' },
        splitType: 'equal',
        participants: [
          { name: 'Venkata Thanuja', shareAmount: 625 },
          { name: 'Rahul Sharma', shareAmount: 625 },
          { name: 'Priya Patel', shareAmount: 625 },
          { name: 'Amit Verma', shareAmount: 625 },
        ],
        status: 'paid',
        notes: 'Covered pickup from airport and initial fuel refill.',
      },
      {
        tripId: trip._id,
        userId: user._id,
        title: 'Scuba Diving & Water Sports Combo',
        amount: 700,
        category: 'Activities',
        date: new Date('2027-02-15T11:00:00Z'),
        payer: { name: 'Priya Patel' },
        splitType: 'equal',
        participants: [
          { name: 'Venkata Thanuja', shareAmount: 175 },
          { name: 'Rahul Sharma', shareAmount: 175 },
          { name: 'Priya Patel', shareAmount: 175 },
          { name: 'Amit Verma', shareAmount: 175 },
        ],
        status: 'paid',
        notes: 'Introductory dive at Grande Island.',
      },
      {
        tripId: trip._id,
        userId: user._id,
        title: 'Handmade Cashews & Beachwear Souvenirs',
        amount: 400,
        category: 'Shopping',
        date: new Date('2027-02-16T18:00:00Z'),
        payer: { name: 'Amit Verma' },
        splitType: 'equal',
        participants: [
          { name: 'Venkata Thanuja', shareAmount: 100 },
          { name: 'Rahul Sharma', shareAmount: 100 },
          { name: 'Priya Patel', shareAmount: 100 },
          { name: 'Amit Verma', shareAmount: 100 },
        ],
        status: 'paid',
        notes: 'Anjuna market mementos for the team.',
      },
    ];

    await Expense.insertMany(expenses);
    console.log(`Inserted ${expenses.length} sample expenses.`);

    // 5. Create Places to Visit
    await Place.insertMany([
      {
        tripId: trip._id,
        userId: user._id,
        name: 'Palolem Beach & Silent Disco',
        category: 'Beaches',
        address: 'Canacona, South Goa',
        estimatedCost: 300,
        openingHours: 'Open 24 Hours',
        priority: 'High',
        isVisited: true,
        isWishlist: false,
        dayNumber: 1,
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Palolem+Beach+Goa',
        notes: 'Serene crescent bay with sunset kayaking.',
        imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
        suggestedDuration: '3-4 hours',
      },
      {
        tripId: trip._id,
        userId: user._id,
        name: 'Aguada Fort & Lighthouse',
        category: 'Historical places',
        address: 'Candolim, North Goa',
        estimatedCost: 50,
        openingHours: '9:30 AM - 5:30 PM',
        priority: 'High',
        isVisited: false,
        isWishlist: true,
        dayNumber: 2,
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Aguada+Fort+Goa',
        notes: '17th-century Portuguese fortress overlooking Arabian Sea.',
        imageUrl: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=800&q=80',
        suggestedDuration: '2 hours',
      },
      {
        tripId: trip._id,
        userId: user._id,
        name: 'Dudhsagar Waterfalls Trek',
        category: 'Nature and adventure',
        address: 'Sonaulim, Goa border',
        estimatedCost: 800,
        openingHours: '7:00 AM - 4:00 PM',
        priority: 'Medium',
        isVisited: false,
        isWishlist: true,
        dayNumber: 3,
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Dudhsagar+Falls+Goa',
        notes: 'Spectacular multi-tiered waterfall in Bhagwan Mahaveer Wildlife Sanctuary.',
        imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
        suggestedDuration: '5 hours',
      },
    ]);

    // 6. Create Itinerary
    await ItineraryActivity.insertMany([
      {
        tripId: trip._id,
        userId: user._id,
        dayNumber: 1,
        timeSlot: 'Morning',
        time: '10:00 AM',
        title: 'Check-in & Calangute Beach Walk',
        description: 'Arrive at the resort, drop luggage and head out for fresh sea breeze and coconut water.',
        location: 'Calangute, North Goa',
        estimatedCost: 200,
        travelTime: '30 mins from Dabolim',
        category: 'Sightseeing',
      },
      {
        tripId: trip._id,
        userId: user._id,
        dayNumber: 1,
        timeSlot: 'Afternoon',
        time: '01:30 PM',
        title: 'Goan Fish Curry Lunch at Britto’s',
        description: 'Traditional shack feast featuring Kingfish thali and butter garlic calamari.',
        location: 'Baga Beach',
        estimatedCost: 650,
        travelTime: '10 mins walk',
        category: 'Meal',
      },
      {
        tripId: trip._id,
        userId: user._id,
        dayNumber: 1,
        timeSlot: 'Evening',
        time: '05:30 PM',
        title: 'Sunset at Chapora Fort (Dil Chahta Hai point)',
        description: 'Panoramic dusk views over the Vagator coastline with group photo shoot.',
        location: 'Chapora, Goa',
        estimatedCost: 50,
        travelTime: '20 mins drive',
        category: 'Sightseeing',
      },
    ]);

    // 7. Create Music Playlists
    await Playlist.create({
      tripId: trip._id,
      userId: user._id,
      name: 'Goa Coastal Road Trip 2027',
      mood: 'Road Trip',
      description: 'Feel-good anthems, chill indie grooves and acoustic tracks for driving along palm roads.',
      spotifyEmbedUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX14fiWYoe7Oh',
      songs: [
        {
          title: 'Ilahi',
          artist: 'Arijit Singh',
          duration: '3:48',
          coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
        },
        {
          title: 'Sooraj Dooba Hain',
          artist: 'Arijit Singh, Aditi Singh Sharma',
          duration: '4:24',
          coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
        },
        {
          title: 'Dil Chahta Hai',
          artist: 'Shankar Mahadevan',
          duration: '5:12',
          coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=300&q=80',
        },
      ],
    });

    console.log('Seed database completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedDB();

