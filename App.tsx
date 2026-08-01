import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { VendorScreen } from './components/VendorScreen';
import { PantryScreen } from './components/PantryScreen';
import { VolunteerScreen } from './components/VolunteerScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { MatchingSimulator } from './components/MatchingSimulator';
import {
  Vendor,
  Pantry,
  Volunteer,
  Listing,
  Match,
  ImpactLog,
  ImpactSummary,
  AlgorithmWeights
} from './types';
import {
  INITIAL_VENDORS,
  INITIAL_PANTRIES,
  INITIAL_VOLUNTEERS,
  INITIAL_LISTINGS,
  INITIAL_MATCHES,
  INITIAL_IMPACT_LOGS
} from './mockData';
import { DEFAULT_WEIGHTS } from './matchingEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vendor' | 'pantry' | 'volunteer' | 'admin' | 'simulator'>('vendor');

  // Application Data States
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [pantries, setPantries] = useState<Pantry[]>(INITIAL_PANTRIES);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(INITIAL_VOLUNTEERS);
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [rankings, setRankings] = useState<any[]>([]);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [impactLogs, setImpactLogs] = useState<ImpactLog[]>(INITIAL_IMPACT_LOGS);
  const [summary, setSummary] = useState<ImpactSummary | null>(null);
  const [weights, setWeights] = useState<AlgorithmWeights>(DEFAULT_WEIGHTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch all state from Express Backend API
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [vRes, pRes, volRes, lRes, rRes, mRes, impRes] = await Promise.all([
        fetch('/api/vendors').then(r => r.ok ? r.json() : INITIAL_VENDORS),
        fetch('/api/pantries').then(r => r.ok ? r.json() : INITIAL_PANTRIES),
        fetch('/api/volunteers').then(r => r.ok ? r.json() : INITIAL_VOLUNTEERS),
        fetch('/api/listings').then(r => r.ok ? r.json() : INITIAL_LISTINGS),
        fetch('/api/matches/rankings').then(r => r.ok ? r.json() : []),
        fetch('/api/matches').then(r => r.ok ? r.json() : INITIAL_MATCHES),
        fetch('/api/impact').then(r => r.ok ? r.json() : { summary: null, recentLogs: INITIAL_IMPACT_LOGS })
      ]);

      setVendors(vRes);
      setPantries(pRes);
      setVolunteers(volRes);
      setListings(lRes);
      setRankings(rRes);
      setMatches(mRes);
      if (impRes.summary) setSummary(impRes.summary);
      if (impRes.recentLogs) setImpactLogs(impRes.recentLogs);
    } catch (err) {
      console.warn('API fetch error, using local state fallback:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handler: Vendor Surplus Creation (<60s)
  const handleCreateListing = async (listingData: any) => {
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData)
      });
      const data = await res.json();
      await fetchAllData();
      return data;
    } catch (err) {
      console.error('Error creating listing:', err);
      throw err;
    }
  };

  // Handler: Pantry 1-Tap Reservation
  const handleReserveListing = async (listingId: string, pantryId: string) => {
    try {
      const res = await fetch('/api/matches/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId, pantry_id: pantryId })
      });
      const data = await res.json();
      await fetchAllData();
      return data;
    } catch (err) {
      console.error('Error reserving match:', err);
      throw err;
    }
  };

  // Handler: Volunteer Claims Task
  const handleClaimTask = async (matchId: string, volunteerId: string) => {
    try {
      const res = await fetch(`/api/matches/${matchId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer_id: volunteerId })
      });
      const data = await res.json();
      await fetchAllData();
      return data;
    } catch (err) {
      console.error('Error claiming task:', err);
      throw err;
    }
  };

  // Handler: Volunteer Marks Delivered
  const handleMarkDelivered = async (matchId: string) => {
    try {
      const res = await fetch(`/api/matches/${matchId}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      await fetchAllData();
      return data;
    } catch (err) {
      console.error('Error marking delivered:', err);
      throw err;
    }
  };

  // Handler: Update Algorithm Weights
  const handleUpdateWeights = async (newWeights: AlgorithmWeights) => {
    try {
      const res = await fetch('/api/algorithm/weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWeights)
      });
      const data = await res.json();
      setWeights(newWeights);
      await fetchAllData();
      return data;
    } catch (err) {
      console.error('Error updating weights:', err);
      throw err;
    }
  };

  // Handler: Reset Demo Seed Data
  const handleResetSeedData = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
      await fetchAllData();
    } catch (err) {
      console.error('Error resetting seed data:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB] text-slate-800 flex flex-col font-sans selection:bg-[#F59E0B] selection:text-white">
      {/* Top Sticky Header & Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        summary={summary}
      />

      {/* Main Screen Router */}
      <main className="flex-1 pb-12">
        {activeTab === 'vendor' && (
          <VendorScreen
            vendors={vendors}
            onListingCreated={handleCreateListing}
            onNavigateToPantry={() => setActiveTab('pantry')}
          />
        )}

        {activeTab === 'pantry' && (
          <PantryScreen
            pantries={pantries}
            rankings={rankings}
            onReserveListing={handleReserveListing}
            onNavigateToVolunteer={() => setActiveTab('volunteer')}
          />
        )}

        {activeTab === 'volunteer' && (
          <VolunteerScreen
            volunteers={volunteers}
            matches={matches}
            onClaimTask={handleClaimTask}
            onMarkDelivered={handleMarkDelivered}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            summary={summary}
            impactLogs={impactLogs}
            onResetSeedData={handleResetSeedData}
          />
        )}

        {activeTab === 'simulator' && (
          <MatchingSimulator
            weights={weights}
            onUpdateWeights={handleUpdateWeights}
            vendors={vendors}
            pantries={pantries}
            volunteers={volunteers}
            matches={matches}
            onResetSeedData={handleResetSeedData}
          />
        )}
      </main>

      {/* App Footer */}
      <footer className="bg-[#1E293B] text-slate-300 py-4 px-6 text-[11px] font-bold uppercase tracking-widest border-t-4 border-[#F59E0B]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-black text-white">Mlo Mtaani Prototype v1.0.4</span>
            <span className="text-amber-400 font-semibold">— Ember Alliance • Grow with Google</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Firestore: Connected</span>
            <span className="text-emerald-400 font-black">Cloud Engine: Online</span>
            <span>Nairobi Network</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
