import React, { useState, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfYear, endOfYear } from 'date-fns';
import { FileText, Download, Filter, Calendar, Edit2, X, Check, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { AVAILABLE_DIAMETERS } from '../constants';
import { MeterDiameter, Movement, MovementType } from '../types';

const Reporting: React.FC = () => {
  const { meters, movements, locations, updateMovement } = useStock();
  const [reportType, setReportType] = useState<'monthly' | 'annual'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Edit Modal State
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [editType, setEditType] = useState<MovementType>('Pose');

  const diameters = AVAILABLE_DIAMETERS;

  const reportData = useMemo(() => {
    const start = reportType === 'monthly' ? startOfMonth(selectedDate) : startOfYear(selectedDate);
    const end = reportType === 'monthly' ? endOfMonth(selectedDate) : endOfYear(selectedDate);

    return diameters.map(diameter => {
      const relevantMeters = meters.filter(m => 
        m.diameter === diameter && (selectedLocation === 'all' || m.location === selectedLocation)
      );

      const periodMovements = movements.filter(mov => {
        const movDate = parseISO(mov.date);
        const isInPeriod = isWithinInterval(movDate, { start, end });
        const isRelevantLocation = selectedLocation === 'all' || mov.source === selectedLocation || mov.destination === selectedLocation;
        const movDiameter = mov.diameter || meters.find(m => m.serialNumber === mov.serialNumber)?.diameter;
        return isInPeriod && isRelevantLocation && movDiameter === diameter;
      });

      const stockFinal = relevantMeters.filter(m => m.status === 'Neuf' || m.status === 'À l\'arrêt').length;

      const entrees = periodMovements.filter(mov => 
        (mov.type === 'Réception' || mov.type === 'Réintégration' || mov.type === 'Transfert') && 
        (selectedLocation === 'all' || mov.destination === selectedLocation)
      ).length;

      const poses = periodMovements.filter(mov => 
        mov.type === 'Pose' && (selectedLocation === 'all' || mov.source === selectedLocation)
      ).length;

      const ventes = periodMovements.filter(mov => 
        mov.type === 'Vente' && (selectedLocation === 'all' || mov.source === selectedLocation)
      ).length;

      const remplacements = periodMovements.filter(mov => 
        mov.type === 'Remplacement' && (selectedLocation === 'all' || mov.source === selectedLocation)
      ).length;

      const transfertsSortants = periodMovements.filter(mov => 
        mov.type === 'Transfert' && (selectedLocation === 'all' || mov.source === selectedLocation)
      ).length;

      const sorties = poses + ventes + remplacements + transfertsSortants;

      const stockInitial = stockFinal - entrees + sorties;

      return {
        diameter,
        stockInitial,
        entrees,
        poses,
        ventes,
        remplacements,
        transfertsSortants,
        sorties,
        stockFinal
      };
    });
  }, [meters, movements, reportType, selectedDate, selectedLocation]);

  const filteredMovements = useMemo(() => {
    const start = reportType === 'monthly' ? startOfMonth(selectedDate) : startOfYear(selectedDate);
    const end = reportType === 'monthly' ? endOfMonth(selectedDate) : endOfYear(selectedDate);

    return movements.filter(m => {
      const matchesLocation = selectedLocation === 'all' || m.source === selectedLocation || m.destination === selectedLocation;
      const matchesType = selectedType === 'all' || m.type === selectedType;
      const movementDate = parseISO(m.date);
      const matchesDate = isWithinInterval(movementDate, { start, end });
      return matchesLocation && matchesType && matchesDate;
    });
  }, [movements, reportType, selectedDate, selectedLocation, selectedType]);

  const handleEditClick = (mov: Movement) => {
    setEditingMovement(mov);
    setEditType(mov.type);
  };

  const handleSaveEdit = () => {
    if (editingMovement) {
      updateMovement(editingMovement.id, { type: editType });
      setEditingMovement(null);
    }
  };

  const typeColors: Record<string, string> = {
    'Entrée': 'text-cyan-600 bg-cyan-50 border-cyan-200',
    'Sortie': 'text-blue-600 bg-blue-50 border-blue-200',
    'Transfert': 'text-water-600 bg-water-50 border-water-200',
    'Retour': 'text-teal-600 bg-teal-50 border-teal-200',
    'Pose': 'text-indigo-600 bg-indigo-50 border-indigo-200',
    'Vente': 'text-emerald-600 bg-emerald-50 border-emerald-200',
    'Remplacement': 'text-sky-600 bg-sky-50 border-sky-200',
    'Réintégration': 'text-amber-600 bg-amber-50 border-amber-200',
    'Réception': 'text-purple-600 bg-purple-50 border-purple-200',
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="border-b border-water-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-serif italic font-bold tracking-tight text-water-900">Reporting & Bilans</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-water-500 mt-2">Analyse des flux et état des stocks périodiques</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-water-600 text-white font-mono text-[10px] uppercase tracking-widest hover:bg-water-700 transition-all rounded-xl shadow-lg shadow-water-600/20"
          >
            <Download className="w-4 h-4" />
            Exporter PDF
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="glass-card p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 rounded-3xl">
        <div className="space-y-3">
          <label className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Type de Bilan
          </label>
          <div className="flex p-1 bg-water-100 rounded-xl">
            <button 
              onClick={() => setReportType('monthly')}
              className={cn("flex-1 py-2 font-mono text-[10px] uppercase rounded-lg transition-all", reportType === 'monthly' ? "bg-white text-water-600 shadow-sm font-bold" : "text-water-400")}
            >
              Mensuel
            </button>
            <button 
              onClick={() => setReportType('annual')}
              className={cn("flex-1 py-2 font-mono text-[10px] uppercase rounded-lg transition-all", reportType === 'annual' ? "bg-white text-water-600 shadow-sm font-bold" : "text-water-400")}
            >
              Annuel
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
            <Filter className="w-3 h-3" /> Localisation
          </label>
          <select 
            className="w-full bg-white/50 border border-water-200 p-3 font-mono text-[10px] uppercase focus:outline-none rounded-xl"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="all">TOUTES LES LOCALISATIONS</option>
            {locations.map(l => (
              <option key={l.name} value={l.name}>{l.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
            Période
          </label>
          <input 
            type={reportType === 'monthly' ? "month" : "number"}
            className="w-full bg-white/50 border border-water-200 p-3 font-mono text-[10px] uppercase focus:outline-none rounded-xl"
            value={reportType === 'monthly' ? format(selectedDate, 'yyyy-MM') : selectedDate.getFullYear()}
            onChange={(e) => {
              if (reportType === 'monthly') {
                setSelectedDate(new Date(e.target.value));
              } else {
                const newDate = new Date(selectedDate);
                newDate.setFullYear(parseInt(e.target.value));
                setSelectedDate(newDate);
              }
            }}
          />
        </div>

        <div className="space-y-3">
          <label className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
            Type de Mouvement
          </label>
          <select 
            className="w-full bg-white/50 border border-water-200 p-3 font-mono text-[10px] uppercase focus:outline-none rounded-xl"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">TOUS LES TYPES</option>
            <option value="Transfert">TRANSFERT</option>
            <option value="Pose">POSE</option>
            <option value="Remplacement">REMPLACEMENT</option>
            <option value="Vente">VENTE</option>
            <option value="Réintégration">RÉINTÉGRATION</option>
            <option value="Réception">RÉCEPTION</option>
          </select>
        </div>
      </div>

      {/* Summary Table */}
      <div className="space-y-6">
        <h3 className="font-serif italic text-2xl font-bold text-water-900">Bilan par Diamètre</h3>
        <div className="glass-card overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-water-600 text-white font-mono text-[10px] uppercase tracking-widest text-center">
                  <th className="p-4 text-left border-r border-white/10" rowSpan={2}>Diamètre</th>
                  <th className="p-4 border-r border-white/10" rowSpan={2}>Stock Initial</th>
                  <th className="p-4 border-r border-white/10" rowSpan={2}>Entrées</th>
                  <th className="p-2 border-r border-white/10 border-b border-white/10" colSpan={5}>Sorties</th>
                  <th className="p-4" rowSpan={2}>Stock Final</th>
                </tr>
                <tr className="bg-water-500 text-white font-mono text-[9px] uppercase tracking-widest text-center">
                  <th className="p-2 border-r border-white/10">Poses</th>
                  <th className="p-2 border-r border-white/10">Ventes</th>
                  <th className="p-2 border-r border-white/10">Rempls.</th>
                  <th className="p-2 border-r border-white/10">Transf.</th>
                  <th className="p-2 border-r border-white/10">Total</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm">
                {reportData.map((row, idx) => (
                  <tr key={row.diameter} className={cn("border-b border-water-100 hover:bg-water-50/50 transition-colors", idx % 2 === 0 ? "bg-white/30" : "bg-transparent")}>
                    <td className="p-4 font-bold border-r border-water-100 text-water-900">{row.diameter}</td>
                    <td className="p-4 text-center border-r border-water-100 text-water-700">{row.stockInitial}</td>
                    <td className="p-4 text-center border-r border-water-100 text-purple-600 font-bold">+{row.entrees}</td>
                    <td className="p-4 text-center border-r border-water-100 text-indigo-500 opacity-80">{row.poses > 0 ? `-${row.poses}` : '-'}</td>
                    <td className="p-4 text-center border-r border-water-100 text-emerald-500 opacity-80">{row.ventes > 0 ? `-${row.ventes}` : '-'}</td>
                    <td className="p-4 text-center border-r border-water-100 text-sky-500 opacity-80">{row.remplacements > 0 ? `-${row.remplacements}` : '-'}</td>
                    <td className="p-4 text-center border-r border-water-100 text-water-400 opacity-80">{row.transfertsSortants > 0 ? `-${row.transfertsSortants}` : '-'}</td>
                    <td className="p-4 text-center border-r border-water-100 text-blue-600 font-bold">-{row.sorties}</td>
                    <td className="p-4 text-center font-bold bg-water-500/5 text-water-900">{row.stockFinal}</td>
                  </tr>
                ))}
                <tr className="bg-water-900 text-white font-bold">
                  <td className="p-4 border-r border-white/10">TOTAL</td>
                  <td className="p-4 text-center border-r border-white/10">{reportData.reduce((acc, r) => acc + r.stockInitial, 0)}</td>
                  <td className="p-4 text-center border-r border-white/10">{reportData.reduce((acc, r) => acc + r.entrees, 0)}</td>
                  <td className="p-4 text-center border-r border-white/10">{reportData.reduce((acc, r) => acc + r.poses, 0)}</td>
                  <td className="p-4 text-center border-r border-white/10">{reportData.reduce((acc, r) => acc + r.ventes, 0)}</td>
                  <td className="p-4 text-center border-r border-white/10">{reportData.reduce((acc, r) => acc + r.remplacements, 0)}</td>
                  <td className="p-4 text-center border-r border-white/10">{reportData.reduce((acc, r) => acc + r.transfertsSortants, 0)}</td>
                  <td className="p-4 text-center border-r border-white/10">{reportData.reduce((acc, r) => acc + r.sorties, 0)}</td>
                  <td className="p-4 text-center">{reportData.reduce((acc, r) => acc + r.stockFinal, 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed Movements Table */}
      <div className="space-y-6">
        <h3 className="font-serif italic text-2xl font-bold text-water-900">Journal des Mouvements</h3>
        <div className="glass-card overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-water-600 text-white font-mono text-[10px] uppercase tracking-widest">
                  <th className="p-4 text-left border-r border-white/10">Date</th>
                  <th className="p-4 text-left border-r border-white/10">Type</th>
                  <th className="p-4 text-left border-r border-white/10">S/N</th>
                  <th className="p-4 text-left border-r border-white/10">Client / Détails</th>
                  <th className="p-4 text-left border-r border-white/10">Localisation</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-water-400 uppercase text-xs">Aucun mouvement enregistré pour cette période</td>
                  </tr>
                ) : (
                  filteredMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((m, idx) => (
                    <tr key={m.id} className={cn("border-b border-water-100 hover:bg-water-50/50 transition-colors", idx % 2 === 0 ? "bg-white/30" : "bg-transparent")}>
                      <td className="p-4 text-water-700">{format(new Date(m.date), 'dd/MM/yyyy HH:mm')}</td>
                      <td className="p-4 border-r border-water-100">
                        <span className={cn("px-2 py-1 text-[10px] uppercase font-bold border rounded-md", typeColors[m.type])}>
                          {m.type}
                        </span>
                      </td>
                      <td className="p-4 border-r border-water-100">
                        <div className="font-bold text-water-900">{m.serialNumber}</div>
                        {(m.brand || m.model) && (
                          <div className="text-[10px] text-water-400 uppercase">
                            {m.brand} {m.model}
                          </div>
                        )}
                      </td>
                      <td className="p-4 border-r border-water-100">
                        {m.clientInfo ? (
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-water-800">Client: {m.clientInfo.code}</div>
                            {m.clientInfo.fileNumber && <div className="text-[10px] text-water-700 font-bold">Dossier: {m.clientInfo.fileNumber}</div>}
                            {m.clientInfo.name && <div className="text-[10px] text-water-600">{m.clientInfo.name}</div>}
                          </div>
                        ) : m.orderInfo ? (
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-purple-800">Bon: {m.orderInfo.orderNumber}</div>
                            {m.orderInfo.orderDate && <div className="text-[10px] text-purple-600">Du {format(new Date(m.orderInfo.orderDate), 'dd/MM/yyyy')}</div>}
                            {m.orderInfo.issuer && <div className="text-[10px] text-purple-500 italic">{m.orderInfo.issuer}</div>}
                          </div>
                        ) : (
                          <span className="text-xs text-water-400 italic">{m.details || 'N/A'}</span>
                        )}
                      </td>
                      <td className="p-4 border-r border-water-100 text-water-500 text-xs">
                        <div className="flex flex-col">
                          <span className="opacity-60">De: {m.source}</span>
                          <span className="font-bold">À: {m.destination}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleEditClick(m)}
                          className="p-2 text-water-400 hover:text-water-600 hover:bg-water-100 rounded-lg transition-all"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Movement Modal */}
      {editingMovement && (
        <div className="fixed inset-0 bg-water-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg p-8 rounded-3xl shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center border-b border-water-100 pb-4">
              <h3 className="font-serif italic text-2xl font-bold text-water-900">Modifier Mouvement</h3>
              <button onClick={() => setEditingMovement(null)} className="p-2 hover:bg-water-100 rounded-full transition-all">
                <X className="w-5 h-5 text-water-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-water-50 rounded-2xl space-y-2">
                <div className="flex justify-between text-[10px] font-mono uppercase text-water-500">
                  <span>Compteur</span>
                  <span>Date</span>
                </div>
                <div className="flex justify-between font-bold text-water-900">
                  <span>{editingMovement.serialNumber}</span>
                  <span>{format(new Date(editingMovement.date), 'dd/MM/yyyy')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Type de Mouvement</label>
                <select 
                  className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as MovementType)}
                >
                  <option value="Pose">POSE</option>
                  <option value="Remplacement">REMPLACEMENT</option>
                  <option value="Vente">VENTE DIRECTE</option>
                  <option value="Réintégration">RÉINTÉGRATION</option>
                  <option value="Transfert">TRANSFERT</option>
                </select>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 font-mono uppercase leading-relaxed">
                  Note : La modification du type de mouvement n'impacte pas automatiquement le statut actuel du compteur. Cette action sert principalement à corriger les erreurs de saisie dans le journal.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setEditingMovement(null)}
                className="flex-1 py-4 font-mono uppercase text-xs tracking-widest text-water-600 bg-water-100 hover:bg-water-200 rounded-xl transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveEdit}
                className="flex-1 py-4 font-mono uppercase text-xs tracking-widest text-white bg-water-600 hover:bg-water-700 rounded-xl shadow-lg shadow-water-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-4 p-8 bg-cyan-50 border border-cyan-100 rounded-3xl">
        <FileText className="w-8 h-8 text-cyan-600 shrink-0" />
        <div className="space-y-2">
          <h4 className="font-serif italic font-bold text-cyan-900 text-lg">Note sur le calcul</h4>
          <p className="text-sm text-cyan-800 leading-relaxed opacity-80">
            Le tableau synthétise les mouvements complets de stock sur la période sélectionnée :<br/>
            • <strong>Entrées</strong> : Réceptions fournisseurs, transferts entrants et réintégrations.<br/>
            • <strong>Sorties</strong> : Poses, ventes, remplacements et transferts sortants.<br/>
            • <strong>Stock Initial</strong> = Stock Final - Entrées + Sorties.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reporting;
