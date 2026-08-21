import React, { useState } from 'react';
import { Building2, Sparkles, MapPin, Clock, ArrowUpRight, Check, AlertCircle, ChefHat, Heart, Lightbulb } from 'lucide-react';
import { Pantry, Listing, Match } from '../types';

interface PantryScreenProps {
  pantries: Pantry[];
  rankings: any[];
  onReserveListing: (listingId: string, pantryId: string) => Promise<any>;
  onNavigateToVolunteer: () => void;
}

export const PantryScreen: React.FC<PantryScreenProps> = ({
  pantries,
  rankings,
  onReserveListing,
  onNavigateToVolunteer
}) => {
  const [selectedPantryId, setSelectedPantryId] = useState<string>(pantries[0]?.pantry_id || 'p_1');
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [reservedMatches, setReservedMatches] = useState<Record<string, boolean>>({});
  
  // AI Recipe generator state
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState<boolean>(false);
  const [aiRecipes, setAiRecipes] = useState<any[] | null>(null);

  const selectedPantry = pantries.find(p => p.pantry_id === selectedPantryId) || pantries[0];

  // Filter rankings for the selected pantry (or show all listings ranked for this pantry)
  const pantryRankings = rankings
    .filter(item => item.pantry?.pantry_id === selectedPantryId)
    .sort((a, b) => b.score - a.score);

  const handleReserve = async (listingId: string) => {
    setReservingId(listingId);
    try {
      await onReserveListing(listingId, selectedPantryId);
      setReservedMatches(prev => ({ ...prev, [listingId]: true }));
    } catch (err) {
      console.error('Failed to reserve match:', err);
    } finally {
      setReservingId(null);
    }
  };

  const handleGenerateAiRecipes = async () => {
    setIsGeneratingRecipes(true);
    setAiRecipes(null);

    const availableItems = pantryRankings.map(r => ({
      item_name: r.listing.item_name,
      quantity: `${r.listing.quantity} ${r.listing.unit}`,
      category: r.listing.category
    }));

    try {
      const res = await fetch('/api/ai/recipe-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pantryName: selectedPantry.name,
          items: availableItems
        })
      });
      const data = await res.json();
      if (data.recipeIdeas) {
        setAiRecipes(data.recipeIdeas);
      }
    } catch (err) {
      console.error('Failed to fetch AI recipe ideas:', err);
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#F59E0B] rounded-3xl p-6 sm:p-8 text-white shadow-xl border-4 border-[#FBBF24] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5 text-amber-200" />
            Pantry Shortlist Engine
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight mb-2">
            Auto-Ranked Surplus Food Matches
          </h2>
          <p className="text-amber-100 text-sm font-medium max-w-xl">
            Surplus food listings are algorithmically ranked specifically for your pantry based on proximity, food urgency, and need score. Reserve with 1-tap!
          </p>
        </div>

        {/* Pantry Switcher */}
        <div className="bg-[#1E293B] p-4 rounded-2xl border-2 border-slate-700 shrink-0 min-w-[260px]">
          <label className="block text-[11px] font-black text-amber-400 uppercase tracking-wider mb-2">
            Viewing As Pantry Hub:
          </label>
          <select
            value={selectedPantryId}
            onChange={(e) => setSelectedPantryId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-xl text-xs font-bold text-white outline-none focus:ring-2 focus:ring-[#F59E0B]"
          >
            {pantries.map(p => (
              <option key={p.pantry_id} value={p.pantry_id}>
                {p.name} (Need: {p.need_score}/10)
              </option>
            ))}
          </select>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300 border-t border-slate-700/60 pt-2 font-semibold">
            <span>Beneficiaries Served:</span>
            <strong className="text-amber-400 font-black">{selectedPantry.beneficiaries_count} people</strong>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ranked Shortlist Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-amber-200">
            <h3 className="font-black text-[#92400E] text-lg uppercase tracking-tight flex items-center gap-2">
              <span>Auto-Ranked Shortlist ({pantryRankings.length})</span>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-100 text-[#92400E] uppercase">
                Sorted by Match Score
              </span>
            </h3>

            <button
              onClick={handleGenerateAiRecipes}
              disabled={isGeneratingRecipes || pantryRankings.length === 0}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <ChefHat className="w-4 h-4 text-emerald-100" />
              <span>{isGeneratingRecipes ? 'Generating AI Recipes...' : 'Gemini Recipe Ideas'}</span>
            </button>
          </div>

          {/* AI Recipe Recommendations Box if requested */}
          {aiRecipes && (
            <div className="bg-[#1E293B] text-emerald-100 rounded-3xl p-6 border-4 border-emerald-400 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-base uppercase">
                <Sparkles className="w-5 h-5 text-emerald-300 animate-spin" />
                <span>Gemini AI Community Meal Recommendations:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aiRecipes.map((recipe, idx) => (
                  <div key={idx} className="bg-slate-900 p-4 rounded-2xl border border-emerald-900/60">
                    <h5 className="font-black text-sm text-amber-300 mb-1">{recipe.title}</h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-2 font-bold">
                      <span>⏱️ {recipe.prepTime}</span>
                      <span>•</span>
                      <span>🍲 {recipe.servings}</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2 leading-relaxed font-medium">{recipe.instructions}</p>
                    <div className="text-[10px] text-amber-300 bg-amber-950/60 p-2 rounded-xl border border-amber-800/50 font-bold">
                      💡 <strong>Safety:</strong> {recipe.safetyTip}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pantryRankings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-4 border-[#FBBF24] shadow-xl">
              <Building2 className="w-12 h-12 text-amber-300 mx-auto mb-3" />
              <h4 className="text-lg font-black text-[#92400E] mb-1 uppercase">No Open Surplus Listings</h4>
              <p className="text-xs text-slate-600 font-semibold max-w-sm mx-auto">
                All surplus food batches are currently reserved or completed. Switch to the Vendor tab to list a new surplus item!
              </p>
            </div>
          ) : (
            pantryRankings.map((item) => {
              const listing: Listing = item.listing;
              const isReserved = listing.status === 'reserved' || reservedMatches[listing.listing_id];

              return (
                <div
                  key={listing.listing_id}
                  className={`bg-white rounded-3xl p-6 border-4 transition-all shadow-xl ${
                    isReserved
                      ? 'border-emerald-400 bg-emerald-50/20'
                      : 'border-[#FBBF24] hover:border-[#F59E0B]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-[#92400E] uppercase tracking-wider">
                          {listing.category}
                        </span>
                        <span className="text-xs font-black text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Expires: {new Date(listing.expiry_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-slate-900">{listing.item_name}</h4>
                      <p className="text-xs text-slate-600 font-bold flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                        <span>{listing.vendor_name} ({listing.vendor_address})</span>
                      </p>
                    </div>

                    {/* Big Match Score Badge */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center bg-[#F59E0B] p-3.5 rounded-2xl text-white shrink-0 shadow-md">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-100">
                        Weighted Match
                      </span>
                      <span className="text-3xl font-black text-white">
                        {item.score}%
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Notes */}
                  <div className="bg-amber-50/60 p-3.5 rounded-2xl border-2 border-amber-200 mb-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                    <div>
                      <span className="text-slate-600">Available Quantity: </span>
                      <strong className="text-[#92400E] font-black text-base">{listing.quantity} {listing.unit}</strong>
                    </div>
                    {listing.notes && (
                      <span className="text-slate-600 italic">"{listing.notes}"</span>
                    )}
                  </div>

                  {/* High-Contrast Score Breakdown Pills */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-[11px] font-bold">
                    <div className="bg-amber-50/80 p-2.5 rounded-xl text-slate-800 text-center border border-amber-200">
                      <div className="text-[10px] text-slate-500 font-semibold">Proximity (w1=0.4)</div>
                      <strong className="text-emerald-700 font-black text-xs">
                        {item.breakdown.proximity_score}% ({item.breakdown.distance_km} km)
                      </strong>
                    </div>

                    <div className="bg-amber-50/80 p-2.5 rounded-xl text-slate-800 text-center border border-amber-200">
                      <div className="text-[10px] text-slate-500 font-semibold">Urgency (w2=0.4)</div>
                      <strong className="text-amber-700 font-black text-xs">
                        {item.breakdown.urgency_score}% Score
                      </strong>
                    </div>

                    <div className="bg-amber-50/80 p-2.5 rounded-xl text-slate-800 text-center border border-amber-200">
                      <div className="text-[10px] text-slate-500 font-semibold">Pantry Need (w3=0.2)</div>
                      <strong className="text-indigo-700 font-black text-xs">
                        {item.breakdown.pantry_need_score}% Need
                      </strong>
                    </div>
                  </div>

                  {/* Action Button */}
                  {isReserved ? (
                    <div className="w-full py-3.5 bg-emerald-100 text-emerald-900 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 border-2 border-emerald-400 shadow">
                      <Check className="w-5 h-5 text-emerald-700" />
                      <span>Reserved! Volunteer Dispatched</span>
                      <button
                        onClick={onNavigateToVolunteer}
                        className="underline text-emerald-800 ml-2 hover:text-emerald-950 font-black"
                      >
                        Track Volunteer &rarr;
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleReserve(listing.listing_id)}
                      disabled={reservingId === listing.listing_id}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {reservingId === listing.listing_id ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Reserving & Assigning Volunteer...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-emerald-100" />
                          <span>1-Tap Reserve Food Batch</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Selected Pantry Profile Details */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-[#FBBF24]">
            <h4 className="text-xs font-black text-[#92400E] uppercase tracking-wider mb-3">
              Pantry Details
            </h4>
            <div className="space-y-3 text-xs font-bold">
              <div>
                <span className="text-slate-400">Name:</span>
                <p className="font-black text-slate-900 text-base">{selectedPantry.name}</p>
              </div>

              <div>
                <span className="text-slate-400">Location:</span>
                <p className="font-bold text-slate-700">{selectedPantry.location.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-amber-100">
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center">
                  <div className="text-[10px] text-slate-500 font-bold">Need Score</div>
                  <strong className="text-indigo-700 text-lg font-black">{selectedPantry.need_score}/10</strong>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center">
                  <div className="text-[10px] text-slate-500 font-bold">Recent Pickups</div>
                  <strong className="text-slate-800 text-lg font-black">{selectedPantry.recent_pickups_count || 0}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Formula Explanation Box */}
          <div className="bg-[#1E293B] text-white rounded-3xl p-6 border-4 border-slate-700 shadow-xl">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              Algorithm Formula
            </h4>
            <p className="text-xs text-amber-300 font-mono bg-slate-900 p-3 rounded-xl border border-slate-800 mb-3 leading-relaxed font-bold">
              Score = (0.4 × Proximity) + (0.4 × Urgency) + (0.2 × Need)
            </p>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Ensures that nearby, highly perishable food is directed to community pantries with the greatest hunger relief urgency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
