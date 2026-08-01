import React, { useState } from 'react';
import { MapPin, Navigation, Building2, Store, Bike, Info, Sparkles } from 'lucide-react';
import { Vendor, Pantry, Volunteer, Match } from '../types';

interface NairobiMapProps {
  vendors: Vendor[];
  pantries: Pantry[];
  volunteers: Volunteer[];
  matches: Match[];
}

export const NairobiMap: React.FC<NairobiMapProps> = ({
  vendors,
  pantries,
  volunteers,
  matches
}) => {
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Map bounding box coordinates for Nairobi region
  const MIN_LAT = -1.34;
  const MAX_LAT = -1.18;
  const MIN_LNG = 36.72;
  const MAX_LNG = 36.94;

  const getCanvasCoords = (lat: number, lng: number) => {
    const xPct = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
    const yPct = (1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100;
    return {
      x: Math.max(5, Math.min(95, xPct)),
      y: Math.max(5, Math.min(95, yPct))
    };
  };

  return (
    <div className="bg-white rounded-3xl p-6 text-slate-900 border-4 border-[#FBBF24] shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-amber-100 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-[#92400E] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              Nairobi Metropolitan Grid
            </span>
            <span className="text-xs text-slate-500 font-bold uppercase">Live Logistics Overview</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <span>Redistribution Network Map</span>
          </h3>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-black">
          <div className="flex items-center gap-1.5 text-[#D97706]">
            <span className="w-3 h-3 rounded-full bg-[#F59E0B] ring-2 ring-amber-300"></span>
            <span>Vendors ({vendors.length})</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-300"></span>
            <span>Pantries ({pantries.length})</span>
          </div>

          <div className="flex items-center gap-1.5 text-sky-700">
            <span className="w-3 h-3 rounded-full bg-sky-500 ring-2 ring-sky-300"></span>
            <span>Volunteers ({volunteers.length})</span>
          </div>
        </div>
      </div>

      {/* Interactive Map Visual Stage */}
      <div className="relative w-full h-80 bg-[#1E293B] rounded-2xl border-2 border-slate-700 overflow-hidden shadow-inner">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

        {/* Major Nairobi Sub-county Label Overlay */}
        <div className="absolute top-3 left-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pointer-events-none">
          Westlands / Parklands
        </div>
        <div className="absolute top-3 right-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pointer-events-none">
          Kasarani / Githurai
        </div>
        <div className="absolute bottom-3 left-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pointer-events-none">
          Kibera / Dagoretti
        </div>
        <div className="absolute bottom-3 right-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pointer-events-none">
          Mukuru / Embakasi
        </div>

        {/* SVG Match Connection Routes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {matches.map((match) => {
            if (!match.vendor?.location || !match.pantry?.location) return null;
            const start = getCanvasCoords(match.vendor.location.lat, match.vendor.location.lng);
            const end = getCanvasCoords(match.pantry.location.lat, match.pantry.location.lng);

            return (
              <g key={`route-${match.match_id}`}>
                <line
                  x1={`${start.x}%`}
                  y1={`${start.y}%`}
                  x2={`${end.x}%`}
                  y2={`${end.y}%`}
                  stroke={match.status === 'delivered' ? '#10b981' : '#f59e0b'}
                  strokeWidth="3"
                  strokeDasharray={match.status === 'delivered' ? 'none' : '6 4'}
                  className="opacity-80 animate-pulse"
                />
              </g>
            );
          })}
        </svg>

        {/* Vendor Pins */}
        {vendors.map((v) => {
          const { x, y } = getCanvasCoords(v.location.lat, v.location.lng);
          return (
            <button
              key={v.vendor_id}
              onClick={() => setSelectedNode({ type: 'Vendor', name: v.name, location: v.location.address, detail: `Rating: ${v.rating || 4.8}★` })}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 p-2 bg-[#F59E0B] text-slate-950 rounded-full shadow-lg ring-2 ring-amber-300 hover:scale-125 transition-transform cursor-pointer"
              title={`Vendor: ${v.name}`}
            >
              <Store className="w-4 h-4 text-white" />
            </button>
          );
        })}

        {/* Pantry Pins */}
        {pantries.map((p) => {
          const { x, y } = getCanvasCoords(p.location.lat, p.location.lng);
          return (
            <button
              key={p.pantry_id}
              onClick={() => setSelectedNode({ type: 'Pantry', name: p.name, location: p.location.address, detail: `Need Level: ${p.need_score}/10 | Serves ${p.beneficiaries_count} people` })}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-full shadow-lg ring-2 ring-emerald-300 hover:scale-125 transition-transform cursor-pointer"
              title={`Pantry: ${p.name}`}
            >
              <Building2 className="w-4 h-4" />
            </button>
          );
        })}

        {/* Volunteer Pins */}
        {volunteers.map((vol) => {
          if (!vol.current_location) return null;
          const { x, y } = getCanvasCoords(vol.current_location.lat, vol.current_location.lng);
          return (
            <button
              key={vol.volunteer_id}
              onClick={() => setSelectedNode({ type: 'Volunteer', name: vol.name, location: vol.current_location?.address, detail: `Rider Vehicle: ${vol.vehicle_type.toUpperCase()} | ${vol.total_deliveries} deliveries` })}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 p-2 bg-sky-500 text-white rounded-full shadow-lg ring-2 ring-sky-300 hover:scale-125 transition-transform cursor-pointer"
              title={`Volunteer Rider: ${vol.name}`}
            >
              <Bike className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Selected Map Node Info Box */}
      {selectedNode && (
        <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200 text-xs flex items-center justify-between font-bold">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#92400E]">
              Selected {selectedNode.type} Node:
            </span>
            <h5 className="font-black text-slate-900 text-base">{selectedNode.name}</h5>
            <p className="text-slate-600 font-semibold">{selectedNode.location}</p>
            <p className="text-emerald-700 font-black mt-0.5">{selectedNode.detail}</p>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-xs text-[#92400E] font-black hover:bg-amber-200 px-3 py-1.5 bg-amber-100 rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
