import React, { useState } from 'react';
import { Sliders, Sparkles, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import { AlgorithmWeights, Vendor, Pantry, Volunteer, Match } from '../types';
import { NairobiMap } from './NairobiMap';

interface MatchingSimulatorProps {
  weights: AlgorithmWeights;
  onUpdateWeights: (weights: AlgorithmWeights) => Promise<any>;
  vendors: Vendor[];
  pantries: Pantry[];
  volunteers: Volunteer[];
  matches: Match[];
  onResetSeedData: () => Promise<void>;
}

export const MatchingSimulator: React.FC<MatchingSimulatorProps> = ({
  weights,
  onUpdateWeights,
  vendors,
  pantries,
  volunteers,
  matches,
  onResetSeedData
}) => {
  const [w1, setW1] = useState<number>(weights.w1);
  const [w2, setW2] = useState<number>(weights.w2);
  const [w3, setW3] = useState<number>(weights.w3);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await onUpdateWeights({ w1, w2, w3 });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update algorithm weights:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const sumWeights = w1 + w2 + w3;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-[#F59E0B] rounded-3xl p-6 sm:p-8 text-white border-4 border-[#FBBF24] shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-3">
          <Sliders className="w-3.5 h-3.5 text-amber-200" />
          Weighted Matching Engine Control
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight mb-2">
          Algorithm Weight Simulator
        </h2>
        <p className="text-amber-100 text-sm font-medium max-w-2xl">
          Fine-tune the three core weights (<code className="text-white font-black">w1</code> Proximity, <code className="text-white font-black">w2</code> Urgency, <code className="text-white font-black">w3</code> Pantry Need) to see how candidate rankings shift dynamically across Nairobi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weight Adjustment Sliders */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border-4 border-[#FBBF24] shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-amber-100">
            <h3 className="font-black text-[#92400E] text-base uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F59E0B]" />
              <span>Weight Tuning Formula</span>
            </h3>
            <span className="text-xs font-black text-[#92400E] bg-amber-100 px-3 py-1 rounded-full uppercase">
              Sum = {sumWeights.toFixed(2)}
            </span>
          </div>

          <form onSubmit={handleApply} className="space-y-6">
            {/* Weight 1: Proximity */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                <span className="text-slate-800">w1: Proximity Weight (Distance)</span>
                <span className="text-emerald-700 font-black text-base">{w1.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={w1}
                onChange={(e) => setW1(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-600 font-semibold">
                Prioritizes minimizing transit distance between food source and pantry.
              </p>
            </div>

            {/* Weight 2: Urgency */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                <span className="text-slate-800">w2: Urgency Weight (Perishability)</span>
                <span className="text-[#D97706] font-black text-base">{w2.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={w2}
                onChange={(e) => setW2(Number(e.target.value))}
                className="w-full accent-[#F59E0B] cursor-pointer"
              />
              <p className="text-[11px] text-slate-600 font-semibold">
                Prioritizes items nearest to expiration time.
              </p>
            </div>

            {/* Weight 3: Pantry Need */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                <span className="text-slate-800">w3: Pantry Need Score</span>
                <span className="text-indigo-700 font-black text-base">{w3.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={w3}
                onChange={(e) => setW3(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-600 font-semibold">
                Prioritizes community shelters with higher beneficiary count or fewer recent deliveries.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 bg-[#1E293B] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Weights Updated & Applied Network-Wide!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Update Algorithm Weights</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div className="pt-4 border-t-2 border-amber-100">
            <span className="block text-[11px] font-black text-[#92400E] uppercase tracking-wider mb-2">
              Presets:
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setW1(0.4); setW2(0.4); setW3(0.2); }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-800 border border-slate-300"
              >
                Balanced (40/40/20)
              </button>
              <button
                type="button"
                onClick={() => { setW1(0.7); setW2(0.2); setW3(0.1); }}
                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-black border border-emerald-300"
              >
                Hyper-Local (70/20/10)
              </button>
              <button
                type="button"
                onClick={() => { setW1(0.2); setW2(0.7); setW3(0.1); }}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-[#92400E] rounded-xl font-black border border-amber-300"
              >
                Perishable Focus (20/70/10)
              </button>
            </div>
          </div>
        </div>

        {/* Nairobi Interactive Geospatial Map */}
        <div className="lg:col-span-7">
          <NairobiMap
            vendors={vendors}
            pantries={pantries}
            volunteers={volunteers}
            matches={matches}
          />
        </div>
      </div>
    </div>
  );
};
