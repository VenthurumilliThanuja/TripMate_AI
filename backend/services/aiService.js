/**
 * AI Service for TripMate AI
 * Connects with Gemini LLM API if GEMINI_API_KEY is configured,
 * otherwise provides an intelligent, highly responsive domain heuristic engine.
 */

const https = require('https');

// Helper to call Gemini API if key is available
async function callGemini(promptText, image) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const payload = JSON.stringify({
      contents: [
        {
          parts: [
            { text: promptText },
            ...(image
              ? [
                  {
                    inline_data: {
                      mime_type: image.mimeType,
                      data: image.data,
                    },
                  },
                ]
              : []),
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
              resolve(data.candidates[0].content.parts[0].text);
            } else {
              console.warn('[Gemini API response warning]:', body.substring(0, 200));
              resolve(null);
            }
          } catch (e) {
            console.error('[Gemini JSON parse error]:', e);
            resolve(null);
          }
        });
      });

      req.on('error', (e) => {
        console.error('[Gemini Request error]:', e.message);
        resolve(null);
      });

      req.write(payload);
      req.end();
    });
  } catch (error) {
    console.error('[callGemini caught]:', error);
    return null;
  }
}

async function parseReceipt({ imageBase64, mimeType }) {
  const prompt = `Read this travel expense receipt and return only a JSON object with these fields:
- title: short merchant or expense description
- amount: final total paid as a number
- category: one of "Food", "Stay", "Transport", "Activities", "Shopping", or "Miscellaneous"
- date: receipt date in YYYY-MM-DD format, or null if it is not legible

Use the final amount charged, not a subtotal. Do not guess a date if it cannot be read.`;
  const response = await callGemini(prompt, { data: imageBase64, mimeType });
  if (!response) return null;

  try {
    const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    const amount = Number(parsed.amount);
    if (typeof parsed.title !== 'string' || !parsed.title.trim() || !Number.isFinite(amount) || amount <= 0) {
      return null;
    }

    const categories = ['Food', 'Stay', 'Transport', 'Activities', 'Shopping', 'Miscellaneous'];
    const category = categories.find(
      (value) => value.toLowerCase() === String(parsed.category || '').trim().toLowerCase()
    );
    let date = null;
    if (typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)) {
      const [year, month, day] = parsed.date.split('-').map(Number);
      const parsedDate = new Date(Date.UTC(year, month - 1, day));
      if (
        parsedDate.getUTCFullYear() === year &&
        parsedDate.getUTCMonth() === month - 1 &&
        parsedDate.getUTCDate() === day
      ) {
        date = parsed.date;
      }
    }

    return {
      title: parsed.title.trim().slice(0, 120),
      amount: Math.round(amount * 100) / 100,
      category: category || 'Miscellaneous',
      date,
    };
  } catch (error) {
    console.warn('[Receipt parsing warning]: Gemini returned invalid receipt data.');
    return null;
  }
}

/**
 * 1. AI Budget Analysis & Recommendations
 */
async function analyzeBudget({
  totalBudget,
  totalSpent,
  remainingBudget,
  destination,
  durationDays,
  numTravelers,
  travelStyle,
  categoryBreakdown,
}) {
  const daysLeft = Math.max(1, durationDays || 1);
  const safeDailySpending = Math.max(0, Math.round(remainingBudget / daysLeft));
  const isOverbudget = remainingBudget < 0;
  const overspentAmount = isOverbudget ? Math.abs(remainingBudget) : 0;
  const percentSpent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Identify high-spending categories
  const categoryAlerts = [];
  if (categoryBreakdown && Array.isArray(categoryBreakdown)) {
    categoryBreakdown.forEach((cat) => {
      if (cat.planned > 0 && cat.spent > cat.planned) {
        const excess = cat.spent - cat.planned;
        categoryAlerts.push({
          category: cat.category,
          planned: cat.planned,
          spent: cat.spent,
          excess,
          warning: `Exceeded ${cat.category} budget by ${excess} (${Math.round((excess / cat.planned) * 100)}% over planned).`,
        });
      }
    });
  }

  // Attempt LLM call
  const prompt = `You are TripMate AI travel budget advisor. Analyze this trip:
Destination: ${destination}
Duration: ${durationDays} days
Travelers: ${numTravelers}
Style: ${travelStyle}
Total Budget: ${totalBudget}
Total Spent: ${totalSpent}
Remaining Budget: ${remainingBudget}
Safe Daily Limit: ${safeDailySpending}
Overspent: ${isOverbudget ? overspentAmount : 'None'}
Categories: ${JSON.stringify(categoryBreakdown)}

Provide an evaluation in JSON format with fields:
- summary (2-3 sentences evaluation)
- realisticBudgetRating ("Realistic", "Tight", "Needs Revision", or "Generous")
- actionableTips (array of 3-4 specific money-saving tips for this destination and style)
- suggestedDailyCap (number)
- categoryAdvice (array of advice strings for major categories)`;

  const geminiResponse = await callGemini(prompt);
  if (geminiResponse) {
    try {
      const cleanJson = geminiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        ...parsed,
        safeDailyLimit: safeDailySpending,
        isOverbudget,
        overspentAmount,
        percentSpent,
        categoryAlerts,
        daysLeft,
        isEstimate: true,
      };
    } catch (e) {
      // Fall through to heuristics
    }
  }

  // Domain Heuristic Engine
  let rating = 'Realistic';
  let summary = '';
  if (isOverbudget) {
    rating = 'Needs Revision';
    summary = `You have exceeded your total trip budget by ${overspentAmount} (${percentSpent}% utilized). Urgent cost-cutting on shopping and optional activities is recommended for the remaining ${daysLeft} days.`;
  } else if (percentSpent > 80 && daysLeft > 2) {
    rating = 'Tight';
    summary = `You have spent ${percentSpent}% of your funds with ${daysLeft} days remaining. Your safe daily spending limit is now ${safeDailySpending} per day for the group.`;
  } else {
    rating = 'Realistic';
    summary = `Great financial discipline! You have ${remainingBudget} remaining for the remaining ${daysLeft} days. Your safe daily spending limit is approximately ${safeDailySpending} per day.`;
  }

  const actionableTips = [
    `Set a strict daily pocket allowance of ~${safeDailySpending} to stay comfortably on track.`,
    travelStyle === 'Budget' || travelStyle === 'Backpacker'
      ? `Opt for local street food hubs and metro/bus passes in ${destination} to save on daily transit.`
      : `Book group ride shares and prioritize complimentary hotel breakfasts to preserve activity funds.`,
    categoryAlerts.length > 0
      ? `Focus reductions on ${categoryAlerts[0].category}, which has already outpaced its planned threshold.`
      : `Reserve at least 10% of remaining funds (${Math.round(remainingBudget * 0.1)}) for unexpected travel contingencies.`,
    `Look for combo entry passes and free cultural attractions in ${destination} during afternoons.`,
  ];

  return {
    summary,
    realisticBudgetRating: rating,
    safeDailyLimit: safeDailySpending,
    isOverbudget,
    overspentAmount,
    percentSpent,
    categoryAlerts,
    daysLeft,
    actionableTips,
    suggestedDailyCap: safeDailySpending,
    categoryAdvice: [
      'Food: Balance one sit-down dinner with casual local lunch spots.',
      'Transport: Use app-based cabs or public transit instead of spontaneous spot hires.',
      'Activities: Book slot tickets online in advance to avoid surge pricing.',
      'Shopping: Designate a single souvenir shopping trip rather than impulse buys.',
    ],
    isEstimate: true,
  };
}

/**
 * 2. Suggest Budget Allocation for a New Trip
 */
function suggestBudgetAllocation(totalBudget, travelStyle = 'Moderate', durationDays = 3) {
  let percentages = {
    Stay: 0.35,
    Food: 0.25,
    Transport: 0.20,
    Activities: 0.12,
    Shopping: 0.08,
  };

  if (travelStyle === 'Budget' || travelStyle === 'Backpacker') {
    percentages = {
      Stay: 0.30,
      Food: 0.25,
      Transport: 0.25,
      Activities: 0.10,
      Shopping: 0.10,
    };
  } else if (travelStyle === 'Luxury') {
    percentages = {
      Stay: 0.45,
      Food: 0.25,
      Transport: 0.15,
      Activities: 0.10,
      Shopping: 0.05,
    };
  }

  const categories = Object.entries(percentages).map(([category, pct]) => ({
    category,
    plannedAmount: Math.round(totalBudget * pct),
    percentage: Math.round(pct * 100),
    description: `Recommended ${Math.round(pct * 100)}% allocation for ${travelStyle.toLowerCase()} style`,
  }));

  return categories;
}

/**
 * 3. AI Place Discovery
 */
async function suggestPlaces({ destination, travelStyle, interests = [], budget = 10000 }) {
  const prompt = `You are a travel discovery guide. Recommend 6 diverse must-visit places for a trip to "${destination}".
Interests: ${interests.join(', ') || 'Culture, Food, Adventure, Sightseeing'}
Travel style: ${travelStyle || 'Moderate'}
Budget: ${budget}

Return a valid JSON array of objects with fields:
- name (string)
- category (One of: "Tourist attractions", "Beaches", "Restaurants and cafes", "Historical places", "Shopping", "Nature and adventure", "Hidden gems", "Free attractions")
- address (string)
- estimatedCost (number approximate per person)
- openingHours (string e.g. "9:00 AM - 6:00 PM")
- priority ("High", "Medium", or "Low")
- suggestedDuration (string e.g. "2 hours")
- notes (string: why visit / tips)
- imageUrl (reliable Unsplash travel image URL)`;

  const geminiText = await callGemini(prompt);
  if (geminiText) {
    try {
      const cleanJson = geminiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p) => ({
          ...p,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${p.name} ${destination}`
          )}`,
          aiGenerated: true,
        }));
      }
    } catch (e) {
      // Fallback
    }
  }

  // Heuristic Place Suggestions tailored to destination
  const destLower = (destination || '').toLowerCase();
  let samplePlaces = [];

  if (destLower.includes('goa')) {
    samplePlaces = [
      {
        name: 'Palolem Beach & Silent Disco',
        category: 'Beaches',
        address: 'Canacona, South Goa',
        estimatedCost: 300,
        openingHours: 'Open 24 Hours',
        priority: 'High',
        suggestedDuration: '3-4 hours',
        notes: 'Crescent-shaped calm bay, great for sunset kayaking and beachside seafood shacks.',
        imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Aguada Fort & Lighthouse',
        category: 'Historical places',
        address: 'Candolim, North Goa',
        estimatedCost: 50,
        openingHours: '9:30 AM - 5:30 PM',
        priority: 'High',
        suggestedDuration: '2 hours',
        notes: '17th-century Portuguese fort with panoramic views of the Arabian Sea confluence.',
        imageUrl: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Dudhsagar Waterfalls Trek',
        category: 'Nature and adventure',
        address: 'Sonaulim, Goa-Karnataka border',
        estimatedCost: 800,
        openingHours: '7:00 AM - 4:00 PM',
        priority: 'Medium',
        suggestedDuration: '5 hours',
        notes: 'Four-tiered milky falls in Bhagwan Mahaveer Sanctuary. Jeep safari available.',
        imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Anjuna Flea Market & Curties Shack',
        category: 'Shopping',
        address: 'Anjuna Beach, North Goa',
        estimatedCost: 400,
        openingHours: '10:00 AM - 8:00 PM (Wednesdays)',
        priority: 'Medium',
        suggestedDuration: '2.5 hours',
        notes: 'Vibrant bohemian market with handmade crafts, spices, jewelry, and live music.',
        imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Fontainhas Latin Quarter Heritage Walk',
        category: 'Tourist attractions',
        address: 'Panaji, Central Goa',
        estimatedCost: 0,
        openingHours: 'All day',
        priority: 'High',
        suggestedDuration: '2 hours',
        notes: 'Charming pastel-colored colonial Portuguese mansions, art galleries, and quaint bakeries.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Fisherman’s Wharf Authentic Cuisine',
        category: 'Restaurants and cafes',
        address: 'Cavelossim / Panaji, Goa',
        estimatedCost: 750,
        openingHours: '12:00 PM - 11:00 PM',
        priority: 'Medium',
        suggestedDuration: '1.5 hours',
        notes: 'Iconic riverside dining serving Goan fish curry, prawn balchão, and live acoustic tunes.',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      },
    ];
  } else if (destLower.includes('manali') || destLower.includes('himachal')) {
    samplePlaces = [
      {
        name: 'Solang Valley Adventure Hub',
        category: 'Nature and adventure',
        address: 'Solang Valley, Manali',
        estimatedCost: 1200,
        openingHours: '9:00 AM - 6:00 PM',
        priority: 'High',
        suggestedDuration: '4 hours',
        notes: 'Epic snow views, paragliding, zorbing, and ropeway ride.',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Hadimba Devi Temple',
        category: 'Historical places',
        address: 'Dhungri Forest, Old Manali',
        estimatedCost: 20,
        openingHours: '8:00 AM - 6:00 PM',
        priority: 'High',
        suggestedDuration: '1.5 hours',
        notes: 'Unique 16th-century wooden pagoda temple nestled among towering cedar trees.',
        imageUrl: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Old Manali Cafe Crawl',
        category: 'Restaurants and cafes',
        address: 'Old Manali Road',
        estimatedCost: 450,
        openingHours: '10:00 AM - 11:00 PM',
        priority: 'Medium',
        suggestedDuration: '3 hours',
        notes: 'Vibrant hippie vibe, live acoustic music, wood-fired pizza, and mountain views.',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Jogini Waterfall Hike',
        category: 'Nature and adventure',
        address: 'Vashisht Village, Manali',
        estimatedCost: 0,
        openingHours: 'Sunrise to Sunset',
        priority: 'High',
        suggestedDuration: '3 hours',
        notes: 'Scenic pine forest trek leading to dramatic cascading falls with natural pools.',
        imageUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Mall Road & Tibetan Monasteries',
        category: 'Shopping',
        address: 'Central Manali',
        estimatedCost: 500,
        openingHours: '10:00 AM - 9:00 PM',
        priority: 'Medium',
        suggestedDuration: '2 hours',
        notes: 'Kullu shawls, wooden souvenirs, warm momos, and serene prayer wheels.',
        imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Atal Tunnel & Sissu Day Trip',
        category: 'Tourist attractions',
        address: 'Lahaul Valley, Himachal Pradesh',
        estimatedCost: 800,
        openingHours: 'Daytime',
        priority: 'High',
        suggestedDuration: '5 hours',
        notes: 'Engineering marvel tunnel opening into stark, breathtaking Himalayan landscapes.',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      },
    ];
  } else {
    // Universal versatile set based on generic destination
    const capDest = destination || 'Your Destination';
    samplePlaces = [
      {
        name: `${capDest} Historic Old Town & Heritage Square`,
        category: 'Historical places',
        address: `Central Heritage District, ${capDest}`,
        estimatedCost: 150,
        openingHours: '9:00 AM - 6:00 PM',
        priority: 'High',
        suggestedDuration: '2.5 hours',
        notes: `Explore architectural marvels, cobblestone pathways, and timeless local lore.`,
        imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: `${capDest} Panoramic Viewpoint & Sky Trail`,
        category: 'Nature and adventure',
        address: `Lookout Hills, ${capDest}`,
        estimatedCost: 50,
        openingHours: '6:00 AM - 8:00 PM',
        priority: 'High',
        suggestedDuration: '2 hours',
        notes: `Spectacular 360-degree skyline views, ideal for sunrise or sunset photography.`,
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: `Artisan Night Bazaar & Street Food Lane`,
        category: 'Shopping',
        address: `Bazaar Street, ${capDest}`,
        estimatedCost: 350,
        openingHours: '5:00 PM - 11:00 PM',
        priority: 'Medium',
        suggestedDuration: '2 hours',
        notes: `Immerse in local crafts, traditional snacks, and bustling community atmosphere.`,
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: `The Heritage Culinary Bistro`,
        category: 'Restaurants and cafes',
        address: `Main Boulevard, ${capDest}`,
        estimatedCost: 600,
        openingHours: '11:00 AM - 10:30 PM',
        priority: 'High',
        suggestedDuration: '1.5 hours',
        notes: `Celebrated authentic regional cuisine prepared with farm-fresh ingredients.`,
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: `Peace Garden & Botanical Sanctuary`,
        category: 'Free attractions',
        address: `Green Belt, ${capDest}`,
        estimatedCost: 0,
        openingHours: '6:00 AM - 7:00 PM',
        priority: 'Medium',
        suggestedDuration: '1.5 hours',
        notes: `Peaceful retreat with shaded lawns, exotic flora, and reflection ponds.`,
        imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: `Secret Alley Secret Speakeasy & Acoustic Lounge`,
        category: 'Hidden gems',
        address: `Lantern Lane, ${capDest}`,
        estimatedCost: 500,
        openingHours: '6:00 PM - 1:00 AM',
        priority: 'Medium',
        suggestedDuration: '2 hours',
        notes: `Charming tucked-away venue with signature beverages and warm group vibes.`,
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      },
    ];
  }

  return samplePlaces.map((p) => ({
    ...p,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${p.name} ${destination}`
    )}`,
    aiGenerated: true,
  }));
}

/**
 * 4. AI Trip Planner & Itinerary Generator
 */
async function generateItinerary({
  destination,
  durationDays = 3,
  budget,
  numTravelers = 2,
  interests = ['Sightseeing', 'Food'],
  travelPreferences = 'Balanced',
  preferredPace = 'Moderate',
  transportation = 'Cab & Walking',
}) {
  const daysCount = Math.max(1, Math.min(10, durationDays));

  const prompt = `You are a master travel planner. Generate a customized ${daysCount}-day itinerary for ${destination}.
Travelers: ${numTravelers}
Budget: ${budget}
Interests: ${interests.join(', ')}
Pace: ${preferredPace}
Transport: ${transportation}

Return a valid JSON array of day objects:
[
  {
    "dayNumber": 1,
    "theme": "Arrival & City Highlights",
    "activities": [
      {
        "timeSlot": "Morning",
        "time": "09:00 AM",
        "title": "activity title",
        "description": "brief activity description",
        "location": "location name",
        "estimatedCost": 200,
        "travelTime": "20 mins",
        "category": "Sightseeing",
        "budgetAlternative": "free walk alternative"
      },
      { "timeSlot": "Afternoon", ... },
      { "timeSlot": "Evening", ... }
    ]
  }
]`;

  const geminiText = await callGemini(prompt);
  if (geminiText) {
    try {
      const cleanJson = geminiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      // Fallback
    }
  }

  // Heuristic Itinerary Planner
  const days = [];
  const themes = [
    'Arrival, Check-in & Iconic Landmarks',
    'Cultural Immersion & Hidden Local Gems',
    'Adventure, Nature & Scenic Vistas',
    'Culinary Trails & Relaxation',
    'Shopping, Photography & Farewell Celebrations',
  ];

  for (let d = 1; d <= daysCount; d++) {
    const theme = themes[(d - 1) % themes.length];
    days.push({
      dayNumber: d,
      theme: `Day ${d}: ${theme}`,
      activities: [
        {
          timeSlot: 'Morning',
          time: '09:00 AM',
          title: `Explore Primary Monument & Morning Heritage in ${destination}`,
          description: `Kick off with the most famous architectural landmark before midday crowds arrive.`,
          location: `${destination} Landmark District`,
          estimatedCost: Math.round(budget ? (budget * 0.05) / daysCount : 300),
          travelTime: '25 mins drive',
          category: 'Sightseeing',
          budgetAlternative: 'Self-guided outdoor garden walk with free entry',
        },
        {
          timeSlot: 'Afternoon',
          time: '01:00 PM',
          title: `Traditional Lunch Feast & Indoor Cultural Museum`,
          description: `Savor authentic regional dishes followed by an air-conditioned gallery or market visit.`,
          location: `Old Market Quarter, ${destination}`,
          estimatedCost: Math.round(budget ? (budget * 0.06) / daysCount : 450),
          travelTime: '15 mins walking',
          category: 'Meal',
          budgetAlternative: 'Local canteen thali / street snack crawl',
        },
        {
          timeSlot: 'Evening',
          time: '05:30 PM',
          title: `Sunset Viewpoint, Cafe Chill & Group Stroll`,
          description: `Unwind at a panoramic lookout point, take memorable group photos, and enjoy evening acoustic ambiance.`,
          location: `Sunset Boulevard, ${destination}`,
          estimatedCost: Math.round(budget ? (budget * 0.04) / daysCount : 250),
          travelTime: '20 mins transit',
          category: 'Rest/Free Time',
          budgetAlternative: 'Public promenade seating with tea/coffee stalls',
        },
      ],
    });
  }

  return days;
}

/**
 * 5. AI Suggest Games
 */
async function suggestGames({ numPlayers = 4, category = 'party', setting = 'indoor', vibe = 'fun' }) {
  const prompt = `You are an event entertainer. Suggest 4 engaging travel group games for ${numPlayers} friends.
Setting: ${setting} (${category})
Vibe: ${vibe}

Return a valid JSON array of objects with fields:
- title (string)
- category ("indoor", "outdoor", "car journey", "party")
- minPlayers (number)
- maxPlayers (number)
- durationMinutes (number)
- rules (string: clear step by step rules)
- materialsNeeded (string)
- isFavorite (boolean)`;

  const geminiText = await callGemini(prompt);
  if (geminiText) {
    try {
      const cleanJson = geminiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((g) => ({ ...g, aiGenerated: true }));
      }
    } catch (e) {
      // Fallback
    }
  }

  // Heuristic Games Catalog
  const presetCatalog = [
    {
      title: 'Dumb Charades — Travel Edition',
      category: 'party',
      minPlayers: 4,
      maxPlayers: 16,
      durationMinutes: 45,
      rules:
        'Divide into two teams. One player acts out a famous movie, travel destination, or local dish without speaking. Team has 60 seconds to guess.',
      materialsNeeded: 'Timer on phone, slip of papers for prompts',
      isFavorite: true,
      aiGenerated: true,
    },
    {
      title: 'Antakshari — Road Trip Melodies',
      category: 'car journey',
      minPlayers: 3,
      maxPlayers: 20,
      durationMinutes: 30,
      rules:
        'Teams sing songs starting with the last letter of the opponent team song. No repeating songs already sung in the round!',
      materialsNeeded: 'Zero props required (perfect in cars or buses)',
      isFavorite: true,
      aiGenerated: true,
    },
    {
      title: '20 Questions (Traveler Edition)',
      category: 'car journey',
      minPlayers: 2,
      maxPlayers: 10,
      durationMinutes: 20,
      rules:
        'One player secretly thinks of a destination, landmark, or mutual friend. The group asks up to 20 Yes/No questions to deduce the answer.',
      materialsNeeded: 'None',
      isFavorite: false,
      aiGenerated: true,
    },
    {
      title: 'Never Have I Ever (Campfire / Balcony)',
      category: 'indoor',
      minPlayers: 3,
      maxPlayers: 12,
      durationMinutes: 35,
      rules:
        'Everyone holds up 5 fingers. Players take turns stating something they have never done (e.g., missed a train, lost luggage). Anyone who has done it puts a finger down. Last person standing wins!',
      materialsNeeded: 'Beverages or snacks',
      isFavorite: true,
      aiGenerated: true,
    },
    {
      title: 'Photo Scavenger Hunt',
      category: 'outdoor',
      minPlayers: 4,
      maxPlayers: 15,
      durationMinutes: 60,
      rules:
        'Create a list of 10 quirky photo challenges (e.g., pose with a stray dog, selfie with a vintage car, photo of an unusual menu item). First team back with all photos verified wins!',
      materialsNeeded: 'Smartphones with cameras',
      isFavorite: true,
      aiGenerated: true,
    },
  ];

  return presetCatalog;
}

module.exports = {
  analyzeBudget,
  suggestBudgetAllocation,
  suggestPlaces,
  generateItinerary,
  suggestGames,
  parseReceipt,
};
