import React from 'react';
import { useStock } from '../context/StockContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Package, MapPin, Activity, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { AVAILABLE_DIAMETERS } from '../constants';

const Dashboard: React.FC = () => {
  const { meters, locations, lowStockAlerts, thresholds, updateThreshold } = useStock();
  const [editingThreshold, setEditingThreshold] = React.useState<any>(null);
  const [newThresholdValue, setNewThresholdValue] = React.useState<number>(0);

  // Stats
  const totalMeters = meters.length;
  const newMeters = meters.filter(m => m.status === 'Neuf').length;
  const installedMeters = meters.filter(m => m.status === 'Installé').length;
  const stoppedMeters = meters.filter(m => m.status === 'À l\'arrêt').length;

  // Data for chart: Stock by Diameter
  const diameterData = AVAILABLE_DIAMETERS.map(d => ({
    name: d.split(' ')[0], // Use short name for chart
    fullName: d,
    count: meters.filter(m => m.diameter === d).length
  })).filter(d => d.count > 0); // Only show diameters with stock

  // Data for chart: Stock by Location
  const locationData = locations.map(l => ({
    name: l.name,
    count: meters.filter(m => m.location === l.name).length
  }));

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="glass-card p-6 flex flex-col gap-2 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 rounded-3xl">
      <div className="flex justify-between items-start">
        <span className="font-mono text-[10px] uppercase tracking-widest text-water-600 font-bold">{title}</span>
        <div className={cn("p-2 rounded-xl bg-opacity-10", color.replace('text-', 'bg-'))}>
          <Icon className={cn("w-5 h-5", color)} />
        </div>
      </div>
      <span className="text-4xl font-serif italic font-bold text-water-900">{value}</span>
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-water-900">
        <Icon className="w-24 h-24" />
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="border-b border-water-200 pb-6">
        <h2 className="text-4xl font-serif italic font-bold tracking-tight text-water-900">Tableau de Bord</h2>
        <p className="font-mono text-xs uppercase tracking-widest text-water-500 mt-2">Aperçu global de l'inventaire en temps réel</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Compteurs" value={totalMeters} icon={Package} color="text-water-600" />
        <StatCard title="Stock Neuf" value={newMeters} icon={Activity} color="text-cyan-600" />
        <StatCard title="Total Installés" value={installedMeters} icon={MapPin} color="text-blue-600" />
        <StatCard title="À l'arrêt / Dépose" value={stoppedMeters} icon={AlertTriangle} color="text-teal-600" />
      </div>

      {/* Alerts Section */}
      {lowStockAlerts.length > 0 && (
        <div className="glass-card p-8 bg-red-50/30 border-red-100 rounded-3xl animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="font-serif italic text-xl font-bold text-red-900">Alertes de Stock Bas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockAlerts.map((alert, idx) => (
              <div key={idx} className="bg-white/80 border border-red-200 p-5 rounded-2xl flex flex-col gap-3 shadow-sm shadow-red-100">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-mono text-[9px] uppercase font-bold text-red-600">Stock Insuffisant</p>
                    <p className="font-serif italic font-bold text-water-900 uppercase text-xs">{alert.type}</p>
                    <p className="font-mono text-[10px] text-water-500 font-bold">{alert.diameter}</p>
                  </div>
                  <div className="bg-red-100 text-red-700 font-mono text-xs p-2 rounded-lg font-bold">
                    {alert.current} / {alert.min}
                  </div>
                </div>
                <div className="w-full bg-red-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (alert.current / alert.min) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Chart 1 */}
        <div className="glass-card p-8 rounded-3xl">
          <h3 className="font-serif italic text-xl font-bold mb-8 border-b border-water-100 pb-4 text-water-900">Répartition par Diamètre</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diameterData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0ea5e910" />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#0ea5e930' }} 
                  tickLine={false}
                  tick={{ fill: '#0c4a6e', fontSize: 12, fontFamily: 'monospace' }}
                />
                <YAxis 
                  axisLine={{ stroke: '#0ea5e930' }} 
                  tickLine={false}
                  tick={{ fill: '#0c4a6e', fontSize: 12, fontFamily: 'monospace' }}
                />
                <Tooltip 
                  cursor={{ fill: '#0ea5e905' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e0f2fe', color: '#0c4a6e', fontFamily: 'monospace', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]}>
                  {diameterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0ea5e9' : '#0284c7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="glass-card p-8 rounded-3xl">
          <h3 className="font-serif italic text-xl font-bold mb-8 border-b border-water-100 pb-4 text-water-900">Stock par Localisation</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#0ea5e910" />
                <XAxis 
                  type="number"
                  axisLine={{ stroke: '#0ea5e930' }} 
                  tickLine={false}
                  tick={{ fill: '#0c4a6e', fontSize: 12, fontFamily: 'monospace' }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  axisLine={{ stroke: '#0ea5e930' }} 
                  tickLine={false}
                  tick={{ fill: '#0c4a6e', fontSize: 10, fontFamily: 'monospace' }}
                  width={120}
                />
                <Tooltip 
                  cursor={{ fill: '#0ea5e905' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e0f2fe', color: '#0c4a6e', fontFamily: 'monospace', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Configuration des Seuils */}
      <div className="glass-card p-8 rounded-3xl space-y-6">
        <div className="flex justify-between items-center border-b border-water-100 pb-4">
          <div className="space-y-1">
            <h3 className="font-serif italic text-xl font-bold text-water-900">Paramètres des Seuils d'Alerte</h3>
            <p className="font-mono text-[9px] uppercase tracking-widest text-water-500">Définissez les niveaux minimum de stock par type</p>
          </div>
          <div className="bg-water-100 p-2 rounded-lg">
            <Package className="w-4 h-4 text-water-600" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {thresholds?.map((t, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white/50 border border-water-100 rounded-2xl hover:bg-white transition-all">
              <div className="space-y-1">
                <p className="font-mono text-[9px] uppercase font-bold text-water-500">{t.diameter}</p>
                <p className="font-serif italic font-medium text-water-900">{t.type}</p>
              </div>
              {editingThreshold?.diameter === t.diameter && editingThreshold?.type === t.type ? (
                <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
                  <input 
                    type="number"
                    className="w-16 bg-white border border-water-200 p-2 font-mono text-xs focus:outline-none rounded-lg"
                    value={newThresholdValue}
                    onChange={(e) => setNewThresholdValue(parseInt(e.target.value) || 0)}
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      updateThreshold(t.diameter, t.type, newThresholdValue);
                      setEditingThreshold(null);
                    }}
                    className="p-2 bg-water-600 text-white rounded-lg hover:bg-water-700 transition-all font-mono text-[10px] uppercase font-bold"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs font-bold text-water-600">MIN: {t.minQuantity}</span>
                  <button 
                    onClick={() => {
                      setEditingThreshold(t);
                      setNewThresholdValue(t.minQuantity);
                    }}
                    className="p-2 text-water-400 hover:text-water-600 hover:bg-water-50 rounded-lg transition-colors"
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
          {(!thresholds || thresholds.length === 0) && (
            <div className="col-span-full text-center font-mono text-[10px] text-water-400 uppercase py-10 italic border border-dashed border-water-200 rounded-2xl">
              Aucun seuil défini
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
