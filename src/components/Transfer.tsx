import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { Search, ArrowRight, CheckCircle2, AlertCircle, Filter, Layers, Hash, ListOrdered, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { AVAILABLE_DIAMETERS } from '../constants';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

const Transfer: React.FC = () => {
  const { meters, locations, transferMeters } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeters, setSelectedMeters] = useState<string[]>([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [transferDate, setTransferDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [success, setSuccess] = useState(false);

  // Sync initial source with first available location if empty or invalid
  React.useEffect(() => {
    if (locations.length > 0 && !locations.some(l => l.name === source)) {
      setSource(locations[0].name);
    }
  }, [locations, source]);

  // Batch Selection State
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [batchQuantity, setBatchQuantity] = useState<number | ''>('');
  const [batchDiameter, setBatchDiameter] = useState('');
  const [showBatchTools, setShowBatchTools] = useState(false);

  const availableMetersAtSource = meters.filter(m => 
    m.location === source && 
    m.status !== 'Installé' &&
    (m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) || m.diameter.includes(searchTerm))
  );

  const rangeMatchingMeters = React.useMemo(() => {
    if (!rangeStart || !rangeEnd) return [];
    return availableMetersAtSource.filter(m => {
      if (!m.serialNumber) return false;
      return m.serialNumber >= rangeStart && m.serialNumber <= rangeEnd;
    });
  }, [rangeStart, rangeEnd, availableMetersAtSource]);

  const quantityMatchingMeters = React.useMemo(() => {
    if (!batchDiameter || !batchQuantity) return [];
    const available = availableMetersAtSource.filter(m => m.diameter === batchDiameter && !selectedMeters.includes(m.id));
    return available.slice(0, Number(batchQuantity));
  }, [batchDiameter, batchQuantity, availableMetersAtSource, selectedMeters]);

  const handleToggleMeter = (id: string) => {
    setSelectedMeters(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleAddRange = () => {
    const matchingIds = rangeMatchingMeters.map(m => m.id);
    if (matchingIds.length === 0) return;
    setSelectedMeters(prev => Array.from(new Set([...prev, ...matchingIds])));
    setRangeStart('');
    setRangeEnd('');
  };

  const handleAddQuantity = () => {
    const toAdd = quantityMatchingMeters.map(m => m.id);
    if (toAdd.length === 0) return;
    setSelectedMeters(prev => [...prev, ...toAdd]);
    setBatchQuantity('');
  };

  const handleTransfer = async () => {
    if (selectedMeters.length > 0 && destination) {

      // Bloquer le transfert vers la même localisation
      if (source === destination) {
        Swal.fire({
          icon: 'warning',
          title: 'Localisation identique',
          text: 'La source et la destination sont identiques. Veuillez choisir une localisation différente.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#108bdd',
        });
        return;
      }
      const result = await Swal.fire({
        icon: 'question',
        title: 'Confirmer le transfert',
        html: `
          <div style="text-align:left;padding:8px">
            <div style="background:#f0f8ff;border-radius:12px;padding:14px;margin-top:8px;font-size:13px;color:#222b38">
              <div style="margin-bottom:8px"><strong style="color:#0872c0">📦 Compteurs :</strong> ${selectedMeters.length} sélectionné(s)</div>
              <div style="margin-bottom:8px"><strong style="color:#0872c0">📍 Source :</strong> ${source}</div>
              <div><strong style="color:#0872c0">➡️ Destination :</strong> ${destination}</div>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: '➡ Exécuter le transfert',
        cancelButtonText: '✕ Annuler',
        confirmButtonColor: '#108bdd',
        cancelButtonColor: '#64748b',
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      transferMeters(selectedMeters, source, destination, transferDate);
      setSelectedMeters([]);
      setDestination('');

      Swal.fire({
        icon: 'success',
        title: 'Transfert effectué !',
        html: `<p style="color:#64748b"><strong>${selectedMeters.length}</strong> compteur(s) transféré(s) vers <strong>${destination}</strong>.</p>`,
        confirmButtonText: 'Parfait',
        confirmButtonColor: '#108bdd',
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="border-b border-water-200 pb-6">
        <h2 className="text-4xl font-serif italic font-bold tracking-tight text-water-900">Transferts de Stock</h2>
        <p className="font-mono text-xs uppercase tracking-widest text-water-500 mt-2">Mouvement de matériel entre l'Agence et les Antennes</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Selection Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-water-400" />
              <input 
                type="text" 
                placeholder="RECHERCHER PAR S/N OU DIAMÈTRE..."
                className="w-full bg-white/70 backdrop-blur-md border border-water-200 py-4 pl-12 pr-4 font-mono text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-water-500/20 rounded-2xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowBatchTools(!showBatchTools)}
              className={cn(
                "px-6 py-4 font-mono text-xs uppercase tracking-widest flex items-center gap-2 rounded-2xl transition-all border",
                showBatchTools 
                  ? "bg-water-600 text-white border-water-600" 
                  : "bg-white text-water-600 border-water-200 hover:bg-water-50"
              )}
            >
              <Layers className="w-4 h-4" />
              Outils de Sélection
            </button>
          </div>

          {showBatchTools && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
              {/* Range Selection */}
              <div className="glass-card p-6 space-y-4 rounded-2xl border-water-200 border relative overflow-hidden">
                <h4 className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Sélection par Plage S/N
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    placeholder="DÉBUT S/N"
                    className="bg-white/50 border border-water-100 p-3 font-mono text-xs uppercase rounded-xl focus:outline-none"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value.toUpperCase())}
                  />
                  <input 
                    type="text" 
                    placeholder="FIN S/N"
                    className="bg-white/50 border border-water-100 p-3 font-mono text-xs uppercase rounded-xl focus:outline-none"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value.toUpperCase())}
                  />
                </div>
                <button 
                  onClick={handleAddRange}
                  disabled={rangeMatchingMeters.length === 0}
                  className={cn(
                    "w-full py-3 font-mono text-[10px] uppercase tracking-widest font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                    rangeMatchingMeters.length > 0 
                      ? "bg-water-600 text-white hover:bg-water-700" 
                      : "bg-water-100 text-water-300 cursor-not-allowed"
                  )}
                >
                  Ajouter {rangeMatchingMeters.length > 0 && `(${rangeMatchingMeters.length})`}
                </button>
                {rangeMatchingMeters.length > 0 && (
                  <div className="absolute top-0 right-0 bg-water-600 text-white text-[8px] px-2 py-1 rounded-bl-lg font-mono animate-in fade-in slide-in-from-right-2">
                    {rangeMatchingMeters.length} TROUVÉS
                  </div>
                )}
              </div>

              {/* Quantity Selection */}
              <div className="glass-card p-6 space-y-4 rounded-2xl border-water-200 border relative overflow-hidden">
                <h4 className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
                  <ListOrdered className="w-3 h-3" /> Sélection par Quantité
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    className="bg-white/50 border border-water-100 p-3 font-mono text-xs uppercase rounded-xl focus:outline-none"
                    value={batchDiameter}
                    onChange={(e) => setBatchDiameter(e.target.value)}
                  >
                    <option value="">DIAMÈTRE</option>
                    {AVAILABLE_DIAMETERS.map(dn => (
                      <option key={dn} value={dn}>{dn}</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    placeholder="QTÉ"
                    className="bg-white/50 border border-water-100 p-3 font-mono text-xs uppercase rounded-xl focus:outline-none"
                    value={batchQuantity}
                    onChange={(e) => setBatchQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
                <button 
                  onClick={handleAddQuantity}
                  disabled={quantityMatchingMeters.length === 0}
                  className={cn(
                    "w-full py-3 font-mono text-[10px] uppercase tracking-widest font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                    quantityMatchingMeters.length > 0 
                      ? "bg-water-600 text-white hover:bg-water-700" 
                      : "bg-water-100 text-water-300 cursor-not-allowed"
                  )}
                >
                  Ajouter {quantityMatchingMeters.length > 0 && `(${quantityMatchingMeters.length})`}
                </button>
                {quantityMatchingMeters.length > 0 && (
                  <div className="absolute top-0 right-0 bg-water-600 text-white text-[8px] px-2 py-1 rounded-bl-lg font-mono animate-in fade-in slide-in-from-right-2">
                    {quantityMatchingMeters.length} DISPONIBLES
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="glass-card overflow-hidden rounded-2xl">
            <div className="grid grid-cols-4 px-6 py-3 bg-water-600 text-white font-mono text-[10px] uppercase tracking-widest items-center">
              <span>S/N</span>
              <span>Diamètre</span>
              <span>Statut</span>
              <div className="flex justify-end">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const allIds = availableMetersAtSource.map(m => m.id);
                    const allSelected = allIds.every(id => selectedMeters.includes(id));
                    if (allSelected) {
                      setSelectedMeters(prev => prev.filter(id => !allIds.includes(id)));
                    } else {
                      setSelectedMeters(prev => Array.from(new Set([...prev, ...allIds])));
                    }
                  }}
                  className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded border border-white/30 transition-colors"
                >
                  {availableMetersAtSource.map(m => m.id).every(id => selectedMeters.includes(id)) ? 'DÉSÉLECTIONNER TOUT' : 'TOUT SÉLECTIONNER'}
                </button>
              </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {availableMetersAtSource.length === 0 ? (
                <div className="p-10 text-center text-water-400 font-mono text-xs uppercase">Aucun compteur disponible à cette source</div>
              ) : (
                availableMetersAtSource.map((m, idx) => (
                  <div 
                    key={`${m.id}-${idx}`}
                    onClick={() => handleToggleMeter(m.id)}
                    className={cn(
                      "grid grid-cols-4 px-6 py-4 border-b border-water-100 cursor-pointer transition-colors hover:bg-water-50",
                      selectedMeters.includes(m.id) && "bg-water-100/50"
                    )}
                  >
                    <span className="font-mono text-sm font-bold text-water-900">{m.serialNumber || 'SANS S/N'}</span>
                    <span className="font-mono text-sm text-water-700">{m.diameter}</span>
                    <span className={cn(
                      "font-mono text-[10px] uppercase font-bold self-center px-2 py-0.5 rounded-full inline-block w-fit",
                      m.status === 'Neuf' ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                    )}>{m.status}</span>
                    <div className="flex justify-end">
                      <div className={cn(
                        "w-5 h-5 border border-water-300 rounded-md flex items-center justify-center transition-all",
                        selectedMeters.includes(m.id) ? "bg-water-500 border-water-500 text-white shadow-sm" : "bg-transparent"
                      )}>
                        {selectedMeters.includes(m.id) && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="space-y-8">
          <div className="glass-card p-8 space-y-6 sticky top-24 rounded-3xl">
            <h3 className="font-serif italic text-xl font-bold border-b border-water-100 pb-4 text-water-900">Résumé du Transfert</h3>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Source</label>
                  <span className="font-mono text-[10px] uppercase bg-water-100 text-water-600 px-2 py-0.5 rounded-full font-bold">
                    {meters.filter(m => m.location === source && m.status !== 'Installé').length} DISPONIBLES
                  </span>
                </div>
                <select 
                  className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                  value={source}
                  onChange={(e) => {
                    setSource(e.target.value);
                    setSelectedMeters([]);
                    if (destination === e.target.value) setDestination('');
                  }}
                >
                  {locations.map(l => (
                    <option key={l.name} value={l.name}>{l.name} ({l.type === 'Antenne' ? `Antenne de ${l.parentAgency}` : 'Agence'})</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Destination</label>
                <select 
                  className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                >
                  <option value="">SÉLECTIONNER DESTINATION...</option>
                  {locations.filter(l => l.name !== source).map(l => (
                    <option key={l.name} value={l.name}>{l.name} ({l.type === 'Antenne' ? `Antenne de ${l.parentAgency}` : 'Agence'})</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Date de Transfert
                </label>
                <input 
                  type="date" 
                  className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-water-100">
                <span className="font-mono text-[10px] uppercase text-water-500 font-bold">Sélectionnés</span>
                <span className="text-2xl font-serif italic font-bold text-water-600">{selectedMeters.length}</span>
              </div>

              {selectedMeters.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] uppercase text-water-400">Détails de la sélection</span>
                    <button 
                      onClick={() => setSelectedMeters([])}
                      className="text-[10px] font-mono uppercase text-red-400 hover:text-red-600 transition-colors"
                    >
                      Vider
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto border border-water-100 rounded-xl p-2 bg-water-50/30 space-y-1">
                    {selectedMeters.map(id => {
                      const meter = meters.find(m => m.id === id);
                      return (
                        <div key={id} className="flex justify-between text-[9px] font-mono uppercase text-water-600">
                          <span className="font-bold">{meter?.serialNumber || 'SANS S/N'}</span>
                          <span className="opacity-50">{meter?.diameter}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button 
              disabled={selectedMeters.length === 0 || !destination || source === destination}
              onClick={handleTransfer}
              className={cn(
                "w-full py-4 font-mono uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 rounded-2xl shadow-lg",
                selectedMeters.length > 0 && destination 
                  ? "bg-water-600 text-white hover:bg-water-700 shadow-water-600/20" 
                  : "bg-water-100 text-water-300 cursor-not-allowed shadow-none"
              )}
            >
              Exécuter le Transfert
              <ArrowRight className="w-4 h-4" />
            </button>

            {success && (
              <div className="p-4 bg-cyan-50 border border-cyan-200 text-cyan-700 font-mono text-[10px] uppercase flex items-center gap-2 animate-in fade-in zoom-in duration-300 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                Transfert réussi avec succès
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
