import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { MapPin, Plus, Edit2, Check, X, AlertCircle, Building2, Radio } from 'lucide-react';
import { cn } from '../lib/utils';
import { LocationType } from '../types';
import Swal from 'sweetalert2';

const Settings: React.FC = () => {
  const { locations, meters, addLocation, editLocation } = useStock();
  
  // Add Location State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationType, setNewLocationType] = useState<LocationType>('Agence');
  const [newParentAgency, setNewParentAgency] = useState<string>('');
  
  // Edit Location State
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<LocationType>('Agence');
  const [editParentAgency, setEditParentAgency] = useState<string>('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) {
      setError('Le nom de la localisation est requis.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (locations.some(l => l.name.toLowerCase() === newLocationName.trim().toLowerCase())) {
      setError('Cette localisation existe déjà.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (newLocationType === 'Antenne' && !newParentAgency) {
      setError('Veuillez sélectionner une agence de rattachement pour l\'antenne.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    // SweetAlert2 - Demande de confirmation avant ajout
    const confirmResult = await Swal.fire({
      icon: 'question',
      title: 'Confirmer l\'ajout',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="margin-bottom: 15px; color: #374151; font-size: 14px;">
            Voulez-vous vraiment ajouter cette localisation ?
          </p>
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px;">
            <p style="color: #6b7280; font-size: 13px; margin: 8px 0;">
              <strong style="color: #0891b2;">📍 Nom:</strong> ${newLocationName.trim()}
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 8px 0;">
              <strong style="color: #0891b2;">🏷️ Type:</strong> ${newLocationType}
            </p>
            ${newLocationType === 'Antenne' && newParentAgency ? `
            <p style="color: #6b7280; font-size: 13px; margin: 8px 0;">
              <strong style="color: #0891b2;">🏢 Agence de rattachement:</strong> ${newParentAgency}
            </p>
            ` : ''}
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✓ Oui, ajouter',
      cancelButtonText: '✕ Annuler',
      confirmButtonColor: '#0891b2',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    try {
      await addLocation({
        name: newLocationName.trim(),
        type: newLocationType,
        parentAgency: newLocationType === 'Antenne' ? newParentAgency : undefined
      });

      // SweetAlert2 - Message de succès professionnel
      Swal.fire({
        icon: 'success',
        title: 'Opération Réussie',
        html: `
          <div style="text-align: center; padding: 10px;">
            <p style="color: #374151; font-size: 14px;">
              La localisation <strong style="color: #0891b2;">"${newLocationName.trim()}"</strong> a été ajoutée avec succès.
            </p>
          </div>
        `,
        confirmButtonText: 'Parfait',
        confirmButtonColor: '#0891b2',
        timer: 3000,
        timerProgressBar: true,
      });
      
      setNewLocationName('');
      setNewLocationType('Agence');
      setNewParentAgency('');
      setShowAddForm(false);
    } catch (error) {
      // SweetAlert2 - Message d'erreur professionnel
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur est survenue lors de l\'ajout de la localisation. Veuillez réessayer.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  const handleEditLocation = async (oldName: string) => {
    if (!editName.trim()) {
      setError('Le nom ne peut pas être vide.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (editName.trim() !== oldName && locations.some(l => l.name.toLowerCase() === editName.trim().toLowerCase())) {
      setError('Ce nom est déjà utilisé.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (editType === 'Antenne' && !editParentAgency) {
      setError('Veuillez sélectionner une agence de rattachement.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    // SweetAlert2 - Demande de confirmation avant modification
    const confirmResult = await Swal.fire({
      icon: 'question',
      title: 'Confirmer la modification',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="margin-bottom: 15px; color: #374151; font-size: 14px;">
            Voulez-vous vraiment modifier cette localisation ?
          </p>
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px;">
            <p style="color: #6b7280; font-size: 13px; margin: 8px 0;">
              <strong style="color: #9ca3af;">Ancien nom:</strong> <span style="text-decoration: line-through;">${oldName}</span>
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 8px 0;">
              <strong style="color: #0891b2;">Nouveau nom:</strong> ${editName.trim()}
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 8px 0;">
              <strong style="color: #0891b2;">Type:</strong> ${editType}
            </p>
            ${editType === 'Antenne' && editParentAgency ? `
            <p style="color: #6b7280; font-size: 13px; margin: 8px 0;">
              <strong style="color: #0891b2;">Agence de rattachement:</strong> ${editParentAgency}
            </p>
            ` : ''}
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✓ Oui, modifier',
      cancelButtonText: '✕ Annuler',
      confirmButtonColor: '#0891b2',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    try {
      await editLocation(oldName, {
        name: editName.trim(),
        type: editType,
        parentAgency: editType === 'Antenne' ? editParentAgency : undefined
      });

      // SweetAlert2 - Message de succès professionnel pour modification
      Swal.fire({
        icon: 'success',
        title: 'Opération Réussie',
        html: `
          <div style="text-align: center; padding: 10px;">
            <p style="color: #374151; font-size: 14px;">
              La localisation a été modifiée avec succès.
            </p>
          </div>
        `,
        confirmButtonText: 'Parfait',
        confirmButtonColor: '#0891b2',
        timer: 3000,
        timerProgressBar: true,
      });
      
      setEditingLocation(null);
    } catch (error) {
      // SweetAlert2 - Message d'erreur professionnel
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur est survenue lors de la modification de la localisation. Veuillez réessayer.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  const agencies = locations.filter(l => l.type === 'Agence');

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="border-b border-water-200 pb-6">
        <h2 className="text-4xl font-serif italic font-bold tracking-tight text-water-900">Paramètres</h2>
        <p className="font-mono text-xs uppercase tracking-widest text-water-500 mt-2">Gestion des agences et antennes</p>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Add Location Section */}
        <div className="glass-card p-8 space-y-6 rounded-3xl">
          <div className="flex items-center justify-between border-b border-water-100 pb-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-water-600" />
              <h3 className="font-serif italic text-xl font-bold text-water-900">Ajouter une Localisation</h3>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={cn(
                "px-4 py-2 font-mono text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2",
                showAddForm
                  ? "bg-water-100 text-water-600"
                  : "bg-water-600 text-white hover:bg-water-700 shadow-lg shadow-water-600/20"
              )}
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? 'Annuler' : 'Ajouter'}
            </button>
          </div>

          {showAddForm && (
            <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Nom de la Localisation *</label>
                <input
                  type="text"
                  placeholder="EX: AGENCE COMMERCIALE OU ANTENNE NORD..."
                  className="w-full bg-white/50 border border-water-200 p-4 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-water-500/20 rounded-xl"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Type de Localisation *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setNewLocationType('Agence')}
                    className={cn(
                      "p-4 border-2 rounded-xl transition-all flex items-center gap-3",
                      newLocationType === 'Agence'
                        ? "border-water-600 bg-water-50 text-water-700"
                        : "border-water-200 hover:border-water-300"
                    )}
                  >
                    <Building2 className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-mono text-xs uppercase font-bold">Agence</div>
                      <div className="text-[9px] text-water-500">Siège principal</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setNewLocationType('Antenne')}
                    className={cn(
                      "p-4 border-2 rounded-xl transition-all flex items-center gap-3",
                      newLocationType === 'Antenne'
                        ? "border-water-600 bg-water-50 text-water-700"
                        : "border-water-200 hover:border-water-300"
                    )}
                  >
                    <Radio className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-mono text-xs uppercase font-bold">Antenne</div>
                      <div className="text-[9px] text-water-500">Rattachée à une agence</div>
                    </div>
                  </button>
                </div>
              </div>

              {newLocationType === 'Antenne' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="font-mono text-[10px] uppercase text-water-500 font-bold">Agence de Rattachement *</label>
                  <select
                    className="w-full bg-white/50 border border-water-200 p-4 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-water-500/20 rounded-xl"
                    value={newParentAgency}
                    onChange={(e) => setNewParentAgency(e.target.value)}
                  >
                    <option value="">SÉLECTIONNER UNE AGENCE...</option>
                    {agencies.map(agency => (
                      <option key={agency.name} value={agency.name}>{agency.name}</option>
                    ))}
                  </select>
                  {agencies.length === 0 && (
                    <p className="text-[10px] text-amber-600 font-mono flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" />
                      Vous devez d'abord créer une agence avant de créer une antenne.
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleAddLocation}
                disabled={!newLocationName.trim() || (newLocationType === 'Antenne' && !newParentAgency)}
                className={cn(
                  "w-full py-4 font-mono uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 rounded-xl shadow-lg",
                  newLocationName.trim() && (newLocationType !== 'Antenne' || newParentAgency)
                    ? "bg-water-600 text-white hover:bg-water-700 shadow-water-600/20"
                    : "bg-water-100 text-water-300 cursor-not-allowed shadow-none"
                )}
              >
                <Plus className="w-5 h-5" />
                Ajouter la Localisation
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-mono text-xs uppercase animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-mono text-xs uppercase animate-in slide-in-from-top-2">
            <Check className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Locations List */}
        <div className="glass-card p-8 space-y-6 rounded-3xl">
          <div className="flex items-center justify-between border-b border-water-100 pb-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-water-600" />
              <h3 className="font-serif italic text-xl font-bold text-water-900">Localisations Existantes</h3>
            </div>
            <span className="font-mono text-xs bg-water-100 text-water-600 px-3 py-1 rounded-full">
              {locations.length} total
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-water-100 bg-white/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-water-50/50 border-b border-water-100">
                  <th className="py-4 px-6 font-mono text-[10px] uppercase text-water-500 font-bold w-1/2">Agence</th>
                  <th className="py-4 px-6 font-mono text-[10px] uppercase text-water-500 font-bold w-1/2 border-l border-water-100">Antennes Rattachées</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-water-100">
                {agencies.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-10 text-center">
                      <MapPin className="w-12 h-12 mx-auto text-water-300 mb-3" />
                      <p className="font-mono text-xs uppercase text-water-400">Aucune localisation configurée</p>
                      <p className="font-mono text-[10px] text-water-300 mt-1">Cliquez sur "Ajouter" pour commencer</p>
                    </td>
                  </tr>
                ) : (
                  agencies.sort((a, b) => a.name.localeCompare(b.name)).map((agency) => (
                    <tr key={agency.name} className="hover:bg-white/60 transition-all group/agency">
                      <td className="py-4 px-6 align-top border-r border-water-100">
                        {editingLocation === agency.name ? (
                          <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
                            <input 
                              type="text" 
                              className="w-full bg-white border border-water-200 p-2 font-mono text-sm uppercase focus:outline-none rounded-lg"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              autoFocus
                            />
                            <button 
                              onClick={() => handleEditLocation(agency.name)}
                              className="p-2 bg-water-600 text-white rounded-lg hover:bg-water-700 shrink-0"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setEditingLocation(null)}
                              className="p-2 bg-water-100 text-water-400 rounded-lg hover:bg-water-200 shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Building2 className="w-5 h-5 text-water-600" />
                              <span className="font-mono text-sm uppercase text-water-900 font-bold">{agency.name}</span>
                              <span className={cn(
                                "ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border",
                                meters.filter(m => m.location === agency.name && m.status === 'Neuf').length > 0 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                                  : "bg-slate-50 text-slate-400 border-slate-200"
                              )}>
                                STOCK: {meters.filter(m => m.location === agency.name && m.status === 'Neuf').length}
                              </span>
                            </div>
                            <button 
                              onClick={() => {
                                setEditingLocation(agency.name);
                                setEditName(agency.name);
                                setEditType(agency.type);
                                setEditParentAgency(agency.parentAgency || '');
                              }}
                              className="p-2 text-water-300 hover:text-water-600 hover:bg-water-50 rounded-lg transition-all opacity-0 group-hover/agency:opacity-100"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 align-top">
                        <div className="space-y-1">
                          {locations.filter(l => l.type === 'Antenne' && l.parentAgency === agency.name).length === 0 ? (
                            <div className="text-[10px] uppercase text-water-400 font-mono py-2">
                              Aucune antenne rattachée
                            </div>
                          ) : (
                            locations.filter(l => l.type === 'Antenne' && l.parentAgency === agency.name)
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map(antenne => (
                                <div key={antenne.name} className="flex items-center justify-between p-2 hover:bg-white/80 rounded-lg group/antenne transition-all">
                                  {editingLocation === antenne.name ? (
                                    <div className="w-full flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
                                      <input 
                                        type="text" 
                                        className="w-full bg-white border border-water-200 p-1.5 font-mono text-xs uppercase focus:outline-none rounded-md"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        autoFocus
                                      />
                                      <button 
                                        onClick={() => handleEditLocation(antenne.name)}
                                        className="p-1.5 bg-water-600 text-white rounded-md hover:bg-water-700 shrink-0"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => setEditingLocation(null)}
                                        className="p-1.5 bg-water-100 text-water-400 rounded-md hover:bg-water-200 shrink-0"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <Radio className="w-4 h-4 text-water-400" />
                                        <span className="font-mono text-xs uppercase text-water-700">{antenne.name}</span>
                                        <span className={cn(
                                          "ml-1 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border",
                                          meters.filter(m => m.location === antenne.name && m.status === 'Neuf').length > 0 
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                            : "bg-slate-50 text-slate-400 border-slate-100"
                                        )}>
                                          STOCK: {meters.filter(m => m.location === antenne.name && m.status === 'Neuf').length}
                                        </span>
                                      </div>
                                      <button 
                                        onClick={() => {
                                          setEditingLocation(antenne.name);
                                          setEditName(antenne.name);
                                          setEditType(antenne.type);
                                          setEditParentAgency(antenne.parentAgency || '');
                                        }}
                                        className="p-1.5 text-water-300 hover:text-water-600 hover:bg-water-100 rounded-md transition-all opacity-0 group-hover/antenne:opacity-100"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              ))
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 bg-cyan-50 border border-cyan-100 rounded-3xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-cyan-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-serif italic font-bold text-cyan-900">Note de Cohérence</h4>
            <p className="font-mono text-[10px] uppercase text-cyan-800 leading-relaxed">
              La modification du nom d'une unité mettra automatiquement à jour tous les compteurs et l'historique des mouvements associés à cette unité pour maintenir l'intégrité de vos rapports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
