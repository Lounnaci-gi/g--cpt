import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { AVAILABLE_DIAMETERS } from '../constants';
import { MeterType } from '../types';
import { PackagePlus, Calendar, Hash, Tag, Activity, CheckCircle2, AlertCircle, FileText, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const Reception: React.FC = () => {
  const { meters, receiveStock, locations } = useStock();
  const [quantity, setQuantity] = useState<number>(1);
  const [diameter, setDiameter] = useState(AVAILABLE_DIAMETERS[0]);
  const [type, setType] = useState<MeterType>('Volumétrique');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [location, setLocation] = useState('Agence Commerciale');
  const [serialNumber, setSerialNumber] = useState('');
  
  // Order Info
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [issuer, setIssuer] = useState('');

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReceive = async () => {
    if (quantity > 0 && diameter && type && date && location) {
      // Check if SN already exists
      if (serialNumber) {
        const alreadyExists = meters.some(m => m.serialNumber === serialNumber);
        if (alreadyExists) {
          setError(`Erreur: Le numéro de série ${serialNumber} existe déjà dans le système.`);
          setTimeout(() => setError(null), 5000);
          return;
        }
      }

      const orderInfo = orderNumber || orderDate || issuer ? {
        orderNumber,
        orderDate,
        issuer
      } : undefined;

      try {
        await receiveStock(quantity, diameter, type, date, location, serialNumber, orderInfo);
        setSuccess(true);
        setError(null);
        setTimeout(() => setSuccess(false), 3000);
        setQuantity(1);
        setSerialNumber('');
        setOrderNumber('');
        setOrderDate('');
        setIssuer('');
      } catch (error) {
        console.error('Error receiving stock:', error);
        setError('Erreur lors de l\'enregistrement de la réception.');
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="border-b border-water-200 pb-6">
        <h2 className="text-4xl font-serif italic font-bold tracking-tight text-water-900">Réception de Stock</h2>
        <p className="font-mono text-xs uppercase tracking-widest text-water-500 mt-2">Alimentation du stock principal (Agence ou Antennes)</p>
      </header>

      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-10 space-y-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <PackagePlus className="w-32 h-32 text-water-900" />
          </div>

          <div className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Date de Réception
                </label>
                <input 
                  type="date" 
                  className="w-full bg-white/50 border border-water-200 p-4 font-mono text-sm uppercase focus:outline-none rounded-xl"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Quantité
                </label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full bg-white/50 border border-water-200 p-4 font-mono text-sm uppercase focus:outline-none rounded-xl"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
                  <Tag className="w-3 h-3" /> Diamètre (DN)
                </label>
                <select 
                  className="w-full bg-white/50 border border-water-200 p-4 font-mono text-sm uppercase focus:outline-none rounded-xl"
                  value={diameter}
                  onChange={(e) => setDiameter(e.target.value)}
                >
                  {AVAILABLE_DIAMETERS.map(dn => (
                    <option key={dn} value={dn}>{dn}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Type de Compteur
                </label>
                <select 
                  className="w-full bg-white/50 border border-water-200 p-4 font-mono text-sm uppercase focus:outline-none rounded-xl"
                  value={type}
                  onChange={(e) => setType(e.target.value as MeterType)}
                >
                  <option value="Volumétrique">Volumétrique</option>
                  <option value="Vitesse">Vitesse</option>
                  <option value="Électromagnétique">Électromagnétique</option>
                  <option value="Ultrasons">Ultrasons</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
                Localisation de Réception
              </label>
              <select 
                className="w-full bg-white/50 border border-water-200 p-4 font-mono text-sm uppercase focus:outline-none rounded-xl"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                {locations.map(l => (
                  <option key={l.name} value={l.name}>{l.name} ({l.type === 'Antenne' ? `Antenne de ${l.parentAgency}` : 'Agence'})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
                <Hash className="w-3 h-3" /> Numéro de Série (Facultatif)
              </label>
              <input 
                type="text" 
                placeholder="LAISSER VIDE SI INCONNU..."
                maxLength={18}
                className="w-full bg-white/50 border border-water-200 p-4 font-mono text-sm uppercase focus:outline-none rounded-xl"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-4 border-t border-water-100 pt-6">
              <h4 className="font-serif italic font-bold text-water-900 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-water-400" /> Bon de Commande (Facultatif)
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase text-water-500 font-bold">N° de Bon</label>
                  <input 
                    type="text" 
                    placeholder="EX: 1052/26"
                    className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Date du Bon</label>
                  <input 
                    type="date" 
                    className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
                  <User className="w-3 h-3" /> Émetteur
                </label>
                <input 
                  type="text" 
                  placeholder="EX: MAGASIN DE L'UNITÉ MÉDEA"
                  className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                />
              </div>
            </div>

            <div className="p-4 bg-cyan-50 border border-cyan-100 rounded-2xl flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-cyan-800 font-mono uppercase leading-relaxed">
                Note : Si aucun numéro de série n'est saisi, le champ restera vide. Vous pourrez l'attribuer plus tard via l'inventaire.
              </p>
            </div>

            <button 
              onClick={handleReceive}
              disabled={quantity <= 0}
              className={cn(
                "w-full py-5 font-mono uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 rounded-2xl shadow-lg",
                quantity > 0
                  ? "bg-water-600 text-white hover:bg-water-700 shadow-water-600/20" 
                  : "bg-water-100 text-water-300 cursor-not-allowed shadow-none"
              )}
            >
              Enregistrer la Réception
              <PackagePlus className="w-5 h-5" />
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 font-mono text-[10px] uppercase flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300 rounded-xl">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px] uppercase flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                Réception de {quantity} compteurs enregistrée avec succès
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reception;
