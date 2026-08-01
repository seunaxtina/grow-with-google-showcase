import React, { useState } from 'react';
import { Store, Clock, MapPin, Package, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Vendor, Listing, Location } from '../types';
import { NAIROBI_HUBS } from '../mockData';

interface VendorScreenProps {
  vendors: Vendor[];
  onListingCreated: (listingData: any) => Promise<any>;
  onNavigateToPantry: () => void;
}

export const VendorScreen: React.FC<VendorScreenProps> = ({
  vendors,
  onListingCreated,
  onNavigateToPantry
}) => {
  const [selectedVendorId, setSelectedVendorId] = useState<string>(vendors[0]?.vendor_id || 'v_1');
  const [itemName, setItemName] = useState<string>('');
  const [category, setCategory] = useState<Listing['category']>('produce');
  const [quantity, setQuantity] = useState<number>(25);
  const [unit, setUnit] = useState<Listing['unit']>('kg');
  const [expiryHours, setExpiryHours] = useState<number>(4);
  const [notes, setNotes] = useState<string>('');
  const [selectedHubName, setSelectedHubName] = useState<string>(NAIROBI_HUBS[2].name);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successResponse, setSuccessResponse] = useState<any | null>(null);

  const selectedVendor = vendors.find(v => v.vendor_id === selectedVendorId) || vendors[0];

  const handleHubSelect = (hubName: string) => {
    setSelectedHubName(hubName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    setIsSubmitting(true);
    setSuccessResponse(null);

    const chosenHub = NAIROBI_HUBS.find(h => h.name === selectedHubName) || NAIROBI_HUBS[2];
    const customLocation: Location = {
      lat: chosenHub.lat,
      lng: chosenHub.lng,
      address: `${chosenHub.name}, ${chosenHub.subCounty}, Nairobi`,
      subCounty: chosenHub.subCounty
    };

    try {
      const result = await onListingCreated({
        vendor_id: selectedVendorId,
        item_name: itemName,
        category,
        quantity,
        unit,
        expiry_hours: expiryHours,
        notes,
        vendor_location: customLocation
      });

      setSuccessResponse(result);
      // Reset form fields
      setItemName('');
      setNotes('');
    } catch (err) {
      console.error('Failed to submit surplus listing:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#F59E0B] rounded-3xl p-6 sm:p-8 text-white shadow-xl border-4 border-[#FBBF24] relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-20">
          <Store className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-3">
            <Clock className="w-3.5 h-3.5 text-amber-200" />
            Under-60-Second Vendor Dispatch
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight mb-2">
            Redirect Surplus Food in Nairobi
          </h2>
          <p className="text-amber-100 text-sm font-medium leading-relaxed">
            Grocery stores, supermarkets, hotels, and market stalls can list excess wholesome food in seconds.
            Our automated weighted algorithm matches it instantly with nearby verified pantries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Under-60-Second Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-[#FBBF24]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#F59E0B] text-white flex items-center justify-center font-black text-base shadow-sm">
                1
              </div>
              <h3 className="font-black text-[#92400E] text-lg uppercase tracking-tight">Surplus Food Submission</h3>
            </div>
            <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase">⚡ Fast Dispatch</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Vendor Profile Selector */}
            <div>
              <label className="block text-xs font-black text-[#92400E] uppercase tracking-wider mb-2">
                1. Vendor Profile
              </label>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-amber-50/50 border-2 border-amber-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#F59E0B] focus:bg-white outline-none"
              >
                {vendors.map(v => (
                  <option key={v.vendor_id} value={v.vendor_id}>
                    {v.name} ({v.location.subCounty || 'Nairobi'})
                  </option>
                ))}
              </select>
            </div>

            {/* Item Name */}
            <div>
              <label className="block text-xs font-black text-[#92400E] uppercase tracking-wider mb-2">
                2. Item Name & Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 30 Loaves Whole Wheat Bread & Fresh Milk"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-amber-50/50 border-2 border-amber-200 rounded-xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#F59E0B] focus:bg-white outline-none"
              />
            </div>

            {/* Category & Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-[#92400E] uppercase tracking-wider mb-2">
                  3. Food Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Listing['category'])}
                  className="w-full px-3.5 py-2.5 bg-amber-50/50 border-2 border-amber-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#F59E0B] focus:bg-white outline-none"
                >
                  <option value="produce">Fresh Produce (Vegetables/Fruits)</option>
                  <option value="bakery">Bakery & Bread</option>
                  <option value="dairy">Dairy & Eggs</option>
                  <option value="cooked_meals">Hot/Cooked Meals</option>
                  <option value="packaged_goods">Packaged / Dry Goods</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-[#92400E] uppercase tracking-wider mb-2">
                  4. Quantity & Unit
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-1/2 px-3.5 py-2.5 bg-amber-50/50 border-2 border-amber-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-[#F59E0B] focus:bg-white outline-none"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as Listing['unit'])}
                    className="w-1/2 px-3 py-2.5 bg-amber-50/50 border-2 border-amber-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#F59E0B] outline-none"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="units">Individual Units</option>
                    <option value="crates">Crates</option>
                    <option value="boxes">Boxes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Expiry Hours Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black text-[#92400E] uppercase tracking-wider">
                  5. Estimated Shelf Life / Expiry
                </label>
                <span className="text-xs font-black text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full uppercase">
                  ⏳ {expiryHours} {expiryHours === 1 ? 'Hour' : 'Hours'} remaining
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                step="1"
                value={expiryHours}
                onChange={(e) => setExpiryHours(Number(e.target.value))}
                className="w-full accent-[#F59E0B] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-amber-800 font-bold mt-1">
                <span>Urgent (&lt;2 hrs)</span>
                <span>6 hrs</span>
                <span>12 hrs</span>
                <span>24 hrs</span>
              </div>
            </div>

            {/* Nairobi Hub Location Picker */}
            <div>
              <label className="block text-xs font-black text-[#92400E] uppercase tracking-wider mb-2">
                6. Pickup Location (Nairobi Sub-County)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
                {NAIROBI_HUBS.map((hub) => (
                  <button
                    key={hub.name}
                    type="button"
                    onClick={() => handleHubSelect(hub.name)}
                    className={`text-left p-2 rounded-xl text-xs font-bold border-2 transition-all ${
                      selectedHubName === hub.name
                        ? 'bg-[#F59E0B] border-[#D97706] text-white shadow-sm'
                        : 'bg-amber-50/60 border-amber-200 text-slate-700 hover:bg-amber-100'
                    }`}
                  >
                    <div className="truncate font-black">{hub.name}</div>
                    <div className="text-[10px] opacity-80">{hub.subCounty}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-black text-[#92400E] uppercase tracking-wider mb-2">
                7. Handling / Storage Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Keep refrigerated, packed in clean plastic crates."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-amber-50/50 border-2 border-amber-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#F59E0B] outline-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !itemName.trim()}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Executing Algorithm Match...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-emerald-100" />
                  <span>Submit Surplus Food (&lt;60s)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Matching Algorithm Feedback Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Active Vendor Info */}
          <div className="bg-[#1E293B] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                Selected Vendor
              </span>
              <span className="text-xs font-black bg-amber-500 text-white px-2.5 py-0.5 rounded-full">
                ★ {selectedVendor.rating || 4.8}
              </span>
            </div>
            <h4 className="font-black text-xl text-white mb-1">{selectedVendor.name}</h4>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mb-2 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {selectedVendor.location.address}
            </p>
            <p className="text-xs text-slate-400">Contact: {selectedVendor.contact}</p>
          </div>

          {/* Real-time Match Preview */}
          {successResponse ? (
            <div className="bg-emerald-50 rounded-3xl p-6 border-4 border-emerald-400 shadow-xl">
              <div className="flex items-center gap-3 text-emerald-900 font-black text-lg mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <span>Listing Created & Matched!</span>
              </div>
              <p className="text-xs text-emerald-800 mb-4 font-semibold leading-relaxed">
                Your surplus food item <strong>"{successResponse.listing.item_name}"</strong> has been broadcast to the Nairobi network!
              </p>

              <div className="space-y-3 mb-5">
                <h5 className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                  Top Auto-Ranked Pantry Matches:
                </h5>
                {successResponse.topMatchesPreview?.map((m: any, idx: number) => (
                  <div key={m.pantry.pantry_id} className="bg-white p-3.5 rounded-2xl border-2 border-emerald-200 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-black text-xs text-slate-900">
                        #{idx + 1} {m.pantry.name}
                      </span>
                      <span className="text-xs font-black bg-emerald-500 text-white px-2.5 py-0.5 rounded-full">
                        {m.score}% Match
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                      <span>📍 {m.breakdown.distance_km} km away</span>
                      <span>⏳ {m.breakdown.travel_time_mins} mins transit</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={onNavigateToPantry}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow"
              >
                <span>View Ranked Pantry Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border-4 border-[#FBBF24] shadow-xl">
              <div className="flex items-center gap-2 text-[#92400E] font-black text-base mb-3 uppercase">
                <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                <span>Matching Engine Logic</span>
              </div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed mb-4">
                When you click submit, our weighted algorithm calculates:
              </p>
              <div className="space-y-2 text-xs font-bold">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                  <span className="text-slate-800">1. Proximity Score (w1 = 0.4)</span>
                  <span className="text-emerald-700 font-black">Inverse Distance</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                  <span className="text-slate-800">2. Urgency Score (w2 = 0.4)</span>
                  <span className="text-amber-700 font-black">Expiry Clock</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                  <span className="text-slate-800">3. Pantry Need Score (w3 = 0.2)</span>
                  <span className="text-indigo-700 font-black">Beneficiary Need</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-[#FFFBEB] rounded-xl text-[11px] font-bold text-[#92400E] flex items-start gap-2 border border-amber-300">
                <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <span>
                  The highest-ranked pantry is prioritized for 1-tap reservation and local volunteer pickup!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
