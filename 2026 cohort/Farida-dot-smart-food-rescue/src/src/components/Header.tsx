import React from 'react';
import { Utensils, Store, Building2, Bike, LayoutDashboard, Sliders, Leaf } from 'lucide-react';
import { ImpactSummary } from '../types';

interface HeaderProps {
  activeTab: 'vendor' | 'pantry' | 'volunteer' | 'admin' | 'simulator';
  setActiveTab: (tab: 'vendor' | 'pantry' | 'volunteer' | 'admin' | 'simulator') => void;
  summary: ImpactSummary | null;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, summary }) => {
  return (
    <header className="bg-[#F59E0B] text-white sticky top-0 z-50 shadow-md">
      {/* Top Banner */}
      <div className="bg-[#D97706] px-4 py-2 text-xs font-semibold text-amber-50 flex flex-wrap items-center justify-between gap-2 border-b border-amber-400/40">
        <div className="flex items-center gap-2">
          <span className="bg-white/20 text-white px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider">
            Ember Alliance • Grow with Google
          </span>
          <span className="text-amber-200 hidden sm:inline">|</span>
          <span className="text-amber-100 font-bold">Mlo Mtaani Food Rescue</span>
        </div>
        
        {summary && (
          <div className="flex items-center gap-4 text-[11px] font-black text-white">
            <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              <strong>{summary.total_kg_redirected} kg</strong> Redirected
            </span>
            <span className="hidden md:inline text-amber-200">•</span>
            <span className="hidden md:flex items-center gap-1">
              🍲 <strong>{summary.total_meals_estimated}</strong> Meals
            </span>
            <span className="hidden md:inline text-amber-200">•</span>
            <span className="flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-emerald-200" />
              <strong>{summary.co2_avoided_kg} kg</strong> CO₂ Saved
            </span>
          </div>
        )}
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('admin')}>
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-inner shrink-0">
            <span className="text-[#F59E0B] font-black text-2xl leading-none">M</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white leading-none uppercase tracking-tighter">
                Mlo Mtaani
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-widest">
                Nairobi
              </span>
            </div>
            <p className="text-[#FEF3C7] text-[10px] uppercase font-bold tracking-widest mt-0.5">
              Surplus Redistribution Network
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <nav className="flex items-center gap-2 bg-amber-600/30 p-1.5 rounded-2xl border border-amber-400/40 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('vendor')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs uppercase font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'vendor'
                ? 'bg-white text-[#92400E] shadow-sm font-black'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>1. Vendor</span>
          </button>

          <button
            onClick={() => setActiveTab('pantry')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs uppercase font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'pantry'
                ? 'bg-white text-[#92400E] shadow-sm font-black'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>2. Pantry</span>
          </button>

          <button
            onClick={() => setActiveTab('volunteer')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs uppercase font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'volunteer'
                ? 'bg-white text-[#92400E] shadow-sm font-black'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>3. Volunteer</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs uppercase font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'admin'
                ? 'bg-white text-[#92400E] shadow-sm font-black'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>4. Admin</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs uppercase font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-white text-[#92400E] shadow-sm font-black'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Engine</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
