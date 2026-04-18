import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { format } from 'date-fns';
import { MeterType } from '../types';
import { AVAILABLE_DIAMETERS } from '../constants';
import { HardHat, Search, CheckCircle2, RefreshCw, ShoppingCart, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const Field: React.FC = () => {
  const { meters, locations, recordPose, recordReplacement, recordSale, updateMeter } = useStock();
  const [activeSubTab, setActiveSubTab] = useState<'pose' | 'replacement' | 'sale'>('pose');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [meterSN, setMeterSN] = useState('');
  const [meterDiameter, setMeterDiameter] = useState('');
  const [meterType, setMeterType] = useState<MeterType>('Volumétrique');
  const [oldMeterSN, setOldMeterSN] = useState('');
  
  // Client Info State
  const [clientCode, setClientCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientFileNumber, setClientFileNumber] = useState('');
  const [realizationDate, setRealizationDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = () => {
    setError(null);
    const clientInfo = {
      code: clientCode,
      name: clientName,
      address: clientAddress,
      realizationDate: realizationDate,
      fileNumber: clientFileNumber
    };

    if (activeSubTab === 'pose' && meterSN && selectedLocation) {
      const meter = meters.find(m => m.serialNumber === meterSN);
      if (meter && (meter.status === 'Installé' || meter.status === 'Vendu')) {
        setError(`Erreur: Le compteur ${meterSN} est déjà ${meter.status.toLowerCase()}.`);
        setTimeout(() => setError(null), 5000);
        return;
      }
      const id = meter?.id || Math.random().toString(36).substr(2, 9);
      recordPose(id, selectedLocation, clientInfo, meterDiameter, meterType);
      if (!meter) {
        updateMeter(id, { serialNumber: meterSN });
      }
    } else if (activeSubTab === 'replacement' && meterSN && selectedLocation) {
      const newMeter = meters.find(m => m.serialNumber === meterSN);
      if (newMeter && (newMeter.status === 'Installé' || newMeter.status === 'Vendu')) {
        setError(`Erreur: Le nouveau compteur ${meterSN} est déjà ${newMeter.status.toLowerCase()}.`);
        setTimeout(() => setError(null), 5000);
        return;
      }
      const oldMeter = oldMeterSN ? meters.find(m => m.serialNumber === oldMeterSN) : null;
      const newId = newMeter?.id || Math.random().toString(36).substr(2, 9);
      const oldId = oldMeter?.id || (oldMeterSN ? Math.random().toString(36).substr(2, 9) : null);
      
      recordReplacement(newId, oldId, selectedLocation, clientInfo, meterDiameter, meterType, oldMeterSN);
      
      if (!newMeter) updateMeter(newId, { serialNumber: meterSN });
      if (oldId && !oldMeter) updateMeter(oldId, { serialNumber: oldMeterSN });
    } else if (activeSubTab === 'sale' && meterSN && selectedLocation) {
      const meter = meters.find(m => m.serialNumber === meterSN);
      if (meter && (meter.status === 'Installé' || meter.status === 'Vendu')) {
        setError(`Erreur: Le compteur ${meterSN} est déjà ${meter.status.toLowerCase()}.`);
        setTimeout(() => setError(null), 5000);
        return;
      }
      const id = meter?.id || Math.random().toString(36).substr(2, 9);
      recordSale(id, selectedLocation, clientInfo, meterDiameter, meterType);
      if (!meter) {
        updateMeter(id, { serialNumber: meterSN });
      }
    }

    setMeterSN('');
    setMeterDiameter('');
    setMeterType('Volumétrique');
    setOldMeterSN('');
    setClientCode('');
    setClientName('');
    setClientAddress('');
    setClientFileNumber('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const availableMeters = meters.filter(m => 
    m.location === selectedLocation && m.status === 'Neuf'
  );

  const installedMeters = meters.filter(m => 
    m.location === selectedLocation && m.status === 'Installé'
  );

  const subTabs = [
    { id: 'pose', label: 'Nouvelle Pose', icon: HardHat },
    { id: 'replacement', label: 'Remplacement', icon: RefreshCw },
    { id: 'sale', label: 'Vente Directe', icon: ShoppingCart },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="border-b border-water-200 pb-6">
        <h2 className="text-4xl font-serif italic font-bold tracking-tight text-water-900">Opérations de Terrain</h2>
        <p className="font-mono text-xs uppercase tracking-widest text-water-500 mt-2">Enregistrement des interventions par les techniciens</p>
      </header>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Location Selector */}
        <div className="glass-card p-8 space-y-4 rounded-3xl">
          <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Votre Localisation (Antenne)</label>
          <select 
            className="w-full bg-white/50 border border-water-200 p-4 font-mono text-sm uppercase focus:outline-none rounded-xl"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">SÉLECTIONNER VOTRE ANTENNE...</option>
            {locations.map(l => (
              <option key={l.name} value={l.name}>{l.name} ({l.type === 'Antenne' ? `Antenne de ${l.parentAgency}` : 'Agence'})</option>
            ))}
          </select>
        </div>

        {selectedLocation && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Sub-Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-water-100 rounded-2xl">
              {subTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-4 px-2 transition-all rounded-xl",
                    activeSubTab === tab.id 
                      ? "bg-white text-water-600 shadow-sm font-bold" 
                      : "text-water-400 hover:text-water-600"
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-center">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="glass-card p-10 space-y-8 rounded-3xl">
              <div className="space-y-6">
                {/* Client Info Section */}
                {(activeSubTab === 'pose' || activeSubTab === 'replacement' || activeSubTab === 'sale') && (
                  <div className="space-y-6 border-b border-water-100 pb-8">
                    <h4 className="font-serif italic font-bold text-water-900 text-lg">Informations Client</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Code Client (6 Caractères)</label>
                        <input 
                          type="text" 
                          placeholder="EX: 123456"
                          maxLength={6}
                          className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                          value={clientCode}
                          onChange={(e) => setClientCode(e.target.value.toUpperCase())}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Date de Réalisation</label>
                        <input 
                          type="date" 
                          className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                          value={realizationDate}
                          onChange={(e) => setRealizationDate(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {activeSubTab === 'pose' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                        <div className="space-y-2">
                          <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Numéro de Dossier</label>
                          <input 
                            type="text" 
                            placeholder="EX: 244/2026"
                            className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                            value={clientFileNumber}
                            onChange={(e) => setClientFileNumber(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Nom / Raison Sociale</label>
                          <input 
                            type="text" 
                            placeholder="NOM DU CLIENT..."
                            className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Adresse</label>
                          <input 
                            type="text" 
                            placeholder="ADRESSE COMPLETE..."
                            className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                            value={clientAddress}
                            onChange={(e) => setClientAddress(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeSubTab === 'replacement' && (
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Compteur Déposé (Ancien S/N - Max 18)</label>
                    <input 
                      type="text"
                      list="installed-meters"
                      placeholder="SAISIR S/N..."
                      maxLength={18}
                      className="w-full bg-white/50 border border-water-200 p-4 font-mono text-sm uppercase focus:outline-none rounded-xl"
                      value={oldMeterSN}
                      onChange={(e) => setOldMeterSN(e.target.value.toUpperCase())}
                    />
                    <datalist id="installed-meters">
                      {installedMeters.map(m => (
                        <option key={m.id} value={m.serialNumber}>{m.diameter}</option>
                      ))}
                    </datalist>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase text-water-500 font-bold">
                      Compteur à Poser / Vendre (Nouveau S/N - Max 18)
                    </label>
                    <input 
                      type="text"
                      list="available-meters"
                      placeholder="SAISIR S/N..."
                      maxLength={18}
                      className="w-full bg-white/50 border border-water-200 p-4 font-mono text-sm uppercase focus:outline-none rounded-xl"
                      value={meterSN}
                      onChange={(e) => {
                        const sn = e.target.value.toUpperCase();
                        setMeterSN(sn);
                        const existing = meters.find(m => m.serialNumber === sn);
                        if (existing) {
                          setMeterDiameter(existing.diameter);
                          setMeterType(existing.type);
                        }
                      }}
                    />
                    <datalist id="available-meters">
                      {availableMeters.map(m => (
                        <option key={m.id} value={m.serialNumber}>{m.diameter}</option>
                      ))
                      }
                    </datalist>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] uppercase text-water-500 font-bold text-cyan-600">Diamètre (DN)</label>
                        <select 
                          className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                          value={meterDiameter}
                          onChange={(e) => setMeterDiameter(e.target.value)}
                        >
                          <option value="">SÉLECTIONNER DN...</option>
                          {AVAILABLE_DIAMETERS.map(dn => (
                            <option key={dn} value={dn}>{dn}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] uppercase text-water-500 font-bold text-cyan-600">Type de Compteur</label>
                        <select 
                          className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                          value={meterType}
                          onChange={(e) => setMeterType(e.target.value as MeterType)}
                        >
                          <option value="Volumétrique">Volumétrique</option>
                          <option value="Vitesse">Vitesse</option>
                          <option value="Électromagnétique">Électromagnétique</option>
                          <option value="Ultrasons">Ultrasons</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!meterSN}
                  onClick={handleAction}
                  className={cn(
                    "w-full py-5 font-mono uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 rounded-2xl shadow-lg",
                    meterSN
                      ? "bg-water-600 text-white hover:bg-water-700 shadow-water-600/20" 
                      : "bg-water-100 text-water-300 cursor-not-allowed shadow-none"
                  )}
                >
                  Valider l'Opération
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 font-mono text-[10px] uppercase flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300 rounded-xl">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-cyan-50 border border-cyan-200 text-cyan-700 font-mono text-[10px] uppercase flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    Opération enregistrée avec succès
                  </div>
                )}
              </div>
            </div>
          )}

        {!selectedLocation && (
          <div className="text-center p-20 glass-card border-dashed border-water-200 opacity-40 rounded-3xl">
            <Search className="w-12 h-12 mx-auto mb-4 text-water-400" />
            <p className="font-mono text-xs uppercase tracking-widest text-water-600">Veuillez sélectionner une antenne pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Field;
