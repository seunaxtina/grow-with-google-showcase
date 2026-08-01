import React, { useState } from 'react';
import { Bike, MapPin, Navigation, CheckCircle2, Clock, Phone, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { Volunteer, Match } from '../types';

interface VolunteerScreenProps {
  volunteers: Volunteer[];
  matches: Match[];
  onClaimTask: (matchId: string, volunteerId: string) => Promise<any>;
  onMarkDelivered: (matchId: string) => Promise<any>;
}

export const VolunteerScreen: React.FC<VolunteerScreenProps> = ({
  volunteers,
  matches,
  onClaimTask,
  onMarkDelivered
}) => {
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>(volunteers[0]?.volunteer_id || 'vol_1');
  const [loadingMatchId, setLoadingMatchId] = useState<string | null>(null);

  const activeVolunteer = volunteers.find(v => v.volunteer_id === selectedVolunteerId) || volunteers[0];

  // Active matches assigned or claimable
  const activeTasks = matches.filter(m => m.status === 'assigned' || m.status === 'picked_up');
  const completedTasks = matches.filter(m => m.status === 'delivered');

  const handleClaim = async (matchId: string) => {
    setLoadingMatchId(matchId);
    try {
      await onClaimTask(matchId, selectedVolunteerId);
    } catch (err) {
      console.error('Failed to claim task:', err);
    } finally {
      setLoadingMatchId(null);
    }
  };

  const handleDeliver = async (matchId: string) => {
    setLoadingMatchId(matchId);
    try {
      await onMarkDelivered(matchId);
    } catch (err) {
      console.error('Failed to mark delivered:', err);
    } finally {
      setLoadingMatchId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#F59E0B] rounded-3xl p-6 sm:p-8 text-white shadow-xl border-4 border-[#FBBF24] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-3">
            <Bike className="w-3.5 h-3.5 text-amber-200" />
            Nairobi Food Rescue Riders Hub
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight mb-2">
            Volunteer Logistics Dashboard
          </h2>
          <p className="text-amber-100 text-sm font-medium max-w-xl">
            Claim available food rescue missions across Nairobi, navigate optimized routes via Google Maps, and log delivery impact in real time.
          </p>
        </div>

        {/* Volunteer Switcher */}
        <div className="bg-[#1E293B] p-4 rounded-2xl border-2 border-slate-700 shrink-0 min-w-[260px]">
          <label className="block text-[11px] font-black text-amber-400 uppercase tracking-wider mb-2">
            Rider Profile:
          </label>
          <select
            value={selectedVolunteerId}
            onChange={(e) => setSelectedVolunteerId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-xl text-xs font-bold text-white outline-none focus:ring-2 focus:ring-[#F59E0B]"
          >
            {volunteers.map(v => (
              <option key={v.volunteer_id} value={v.volunteer_id}>
                {v.name} ({v.vehicle_type.toUpperCase().replace('_', ' ')})
              </option>
            ))}
          </select>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300 border-t border-slate-700/60 pt-2 font-semibold">
            <span>Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-black ${
              activeVolunteer.status === 'available'
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-500 text-white'
            }`}>
              {activeVolunteer.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Rescue Tasks */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-amber-200">
            <h3 className="font-black text-[#92400E] text-lg uppercase tracking-tight flex items-center gap-2">
              <span>Claimable & Active Pickups ({activeTasks.length})</span>
            </h3>
            <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase">⚡ Real-time Dispatch</span>
          </div>

          {activeTasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-4 border-[#FBBF24] shadow-xl">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-lg font-black text-[#92400E] mb-1 uppercase">All Pickups Completed!</h4>
              <p className="text-xs text-slate-600 font-semibold max-w-sm mx-auto">
                There are no pending surplus food pickups right now. New tasks will appear as soon as pantries reserve fresh batches!
              </p>
            </div>
          ) : (
            activeTasks.map((match) => {
              const vendorLoc = match.vendor?.location || match.listing?.vendor_location;
              const pantryLoc = match.pantry?.location;

              // Generate Google Maps Route URL
              let googleMapsDirUrl = 'https://www.google.com/maps';
              if (vendorLoc && pantryLoc) {
                googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                  vendorLoc.address
                )}&destination=${encodeURIComponent(pantryLoc.address)}&travelmode=driving`;
              }

              const isClaimedByMe = match.volunteer_id === selectedVolunteerId;

              return (
                <div
                  key={match.match_id}
                  className="bg-white rounded-3xl p-6 border-4 border-[#FBBF24] shadow-xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-amber-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          match.status === 'picked_up'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-500 text-white'
                        }`}>
                          {match.status === 'picked_up' ? 'In Transit / Picked Up' : 'Assigned / Ready for Pickup'}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">
                          Matched {new Date(match.matched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-slate-900">
                        {match.listing?.item_name || 'Surplus Food Batch'}
                      </h4>
                      <p className="text-xs font-black text-emerald-700 mt-1">
                        📦 Batch Quantity: {match.listing?.quantity} {match.listing?.unit}
                      </p>
                    </div>

                    <a
                      href={googleMapsDirUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all self-start"
                    >
                      <Navigation className="w-4 h-4 text-amber-400" />
                      <span>Google Maps Route</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>

                  {/* Route Steps Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                    {/* Pickup Point */}
                    <div className="bg-amber-50/60 p-4 rounded-2xl border-2 border-amber-200">
                      <div className="flex items-center gap-1.5 text-[#92400E] font-black text-xs mb-1">
                        <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0" />
                        <span>PICKUP POINT (Vendor)</span>
                      </div>
                      <p className="font-black text-slate-900 text-sm">{match.vendor?.name}</p>
                      <p className="text-slate-600 text-[11px] mt-0.5 font-semibold">{vendorLoc?.address}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Contact: {match.vendor?.contact}</p>
                    </div>

                    {/* Delivery Point */}
                    <div className="bg-amber-50/60 p-4 rounded-2xl border-2 border-amber-200">
                      <div className="flex items-center gap-1.5 text-indigo-900 font-black text-xs mb-1">
                        <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>DELIVERY DESTINATION (Pantry)</span>
                      </div>
                      <p className="font-black text-slate-900 text-sm">{match.pantry?.name}</p>
                      <p className="text-slate-600 text-[11px] mt-0.5 font-semibold">{pantryLoc?.address}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Contact: {match.pantry?.contact}</p>
                    </div>
                  </div>

                  {/* Transit Metrics Bar */}
                  <div className="flex flex-wrap items-center justify-between text-xs font-extrabold text-slate-700 bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                    <span>📍 Distance: <strong className="text-emerald-700 font-black">{match.breakdown?.distance_km || 3.2} km</strong></span>
                    <span>⏱️ Est. Travel: <strong className="text-amber-800 font-black">{match.breakdown?.travel_time_mins || 12} mins</strong></span>
                    <span>🤝 Assigned Rider: <strong className="text-indigo-800 font-black">{match.volunteer?.name || activeVolunteer.name}</strong></span>
                  </div>

                  {/* Status Actions */}
                  <div className="pt-2">
                    {match.status === 'assigned' && (
                      <button
                        onClick={() => handleClaim(match.match_id)}
                        disabled={loadingMatchId === match.match_id}
                        className="w-full py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loadingMatchId === match.match_id ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <>
                            <Bike className="w-4 h-4" />
                            <span>Claim & Mark Picked Up From Vendor</span>
                          </>
                        )}
                      </button>
                    )}

                    {match.status === 'picked_up' && (
                      <button
                        onClick={() => handleDeliver(match.match_id)}
                        disabled={loadingMatchId === match.match_id}
                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loadingMatchId === match.match_id ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-100" />
                            <span>Mark Delivered to Pantry (& Log Impact)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Completed Rescue History */}
          {completedTasks.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border-4 border-[#FBBF24] shadow-xl space-y-3">
              <h4 className="text-xs font-black text-[#92400E] uppercase tracking-wider">
                Recently Completed Deliveries ({completedTasks.length})
              </h4>
              <div className="space-y-2">
                {completedTasks.map(m => (
                  <div key={m.match_id} className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 text-xs flex items-center justify-between font-bold">
                    <div>
                      <span className="font-black text-slate-900">{m.listing?.item_name}</span>
                      <p className="text-[11px] text-slate-600">Delivered to {m.pantry?.name}</p>
                    </div>
                    <span className="text-emerald-700 font-black bg-emerald-100 px-2.5 py-1 rounded-full uppercase">
                      ✓ Delivered
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rider Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-[#FBBF24]">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-amber-100">
              <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] text-white flex items-center justify-center font-black text-xl shadow-md">
                {activeVolunteer.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">{activeVolunteer.name}</h4>
                <p className="text-xs text-slate-600 font-bold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
                  {activeVolunteer.phone}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs font-bold">
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-slate-500">Vehicle Type:</span>
                <strong className="text-slate-900 font-black uppercase bg-amber-100 px-2.5 py-0.5 rounded-full text-[11px]">
                  {activeVolunteer.vehicle_type.replace('_', ' ')}
                </strong>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-slate-500">Total Deliveries:</span>
                <strong className="text-emerald-700 font-black text-base">{activeVolunteer.total_deliveries} missions</strong>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500">Current Base:</span>
                <span className="text-slate-800 font-bold">{activeVolunteer.current_location?.address || 'Nairobi Central'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
