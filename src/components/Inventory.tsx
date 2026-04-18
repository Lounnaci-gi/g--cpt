import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { Search, Filter, Tag, MapPin, Activity, Edit2, X, Check, AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { AVAILABLE_DIAMETERS } from '../constants';
import { MeterStatus, MeterDiameter, Meter, MeterType } from '../types';
import Swal from 'sweetalert2';

const Inventory: React.FC = () => {
  const { meters, locations, updateMeter } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MeterStatus | 'all'>('all');
  const [diameterFilter, setDiameterFilter] = useState<MeterDiameter | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState<string | 'all'>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Edit Modal State
  const [editingMeter, setEditingMeter] = useState<Meter | null>(null);
  const [editSN, setEditSN] = useState('');
  const [editDiameter, setEditDiameter] = useState<MeterDiameter>('15/21 (DN15)');
  const [editType, setEditType] = useState<MeterType>('Volumétrique');
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editYear, setEditYear] = useState(new Date().getFullYear());

  const filteredMeters = meters.filter(m => {
    const matchesSearch = m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesDiameter = diameterFilter === 'all' || m.diameter === diameterFilter;
    const matchesLocation = locationFilter === 'all' || m.location === locationFilter;
    return matchesSearch && matchesStatus && matchesDiameter && matchesLocation;
  });

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: Function, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredMeters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMeters = filteredMeters.slice(startIndex, endIndex);
  const showingFrom = filteredMeters.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(endIndex, filteredMeters.length);

  // Pagination helpers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const handleEditClick = (meter: Meter) => {
    setEditingMeter(meter);
    setEditSN(meter.serialNumber);
    setEditDiameter(meter.diameter);
    setEditType(meter.type);
    setEditBrand(meter.brand || '');
    setEditModel(meter.model || '');
    setEditYear(meter.year || new Date().getFullYear());
  };

  const handleSaveEdit = async () => {
    if (editingMeter) {
      // Check for uniqueness
      if (editSN && editSN !== editingMeter.serialNumber) {
        const alreadyExists = meters.some(m => m.serialNumber === editSN && m.id !== editingMeter.id);
        if (alreadyExists) {
          Swal.fire({
            icon: 'error',
            title: 'Numéro de série déjà utilisé',
            text: `Le numéro de série ${editSN} est déjà attribué à un autre compteur.`,
            confirmButtonText: 'OK',
            confirmButtonColor: '#dc2626',
          });
          return;
        }
      }

      const result = await Swal.fire({
        icon: 'question',
        title: 'Confirmer la modification',
        html: `
          <div style="text-align:left;padding:8px">
            <div style="background:#f0f8ff;border-radius:12px;padding:14px;margin-top:8px;font-size:13px;color:#222b38">
              <div style="margin-bottom:8px"><strong style="color:#0872c0">🏷️ S/N :</strong> ${editSN || '(inchangé)'}</div>
              <div style="margin-bottom:8px"><strong style="color:#0872c0">📏 Diamètre :</strong> ${editDiameter}</div>
              <div style="margin-bottom:8px"><strong style="color:#0872c0">🏗️ Marque :</strong> ${editBrand}</div>
              <div style="margin-bottom:8px"><strong style="color:#0872c0">📅 Année :</strong> ${editYear}</div>
              <div><strong style="color:#0872c0">🔧 Type :</strong> ${editType}</div>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: '✓ Enregistrer',
        cancelButtonText: '✕ Annuler',
        confirmButtonColor: '#108bdd',
        cancelButtonColor: '#64748b',
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      updateMeter(editingMeter.id, {
        serialNumber: editSN,
        diameter: editDiameter,
        type: editType,
        brand: editBrand,
        model: editModel,
        year: editYear
      });
      setEditingMeter(null);
    }
  };

  const statusColors: Record<MeterStatus, string> = {
    'Neuf': 'text-cyan-600 bg-cyan-50 border-cyan-200',
    'Installé': 'text-blue-600 bg-blue-50 border-blue-200',
    'À l\'arrêt': 'text-teal-600 bg-teal-50 border-teal-200',
    'Vendu': 'text-water-600 bg-water-50 border-water-200',
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="border-b border-water-200 pb-6">
        <h2 className="text-4xl font-serif italic font-bold tracking-tight text-water-900">Inventaire Complet</h2>
        <p className="font-mono text-xs uppercase tracking-widest text-water-500 mt-2">Liste exhaustive et filtrage des compteurs d'eau</p>
      </header>

      {/* Filters Bar */}
      <div className="glass-card p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 rounded-2xl">
        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
            <Search className="w-3 h-3" /> N° Série
          </label>
          <input 
            type="text" 
            placeholder="RECHERCHER S/N..."
            className="w-full bg-white/50 border border-water-200 p-3 font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-water-500/20 rounded-xl"
            value={searchTerm}
            onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
            <Activity className="w-3 h-3" /> État
          </label>
          <select 
            className="w-full bg-white/50 border border-water-200 p-3 font-mono text-xs uppercase focus:outline-none rounded-xl"
            value={statusFilter}
            onChange={(e) => handleFilterChange(setStatusFilter, e.target.value as any)}
          >
            <option value="all">TOUS LES ÉTATS</option>
            <option value="Neuf">NEUF</option>
            <option value="Installé">INSTALLÉ</option>
            <option value="À l'arrêt">À L'ARRÊT</option>
            <option value="Vendu">VENDU</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
            <Tag className="w-3 h-3" /> Diamètre
          </label>
          <select 
            className="w-full bg-white/50 border border-water-200 p-3 font-mono text-xs uppercase focus:outline-none rounded-xl"
            value={diameterFilter}
            onChange={(e) => handleFilterChange(setDiameterFilter, e.target.value as any)}
          >
            <option value="all">TOUS LES DIAMÈTRES</option>
            {AVAILABLE_DIAMETERS.map(dn => (
              <option key={dn} value={dn}>{dn}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase text-water-500 font-bold flex items-center gap-2">
            <MapPin className="w-3 h-3" /> Localisation
          </label>
          <select 
            className="w-full bg-white/50 border border-water-200 p-3 font-mono text-xs uppercase focus:outline-none rounded-xl"
            value={locationFilter}
            onChange={(e) => handleFilterChange(setLocationFilter, e.target.value)}
          >
            <option value="all">TOUTES LES LOCALISATIONS</option>
            {locations.map(l => (
              <option key={l.name} value={l.name}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-water-600 text-white font-mono text-[10px] uppercase tracking-widest">
                <th className="p-4 text-left border-r border-white/10">Numéro de Série</th>
                <th className="p-4 text-left border-r border-white/10">Marque/Modèle</th>
                <th className="p-4 text-left border-r border-white/10">Diamètre</th>
                <th className="p-4 text-left border-r border-white/10">Année</th>
                <th className="p-4 text-left border-r border-white/10">État</th>
                <th className="p-4 text-left border-r border-white/10">Localisation</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {paginatedMeters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-water-400 uppercase text-xs">Aucun compteur trouvé</td>
                </tr>
              ) : (
                paginatedMeters.map((m, idx) => (
                  <tr key={`${m.id}-${idx}`} className={cn("border-b border-water-100 hover:bg-water-50/50 transition-colors", idx % 2 === 0 ? "bg-white/30" : "bg-transparent")}>
                    <td className="p-4 font-bold border-r border-water-100 text-water-900">{m.serialNumber || <span className="text-water-300 italic font-normal">SANS S/N</span>}</td>
                    <td className="p-4 border-r border-water-100">
                      <div className="text-water-900 font-bold">{m.brand}</div>
                      <div className="text-water-400 text-[10px] uppercase truncate max-w-[120px]">{m.model}</div>
                    </td>
                    <td className="p-4 border-r border-water-100 text-water-700">{m.diameter}</td>
                    <td className="p-4 border-r border-water-100 text-water-500">{m.year}</td>
                    <td className="p-4 border-r border-water-100">
                      <span className={cn("px-2 py-1 text-[10px] uppercase font-bold border rounded-md", statusColors[m.status])}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4 border-r border-water-100 text-water-700">{m.location}</td>
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
        
        {/* Pagination Controls */}
        {filteredMeters.length > itemsPerPage && (
          <div className="border-t border-water-100 p-6 bg-white/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Info */}
              <div className="font-mono text-xs text-water-600">
                Affichage de <span className="font-bold">{showingFrom}-{showingTo}</span> sur <span className="font-bold">{filteredMeters.length}</span> compteurs
              </div>
              
              {/* Page Controls */}
              <div className="flex items-center gap-2">
                {/* First Page */}
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    currentPage === 1
                      ? "text-water-300 cursor-not-allowed"
                      : "text-water-600 hover:bg-water-100"
                  )}
                  title="Première page"
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>
                
                {/* Previous Page */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    currentPage === 1
                      ? "text-water-300 cursor-not-allowed"
                      : "text-water-600 hover:bg-water-100"
                  )}
                  title="Page précédente"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, idx, array) => {
                      // Add ellipsis
                      const prevPage = array[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-2 text-water-400 font-mono text-sm">...</span>
                          )}
                          <button
                            onClick={() => goToPage(page)}
                            className={cn(
                              "w-10 h-10 rounded-lg font-mono text-sm font-bold transition-all",
                              currentPage === page
                                ? "bg-water-600 text-white shadow-lg shadow-water-600/20"
                                : "text-water-600 hover:bg-water-100"
                            )}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>
                
                {/* Next Page */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    currentPage === totalPages
                      ? "text-water-300 cursor-not-allowed"
                      : "text-water-600 hover:bg-water-100"
                  )}
                  title="Page suivante"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Last Page */}
                <button
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    currentPage === totalPages
                      ? "text-water-300 cursor-not-allowed"
                      : "text-water-600 hover:bg-water-100"
                  )}
                  title="Dernière page"
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingMeter && (
        <div className="fixed inset-0 bg-water-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg p-8 rounded-3xl shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center border-b border-water-100 pb-4">
              <h3 className="font-serif italic text-2xl font-bold text-water-900">Modifier Compteur</h3>
              <button onClick={() => setEditingMeter(null)} className="p-2 hover:bg-water-100 rounded-full transition-all">
                <X className="w-5 h-5 text-water-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Numéro de Série (Max 18)</label>
                <input 
                  type="text" 
                  maxLength={18}
                  className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                  value={editSN}
                  onChange={(e) => setEditSN(e.target.value.toUpperCase())}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Marque</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Modèle</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Diamètre</label>
                  <select 
                    className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                    value={editDiameter}
                    onChange={(e) => setEditDiameter(e.target.value)}
                  >
                    {AVAILABLE_DIAMETERS.map(dn => (
                      <option key={dn} value={dn}>{dn}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Année</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                    value={editYear}
                    onChange={(e) => setEditYear(parseInt(e.target.value) || 2024)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Type de Compteur</label>
                <select 
                  className="w-full bg-white/50 border border-water-200 p-3 font-mono text-sm uppercase focus:outline-none rounded-xl"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as MeterType)}
                >
                  <option value="Volumétrique">Volumétrique</option>
                  <option value="Vitesse">Vitesse</option>
                  <option value="Électromagnétique">Électromagnétique</option>
                  <option value="Ultrasons">Ultrasons</option>
                </select>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 font-mono uppercase leading-relaxed">
                  Attention : La modification du numéro de série mettra à jour tous les mouvements associés dans l'historique.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setEditingMeter(null)}
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
    </div>
  );
};

export default Inventory;
