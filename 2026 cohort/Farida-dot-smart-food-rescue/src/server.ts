import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_VENDORS,
  INITIAL_PANTRIES,
  INITIAL_VOLUNTEERS,
  INITIAL_LISTINGS,
  INITIAL_MATCHES,
  INITIAL_IMPACT_LOGS
} from './src/mockData';
import {
  Vendor,
  Pantry,
  Volunteer,
  Listing,
  Match,
  ImpactLog,
  AlgorithmWeights,
  ImpactSummary
} from './src/types';
import { computeMatchScore, DEFAULT_WEIGHTS } from './src/matchingEngine';

// In-Memory Database Store for prototype execution
let dbVendors: Vendor[] = JSON.parse(JSON.stringify(INITIAL_VENDORS));
let dbPantries: Pantry[] = JSON.parse(JSON.stringify(INITIAL_PANTRIES));
let dbVolunteers: Volunteer[] = JSON.parse(JSON.stringify(INITIAL_VOLUNTEERS));
let dbListings: Listing[] = JSON.parse(JSON.stringify(INITIAL_LISTINGS));
let dbMatches: Match[] = JSON.parse(JSON.stringify(INITIAL_MATCHES));
let dbImpactLogs: ImpactLog[] = JSON.parse(JSON.stringify(INITIAL_IMPACT_LOGS));
let currentWeights: AlgorithmWeights = { ...DEFAULT_WEIGHTS };

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI client server-side lazily or safely
  let genAI: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey !== 'YOUR_API_KEY') {
    try {
      genAI = new GoogleGenAI({ apiKey });
    } catch (e) {
      console.warn('Gemini AI initialization warning:', e);
    }
  }

  // --- API ROUTES ---

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'Mlo Mtaani', version: '1.0.0' });
  });

  // 2. Vendors API
  app.get('/api/vendors', (req, res) => {
    res.json(dbVendors);
  });

  app.post('/api/vendors', (req, res) => {
    const newVendor: Vendor = {
      vendor_id: `v_${Date.now()}`,
      created_at: new Date().toISOString(),
      ...req.body
    };
    dbVendors.unshift(newVendor);
    res.status(201).json(newVendor);
  });

  // 3. Pantries API
  app.get('/api/pantries', (req, res) => {
    res.json(dbPantries);
  });

  app.post('/api/pantries', (req, res) => {
    const newPantry: Pantry = {
      pantry_id: `p_${Date.now()}`,
      created_at: new Date().toISOString(),
      recent_pickups_count: 0,
      ...req.body
    };
    dbPantries.unshift(newPantry);
    res.status(201).json(newPantry);
  });

  // 4. Volunteers API
  app.get('/api/volunteers', (req, res) => {
    res.json(dbVolunteers);
  });

  app.post('/api/volunteers', (req, res) => {
    const newVolunteer: Volunteer = {
      volunteer_id: `vol_${Date.now()}`,
      status: 'available',
      total_deliveries: 0,
      ...req.body
    };
    dbVolunteers.unshift(newVolunteer);
    res.status(201).json(newVolunteer);
  });

  // 5. Listings API (Surplus Food Items)
  app.get('/api/listings', (req, res) => {
    res.json(dbListings);
  });

  // Under-60-second surplus item creation endpoint
  app.post('/api/listings', (req, res) => {
    const { vendor_id, item_name, category, quantity, unit, expiry_hours, expiry_at, notes, vendor_location, photo_url } = req.body;

    const vendor = dbVendors.find(v => v.vendor_id === vendor_id) || dbVendors[0];

    // Calculate expiry timestamp
    let finalExpiryAt = expiry_at;
    if (!finalExpiryAt && expiry_hours) {
      finalExpiryAt = new Date(Date.now() + Number(expiry_hours) * 3600 * 1000).toISOString();
    } else if (!finalExpiryAt) {
      finalExpiryAt = new Date(Date.now() + 6 * 3600 * 1000).toISOString(); // Default 6 hrs
    }

    const newListing: Listing = {
      listing_id: `lst_${Date.now()}`,
      vendor_id: vendor.vendor_id,
      vendor_name: vendor.name,
      vendor_address: vendor.location.address,
      vendor_location: vendor_location || vendor.location,
      item_name,
      category: category || 'produce',
      quantity: Number(quantity) || 10,
      unit: unit || 'kg',
      expiry_at: finalExpiryAt,
      status: 'open',
      created_at: new Date().toISOString(),
      photo_url,
      notes
    };

    dbListings.unshift(newListing);

    // Auto-calculate instant top match preview for vendor feedback
    const pantryRankings = dbPantries.map(pantry => {
      const matchResult = computeMatchScore(newListing, pantry, vendor, currentWeights);
      return {
        pantry,
        ...matchResult
      };
    }).sort((a, b) => b.score - a.score);

    res.status(201).json({
      listing: newListing,
      topMatchesPreview: pantryRankings.slice(0, 3)
    });
  });

  // 6. Matching Engine API
  // Get all active matches
  app.get('/api/matches', (req, res) => {
    res.json(dbMatches);
  });

  // Get ranked shortlist for a specific listing or for all open listings
  app.get('/api/matches/rankings', (req, res) => {
    const listingId = req.query.listing_id as string;
    let targetListings = dbListings.filter(l => l.status === 'open');

    if (listingId) {
      targetListings = targetListings.filter(l => l.listing_id === listingId);
    }

    const rankedMatches = [];

    for (const listing of targetListings) {
      const vendor = dbVendors.find(v => v.vendor_id === listing.vendor_id) || {
        vendor_id: listing.vendor_id,
        name: listing.vendor_name,
        type: 'grocery_store' as const,
        location: listing.vendor_location,
        contact: 'N/A',
        created_at: listing.created_at
      };

      for (const pantry of dbPantries) {
        const { score, breakdown } = computeMatchScore(listing, pantry, vendor, currentWeights);
        rankedMatches.push({
          listing,
          pantry,
          vendor,
          score,
          breakdown
        });
      }
    }

    // Sort by composite match score descending
    rankedMatches.sort((a, b) => b.score - a.score);
    res.json(rankedMatches);
  });

  // 1-Tap Reserve Match (Pantry reserves listing)
  app.post('/api/matches/reserve', (req, res) => {
    const { listing_id, pantry_id } = req.body;

    const listing = dbListings.find(l => l.listing_id === listing_id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.status !== 'open') {
      return res.status(400).json({ error: `Listing is already ${listing.status}` });
    }

    const pantry = dbPantries.find(p => p.pantry_id === pantry_id) || dbPantries[0];
    const vendor = dbVendors.find(v => v.vendor_id === listing.vendor_id) || {
      vendor_id: listing.vendor_id,
      name: listing.vendor_name,
      type: 'grocery_store' as const,
      location: listing.vendor_location,
      contact: 'N/A',
      created_at: listing.created_at
    };

    // Calculate score
    const { score, breakdown } = computeMatchScore(listing, pantry, vendor, currentWeights);

    // Pick an available volunteer
    const availableVolunteer = dbVolunteers.find(v => v.status === 'available') || dbVolunteers[0];

    // Mark listing reserved
    listing.status = 'reserved';

    const newMatch: Match = {
      match_id: `m_${Date.now()}`,
      listing_id: listing.listing_id,
      pantry_id: pantry.pantry_id,
      volunteer_id: availableVolunteer ? availableVolunteer.volunteer_id : undefined,
      score,
      breakdown,
      status: 'assigned',
      matched_at: new Date().toISOString(),
      listing,
      pantry,
      vendor,
      volunteer: availableVolunteer
    };

    dbMatches.unshift(newMatch);

    // Update pantry recent pickup count
    pantry.recent_pickups_count = (pantry.recent_pickups_count || 0) + 1;

    res.json({ message: 'Match successfully reserved and assigned!', match: newMatch });
  });

  // Volunteer Claims Task
  app.post('/api/matches/:id/claim', (req, res) => {
    const matchId = req.params.id;
    const { volunteer_id } = req.body;

    const match = dbMatches.find(m => m.match_id === matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const volunteer = dbVolunteers.find(v => v.volunteer_id === volunteer_id) || dbVolunteers[0];
    match.volunteer_id = volunteer.volunteer_id;
    match.volunteer = volunteer;
    match.status = 'picked_up';

    if (volunteer) {
      volunteer.status = 'busy';
    }

    res.json({ message: 'Task claimed for pickup', match });
  });

  // Volunteer Marks Task Delivered
  app.post('/api/matches/:id/deliver', (req, res) => {
    const matchId = req.params.id;

    const match = dbMatches.find(m => m.match_id === matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    match.status = 'delivered';

    // Update listing status
    if (match.listing) {
      const listing = dbListings.find(l => l.listing_id === match.listing_id);
      if (listing) listing.status = 'completed';
    }

    // Free up volunteer & increment deliveries count
    if (match.volunteer_id) {
      const vol = dbVolunteers.find(v => v.volunteer_id === match.volunteer_id);
      if (vol) {
        vol.status = 'available';
        vol.total_deliveries = (vol.total_deliveries || 0) + 1;
      }
    }

    // Calculate redirect quantity & impact metrics
    const quantity = match.listing ? match.listing.quantity : 20;
    const kg = match.listing?.unit === 'units' ? quantity * 0.5 : quantity; // Convert units to estimated kg
    const meals = Math.round(kg * 2.5);
    const co2 = Math.round(kg * 2.5);

    const impactLog: ImpactLog = {
      log_id: `log_${Date.now()}`,
      match_id: match.match_id,
      kg_redirected: kg,
      meals_estimated: meals,
      co2_avoided_kg: co2,
      timestamp: new Date().toISOString(),
      item_name: match.listing?.item_name || 'Surplus Food Batch',
      pantry_name: match.pantry?.name || 'Community Pantry',
      vendor_name: match.vendor?.name || 'Local Vendor'
    };

    dbImpactLogs.unshift(impactLog);

    res.json({ message: 'Delivery completed & impact logged!', match, impactLog });
  });

  // 7. Impact Summary & Logs API
  app.get('/api/impact', (req, res) => {
    const totalKg = dbImpactLogs.reduce((acc, log) => acc + log.kg_redirected, 0);
    const totalMeals = dbImpactLogs.reduce((acc, log) => acc + log.meals_estimated, 0);
    const completedMatches = dbMatches.filter(m => m.status === 'delivered').length;
    const co2Avoided = dbImpactLogs.reduce((acc, log) => acc + log.co2_avoided_kg, 0);

    const summary: ImpactSummary = {
      total_kg_redirected: Math.round(totalKg * 10) / 10,
      total_meals_estimated: Math.round(totalMeals),
      matches_completed: completedMatches,
      co2_avoided_kg: Math.round(co2Avoided * 10) / 10,
      active_listings_count: dbListings.filter(l => l.status === 'open').length,
      available_volunteers_count: dbVolunteers.filter(v => v.status === 'available').length
    };

    res.json({
      summary,
      recentLogs: dbImpactLogs
    });
  });

  // 8. Dynamic Matching Weights Config API
  app.get('/api/algorithm/weights', (req, res) => {
    res.json(currentWeights);
  });

  app.post('/api/algorithm/weights', (req, res) => {
    const { w1, w2, w3 } = req.body;
    currentWeights = {
      w1: Number(w1) || 0.4,
      w2: Number(w2) || 0.4,
      w3: Number(w3) || 0.2
    };
    res.json({ message: 'Matching algorithm weights updated', weights: currentWeights });
  });

  // 9. Gemini AI recipe / redistribution advice for pantries
  app.post('/api/ai/recipe-ideas', async (req, res) => {
    const { items, pantryName } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Please provide items list' });
    }

    if (!genAI) {
      return res.json({
        recipeIdeas: [
          {
            title: 'Community Ugali & Stew Feast',
            prepTime: '25 mins',
            servings: '120 meals',
            instructions: 'Combine vegetables into a rich tomato stew served alongside hot maize ugali.',
            safetyTip: 'Ensure greens are washed thoroughly with sanitized water.'
          },
          {
            title: 'High-Protein Fresh Fruit & Milk Porridge',
            prepTime: '15 mins',
            servings: '80 portions',
            instructions: 'Warm pasteurized milk with mashed bananas and porridge grains for early morning distribution.',
            safetyTip: 'Keep milk chilled under 4°C until cooking.'
          }
        ]
      });
    }

    try {
      const prompt = `You are a nutrition & food rescue specialist for "Mlo Mtaani" in Nairobi, Kenya.
A community pantry (${pantryName || 'Nairobi Pantry'}) has received the following rescued surplus food items:
${JSON.stringify(items)}

Provide 2 practical, culturally relevant Kenyan community meal ideas (e.g. Sukuma wiki stew, githeri boost, fruit mash) with preparation tips and food safety advice for high-volume feeding.
Format response as strict JSON array with keys: title, prepTime, servings, instructions, safetyTip.`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      // Parse JSON from output
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const recipes = JSON.parse(jsonMatch[0]);
        return res.json({ recipeIdeas: recipes });
      }

      res.json({
        recipeIdeas: [
          {
            title: 'Nutritious Kenyan Veggie Stew',
            prepTime: '20 mins',
            servings: '100 meals',
            instructions: text || 'Sauté produce with spices and boil for 20 mins.',
            safetyTip: 'Distribute immediately while hot.'
          }
        ]
      });
    } catch (err) {
      console.error('Error generating AI recipes:', err);
      res.status(500).json({ error: 'Failed to generate AI recipe recommendations' });
    }
  });

  // 10. Seed / Reset data endpoint
  app.post('/api/seed', (req, res) => {
    dbVendors = JSON.parse(JSON.stringify(INITIAL_VENDORS));
    dbPantries = JSON.parse(JSON.stringify(INITIAL_PANTRIES));
    dbVolunteers = JSON.parse(JSON.stringify(INITIAL_VOLUNTEERS));
    dbListings = JSON.parse(JSON.stringify(INITIAL_LISTINGS));
    dbMatches = JSON.parse(JSON.stringify(INITIAL_MATCHES));
    dbImpactLogs = JSON.parse(JSON.stringify(INITIAL_IMPACT_LOGS));
    currentWeights = { ...DEFAULT_WEIGHTS };

    res.json({ message: 'Nairobi network data reset to fresh prototype state!' });
  });

  // --- VITE MIDDLEWARE / PRODUCTION STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mlo Mtaani Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
