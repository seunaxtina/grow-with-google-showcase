import React, { useState } from 'react';
import { LayoutDashboard, Leaf, Utensils, CheckCircle2, Package, Download, RefreshCw, MapPin, TrendingUp, Sparkles } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { ImpactSummary, ImpactLog } from '../types';

interface AdminDashboardProps {
  summary: ImpactSummary | null;
  impactLogs: ImpactLog[];
  onResetSeedData: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  summary,
  impactLogs,
  onResetSeedData
}) => {
  const [filterText, setFilterText] = useState<string>('');
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const handleReset = async () => {
    if (confirm('Reset Nairobi network state back to fresh seed prototype data?')) {
      setIsResetting(true);
      await onResetSeedData();
      setIsResetting(false);
    }
  };

  const exportCSV = () => {
    if (!impactLogs || impactLogs.length === 0) return;
    const headers = ['Log ID', 'Match ID', 'Item Name', 'Vendor', 'Pantry', 'Kg Redirected', 'Meals Estimated', 'CO2 Avoided (kg)', 'Timestamp'];
    const rows = impactLogs.map(l => [
      l.log_id,
      l.match_id,
      `"${l.item_name}"`,
      `"${l.vendor_name}"`,
      `"${l.pantry_name}"`,
      l.kg_redirected,
      l.meals_estimated,
      l.co2_avoided_kg,
      l.timestamp
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mlo_Mtaani_Impact_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logs
  const filteredLogs = impactLogs.filter(l =>
    l.item_name.toLowerCase().includes(filterText.toLowerCase()) ||
    l.pantry_name.toLowerCase().includes(filterText.toLowerCase()) ||
    l.vendor_name.toLowerCase().includes(filterText.toLowerCase())
  );

  // Category breakdown data for charts
  const categoryData = [
    { name: 'Produce', value: 145, color: '#10b981' },
    { name: 'Bakery', value: 85, color: '#f59e0b' },
    { name: 'Dairy', value: 60, color: '#3b82f6' },
    { name: 'Packaged', value: 110, color: '#6366f1' },
    { name: 'Cooked Meals', value: 45, color: '#ec4899' },
  ];

  // Daily trend dummy chart data
  const trendData = [
    { day: 'Mon', kg: 42, meals: 105 },
    { day: 'Tue', kg: 68, meals: 170 },
    { day: 'Wed', kg: 95, meals: 237 },
    { day: 'Thu', kg: 80, meals: 200 },
    { day: 'Fri', kg: 120, meals: 300 },
    { day: 'Sat', kg: 155, meals: 387 },
    { day: 'Sun', kg: 180, meals: 450 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-amber-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-[#92400E] text-xs font-black px-3 py-1 rounded-full uppercase">
              Live Analytics & Impact
            </span>
            <span className="text-xs text-slate-500 font-bold uppercase">Nairobi Network</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
            Mlo Mtaani Impact Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export CSV Report</span>
          </button>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-[#92400E] text-xs font-black uppercase tracking-wider rounded-xl border-2 border-amber-200 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#F59E0B] ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Seed</span>
          </button>
        </div>
      </div>

      {/* KPI Counters Grid (Required 4 Summary Counters) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Kg Redirected */}
        <div className="bg-white rounded-3xl p-6 border-4 border-[#FBBF24] shadow-xl relative overflow-hidden border-l-8 border-l-emerald-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-[#92400E] uppercase tracking-wider">
              Total Food Redirected
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            {summary ? summary.total_kg_redirected : 245} <span className="text-lg font-black text-slate-500">kg</span>
          </div>
          <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% this week in Nairobi</span>
          </p>
        </div>

        {/* KPI 2: Total Meals Estimated */}
        <div className="bg-white rounded-3xl p-6 border-4 border-[#FBBF24] shadow-xl relative overflow-hidden border-l-8 border-l-[#F59E0B]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-[#92400E] uppercase tracking-wider">
              Meals Estimated
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#92400E] flex items-center justify-center font-black">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            {summary ? summary.total_meals_estimated : 612} <span className="text-lg font-black text-slate-500">meals</span>
          </div>
          <p className="text-xs text-slate-600 font-semibold">
            Calculated at 1 kg ≈ 2.5 meals
          </p>
        </div>

        {/* KPI 3: Matches Completed */}
        <div className="bg-white rounded-3xl p-6 border-4 border-[#FBBF24] shadow-xl relative overflow-hidden border-l-8 border-l-indigo-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-[#92400E] uppercase tracking-wider">
              Matches Completed
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            {summary ? summary.matches_completed : 12} <span className="text-lg font-black text-slate-500">deliveries</span>
          </div>
          <p className="text-xs text-indigo-700 font-bold">
            100% On-Time Rescue Rate
          </p>
        </div>

        {/* KPI 4: CO2 Avoided */}
        <div className="bg-white rounded-3xl p-6 border-4 border-[#FBBF24] shadow-xl relative overflow-hidden border-l-8 border-l-teal-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-[#92400E] uppercase tracking-wider">
              CO₂ Avoided (kg)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            {summary ? summary.co2_avoided_kg : 612.5} <span className="text-lg font-black text-slate-500">kg CO₂e</span>
          </div>
          <p className="text-xs text-teal-700 font-bold">
            1 kg food saved ≈ 2.5 kg CO₂e
          </p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly Redirected Food Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border-4 border-[#FBBF24] shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-[#92400E] text-lg uppercase tracking-tight">Daily Surplus Food Redirected (kg)</h3>
              <p className="text-xs text-slate-600 font-semibold">Weekly rescue progress across Nairobi sub-counties</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  cursor={{ fill: '#FEF3C7' }}
                />
                <Bar dataKey="kg" fill="#F59E0B" radius={[8, 8, 0, 0]} name="Kg Redirected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border-4 border-[#FBBF24] shadow-xl">
          <div className="mb-4">
            <h3 className="font-black text-[#92400E] text-lg uppercase tracking-tight">Redirected Food Categories</h3>
            <p className="text-xs text-slate-600 font-semibold">Distribution by item category</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Real-time Impact Logs Table */}
      <div className="bg-white rounded-3xl p-6 border-4 border-[#FBBF24] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b-2 border-amber-100">
          <div>
            <h3 className="font-black text-[#92400E] text-lg uppercase tracking-tight">Impact Audit Logs ({filteredLogs.length})</h3>
            <p className="text-xs text-slate-600 font-semibold">Immutable record of all food redistribution matches</p>
          </div>

          <input
            type="text"
            placeholder="Search vendor, pantry, or food item..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="px-4 py-2.5 bg-amber-50/50 border-2 border-amber-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#F59E0B] w-full sm:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-amber-100/60 text-[#92400E] uppercase tracking-wider font-black text-[10px] border-y-2 border-amber-200">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Item Name</th>
                <th className="py-3.5 px-4">Source Vendor</th>
                <th className="py-3.5 px-4">Destination Pantry</th>
                <th className="py-3.5 px-4 text-right">Kg Redirected</th>
                <th className="py-3.5 px-4 text-right">Meals</th>
                <th className="py-3.5 px-4 text-right">CO₂ Avoided</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 text-slate-800 font-bold">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No impact logs found matching "{filterText}"
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-amber-50/40 transition-all">
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">{log.item_name}</td>
                    <td className="py-3.5 px-4 text-slate-700">{log.vendor_name}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-black">{log.pantry_name}</td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-700">{log.kg_redirected} kg</td>
                    <td className="py-3.5 px-4 text-right font-black text-[#D97706]">{log.meals_estimated}</td>
                    <td className="py-3.5 px-4 text-right font-black text-teal-700">{log.co2_avoided_kg} kg</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
