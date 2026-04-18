import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Meter, Movement, StockState, MeterStatus, MovementType, MeterType, Threshold, AppLocation, LocationType } from '../types';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface StockContextType extends StockState {
  isLoading: boolean;
  addMeter: (meter: Meter) => void;
  transferMeters: (ids: string[], from: string, to: string, date?: string) => void;
  recordPose: (id: string, location: string, clientInfo?: Movement['clientInfo'], diameter?: string, type?: MeterType) => void;
  recordReplacement: (newId: string, oldId: string | null, location: string, clientInfo?: Movement['clientInfo'], diameter?: string, type?: MeterType, oldMeterSN?: string) => void;
  recordSale: (id: string, location: string, clientInfo?: Movement['clientInfo'], diameter?: string, type?: MeterType) => void;
  updateMeter: (id: string, updatedMeter: Partial<Meter>) => void;
  updateMovement: (id: string, updatedMovement: Partial<Movement>) => void;
  receiveStock: (quantity: number, diameter: string, type: MeterType, date: string, location: string, brand: string, model: string, year: number, serialNumber?: string, orderInfo?: Movement['orderInfo']) => void;
  updateThreshold: (diameter: string, type: MeterType, minQuantity: number) => void;
  addLocation: (location: AppLocation) => void;
  editLocation: (oldName: string, updatedLocation: AppLocation) => void;
  lowStockAlerts: { diameter: string; type: MeterType; current: number; min: number }[];
}

const StockContext = createContext<StockContextType | undefined>(undefined);

const INITIAL_LOCATIONS: AppLocation[] = [
  { name: 'Agence Commerciale', type: 'Agence' },
  { name: 'Antenne Nord', type: 'Antenne', parentAgency: 'Agence Commerciale' },
  { name: 'Antenne Sud', type: 'Antenne', parentAgency: 'Agence Commerciale' },
  { name: 'Antenne Est', type: 'Antenne', parentAgency: 'Agence Commerciale' },
  { name: 'Antenne Ouest', type: 'Antenne', parentAgency: 'Agence Commerciale' },
];

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StockState>(() => ({
    meters: [],
    movements: [],
    locations: [],
    thresholds: [],
  }));
  const [isLoading, setIsLoading] = useState(true);

  // Load data from SQL Server on startup
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Loading data from SQL Server...');
        
        const [locationsRes, metersRes, movementsRes, thresholdsRes] = await Promise.all([
          fetch(`${API_URL}/locations`),
          fetch(`${API_URL}/meters`),
          fetch(`${API_URL}/movements`),
          fetch(`${API_URL}/thresholds`),
        ]);

        // Vérifier si les réponses sont OK
        if (!locationsRes.ok || !metersRes.ok || !movementsRes.ok || !thresholdsRes.ok) {
          console.error('❌ One or more API requests failed');
          console.log('Locations:', locationsRes.status, metersRes.status, movementsRes.status, thresholdsRes.status);
          throw new Error('API request failed');
        }

        const locations = await locationsRes.json();
        const meters = await metersRes.json();
        const movements = await movementsRes.json();
        const thresholds = await thresholdsRes.json();

        // Garantir que tous les tableaux sont bien des tableaux
        setState({
          meters: Array.isArray(meters) ? meters : [],
          movements: Array.isArray(movements) ? movements : [],
          locations: Array.isArray(locations) ? locations.map((l: any) => ({
            name: l.name,
            type: l.type as LocationType,
            parentAgency: l.parentAgency
          })) : [],
          thresholds: Array.isArray(thresholds) ? thresholds : [],
        });

        console.log('✅ Data loaded from SQL Server successfully');
        console.log(`  - Locations: ${Array.isArray(locations) ? locations.length : 0}`);
        console.log(`  - Meters: ${Array.isArray(meters) ? meters.length : 0}`);
        console.log(`  - Movements: ${Array.isArray(movements) ? movements.length : 0}`);
        console.log(`  - Thresholds: ${Array.isArray(thresholds) ? thresholds.length : 0}`);
      } catch (error) {
        console.error('❌ Failed to load data from SQL Server:', error);
        // Fallback to localStorage if API fails
        const saved = localStorage.getItem('water_meter_stock');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setState({
              meters: Array.isArray(parsed.meters) ? parsed.meters : [],
              movements: Array.isArray(parsed.movements) ? parsed.movements : [],
              locations: Array.isArray(parsed.locations) ? parsed.locations : [],
              thresholds: Array.isArray(parsed.thresholds) ? parsed.thresholds : [],
            });
          } catch (e) {
            console.error('❌ Failed to parse localStorage data:', e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('water_meter_stock', JSON.stringify(state));
  }, [state]);

  const addMovement = async (type: MovementType, source: string, destination: string, serialNumber: string, details?: string, clientInfo?: Movement['clientInfo'], orderInfo?: Movement['orderInfo'], meterId?: string, diameter?: string, date?: string, brand?: string, model?: string) => {
    const newMovement: Movement = {
      id: crypto.randomUUID(),
      meterId,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      type,
      source,
      destination,
      serialNumber,
      diameter,
      brand,
      model,
      details,
      clientInfo,
      orderInfo,
    };

    try {
      await fetch(`${API_URL}/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovement),
      });
    } catch (error) {
      console.error('Failed to save movement to database:', error);
    }

    setState(prev => ({
      ...prev,
      movements: [newMovement, ...(prev.movements || [])],
    }));
  };

  const updateMeterStatus = async (id: string, status: MeterStatus, location: string, diameter?: string, type?: MeterType, serialNumber?: string, date?: string, brand?: string, model?: string, year?: number) => {
    const updateDate = date ? new Date(date).toISOString() : new Date().toISOString();
    
    // 1. Persist to API
    try {
      const payload: Partial<Meter> = { 
        status, 
        location, 
        lastUpdate: updateDate 
      };
      
      if (diameter) payload.diameter = diameter;
      if (type) payload.type = type;
      if (serialNumber) payload.serialNumber = serialNumber;
      if (brand) payload.brand = brand;
      if (model) payload.model = model;
      if (year) payload.year = year;

      await fetch(`${API_URL}/meters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('❌ Failed to persist meter status update:', error);
    }

    // 2. Update local state
    setState(prev => {
      const exists = prev.meters.some(m => m.id === id);
      
      if (!exists) {
        const newMeter: Meter = {
          id,
          serialNumber: serialNumber || '',
          diameter: diameter || 'DN15',
          type: type || 'Volumétrique',
          brand: brand || 'Itron',
          model: model || 'Aquadis+',
          year: year || new Date().getFullYear(),
          status,
          location,
          lastUpdate: updateDate
        };
        return {
          ...prev,
          meters: [...prev.meters, newMeter]
        };
      }

      return {
        ...prev,
        meters: prev.meters.map(m => 
          m.id === id 
            ? { 
                ...m, 
                status, 
                location, 
                lastUpdate: updateDate, 
                diameter: diameter || m.diameter, 
                type: type || m.type, 
                serialNumber: serialNumber !== undefined ? serialNumber : m.serialNumber,
                brand: brand || m.brand,
                model: model || m.model,
                year: year || m.year
              } 
            : m
        ),
      };
    });
  };

  const addMeter = async (meter: Meter) => {
    try {
      const response = await fetch(`${API_URL}/meters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meter),
      });

      if (!response.ok) {
        const error = await response.json();
        console.warn(error.error);
        return;
      }
    } catch (error) {
      console.error('Failed to save meter to database:', error);
      return;
    }

    setState(prev => {
      if (prev.meters.some(m => m.serialNumber === meter.serialNumber)) {
        console.warn(`Meter with serial number ${meter.serialNumber} already exists.`);
        return prev;
      }
      return {
        ...prev,
        meters: [...prev.meters, meter],
      };
    });
  };

  const transferMeters = async (ids: string[], from: string, to: string, date?: string) => {
    const movementDate = date ? new Date(date).toISOString() : new Date().toISOString();
    
    // Update meters in database
    for (const id of ids) {
      try {
        await fetch(`${API_URL}/meters/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: to }),
        });
      } catch (error) {
        console.error('Failed to update meter location:', error);
      }
    }

    setState(prev => {
      const newMeters = prev.meters.map(m => 
        ids.includes(m.id) 
          ? { ...m, location: to, lastUpdate: movementDate } 
          : m
      );
      const newMovements = ids.map(id => {
        const meter = prev.meters.find(m => m.id === id);
        return {
          id: crypto.randomUUID(),
          meterId: id,
          date: movementDate,
          type: 'Transfert' as MovementType,
          source: from,
          destination: to,
          serialNumber: meter?.serialNumber || 'SANS S/N',
          diameter: meter?.diameter,
          brand: meter?.brand,
          model: meter?.model,
        };
      });

      // Persist transfer movements to database
      newMovements.forEach(mov => {
        fetch(`${API_URL}/movements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mov),
        }).catch(err => console.error('Failed to save transfer movement:', err));
      });

      return {
        ...prev,
        meters: newMeters,
        movements: [...newMovements, ...(prev.movements || [])],
      };
    });
  };

  const recordPose = async (id: string, location: string, clientInfo?: Movement['clientInfo'], diameter?: string, type?: MeterType) => {
    const meter = state.meters.find(m => m.id === id);
    const date = clientInfo?.realizationDate;
    await updateMeterStatus(id, 'Installé', location, diameter, type, undefined, date, meter?.brand, meter?.model, meter?.year);
    addMovement('Pose', location, 'Client', meter?.serialNumber || 'SANS S/N', undefined, clientInfo, undefined, id, diameter || meter?.diameter, date, meter?.brand, meter?.model);
  };

  const recordReplacement = async (newId: string, oldId: string | null, location: string, clientInfo?: Movement['clientInfo'], diameter?: string, type?: MeterType, oldMeterSN?: string) => {
    const newMeter = state.meters.find(m => m.id === newId);
    const oldMeter = oldId ? state.meters.find(m => m.id === oldId) : null;
    const date = clientInfo?.realizationDate;
    
    await updateMeterStatus(newId, 'Installé', location, diameter, type, undefined, date, newMeter?.brand, newMeter?.model, newMeter?.year);
    addMovement('Remplacement', location, 'Client', newMeter?.serialNumber || 'SANS S/N', `Remplace ${oldMeter?.serialNumber || oldMeterSN || 'INCONNU'}`, clientInfo, undefined, newId, diameter || newMeter?.diameter, date, newMeter?.brand, newMeter?.model);
    
    if (oldId) {
      await updateMeterStatus(oldId, 'À l\'arrêt', location, undefined, undefined, undefined, date, oldMeter?.brand, oldMeter?.model, oldMeter?.year);
      addMovement('Remplacement', 'Client', location, oldMeter?.serialNumber || oldMeterSN || 'SANS S/N', `Remplacé par ${newMeter?.serialNumber || 'SANS S/N'}`, clientInfo, undefined, oldId, oldMeter?.diameter, date, oldMeter?.brand, oldMeter?.model);
    }
  };

  const recordSale = async (id: string, location: string, clientInfo?: Movement['clientInfo'], diameter?: string, type?: MeterType) => {
    const meter = state.meters.find(m => m.id === id);
    const date = clientInfo?.realizationDate;
    await updateMeterStatus(id, 'Vendu', location, diameter, type, undefined, undefined, meter?.brand, meter?.model, meter?.year);
    addMovement('Vente', location, 'Client Tiers', meter?.serialNumber || 'SANS S/N', undefined, clientInfo, undefined, id, diameter || meter?.diameter, date, meter?.brand, meter?.model);
  };

  const updateMeter = async (id: string, updatedMeter: Partial<Meter>) => {
    try {
      await fetch(`${API_URL}/meters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMeter),
      });
    } catch (error) {
      console.error('Failed to update meter in database:', error);
    }

    setState(prev => {
      const oldMeter = prev.meters.find(m => m.id === id);
      
      // Check for SN uniqueness if being updated
      if (updatedMeter.serialNumber && updatedMeter.serialNumber !== oldMeter?.serialNumber) {
        const alreadyExists = prev.meters.some(m => m.serialNumber === updatedMeter.serialNumber && m.id !== id);
        if (alreadyExists) {
          console.warn(`Serial number ${updatedMeter.serialNumber} already exists. Update aborted.`);
          return prev;
        }
      }

      return {
        ...prev,
        meters: prev.meters.map(m => 
          m.id === id ? { ...m, ...updatedMeter, lastUpdate: new Date().toISOString() } : m
        ),
        // If serial number changed, update it in all movements too
        movements: updatedMeter.serialNumber && oldMeter
          ? prev.movements.map(mov => mov.serialNumber === oldMeter.serialNumber ? { ...mov, serialNumber: updatedMeter.serialNumber! } : mov)
          : prev.movements
      };
    });
  };

  const updateMovement = async (id: string, updatedMovement: Partial<Movement>) => {
    try {
      await fetch(`${API_URL}/movements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMovement),
      });
    } catch (error) {
      console.error('Failed to update movement in database:', error);
    }

    setState(prev => ({
      ...prev,
      movements: (prev.movements || []).map(m => 
        m.id === id ? { ...m, ...updatedMovement } : m
      ),
    }));
  };

  const receiveStock = async (quantity: number, diameter: string, type: MeterType, date: string, location: string, brand: string, model: string, year: number, serialNumber?: string, orderInfo?: Movement['orderInfo']) => {
    const newMeters: Meter[] = [];
    const now = Date.now();
    
    for (let i = 0; i < quantity; i++) {
      let generatedSN = '';
      if (quantity === 1 && serialNumber) {
        generatedSN = serialNumber;
      } else if (serialNumber) {
        generatedSN = `${serialNumber}-${i + 1}`;
      } else {
        // Génération d'un SN unique pour les lots sans numéro de série
        generatedSN = `SANS-SN-${now.toString().slice(-6)}-${Math.random().toString(36).substr(2, 4)}-${i + 1}`;
      }
      
      const newMeter: Meter = {
        id: crypto.randomUUID(),
        serialNumber: generatedSN,
        diameter,
        type,
        brand,
        model,
        year,
        status: 'Neuf',
        location,
        lastUpdate: new Date(date).toISOString(),
      };

      newMeters.push(newMeter);
    }

    if (newMeters.length === 0) return;

    try {
      if (quantity > 50) {
        Swal.fire({
          title: 'Enregistrement en cours...',
          text: `Veuillez patienter pendant l'import de ${quantity} compteurs dans la base de données.`,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
      }

      // 1. Sauvegarde groupée des compteurs
      const metersResponse = await fetch(`${API_URL}/meters/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meters: newMeters }),
      });

      if (!metersResponse.ok) {
        const errorData = await metersResponse.json();
        throw new Error(errorData.details || 'Erreur lors de la sauvegarde groupée');
      }

      // 2. Création du mouvement de réception
      const receptionMovement: Movement = {
        id: crypto.randomUUID(),
        date: new Date(date).toISOString(),
        type: 'Réception',
        source: 'Fournisseur',
        destination: location,
        serialNumber: quantity === 1 && serialNumber ? serialNumber : `LOT DE ${newMeters.length} (${diameter})`,
        diameter,
        brand,
        model,
        details: `Réception de ${newMeters.length} compteurs ${type}`,
        orderInfo,
      };

      await fetch(`${API_URL}/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receptionMovement),
      });

      // 3. Mise à jour du state local SEULEMENT en cas de succès BDD
      setState(prev => ({
        ...prev,
        meters: [...prev.meters, ...newMeters],
        movements: [receptionMovement, ...(prev.movements || [])],
      }));

      if (quantity > 50) {
        Swal.close();
      }
      
    } catch (error: any) {
      console.error('❌ Failed to complete stock reception:', error);
      Swal.fire({
        icon: 'error',
        title: 'Échec de l\'enregistrement',
        text: error.message || 'Une erreur est survenue lors de la sauvegarde dans la base de données.',
        confirmButtonColor: '#108bdd',
      });
    }
  };

  const lowStockAlerts = useMemo(() => {
    if (!state.thresholds) return [];
    
    return state.thresholds.map(threshold => {
      const currentStock = state.meters.filter(m => 
        m.diameter === threshold.diameter && 
        m.type === threshold.type && 
        m.status === 'Neuf'
      ).length;
      
      return {
        diameter: threshold.diameter,
        type: threshold.type,
        current: currentStock,
        min: threshold.minQuantity
      };
    }).filter(alert => alert.current < alert.min);
  }, [state.meters, state.thresholds]);

  const updateThreshold = async (diameter: string, type: MeterType, minQuantity: number) => {
    // Persist to database
    try {
      await fetch(`${API_URL}/thresholds`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diameter, type, minQuantity }),
      });
    } catch (error) {
      console.error('Failed to save threshold to database:', error);
    }

    setState(prev => {
      const existingThresholds = prev.thresholds || [];
      const index = existingThresholds.findIndex(t => t.diameter === diameter && t.type === type);
      
      let newThresholds;
      if (index > -1) {
        newThresholds = existingThresholds.map((t, i) => i === index ? { ...t, minQuantity } : t);
      } else {
        newThresholds = [...existingThresholds, { diameter, type, minQuantity }];
      }
      
      return { ...prev, thresholds: newThresholds };
    });
  };

  const addLocation = async (location: AppLocation) => {
    try {
      const response = await fetch(`${API_URL}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to add location:', error);
        return;
      }

      console.log('✅ Location saved to database:', location.name);
    } catch (error) {
      console.error('Failed to save location to database:', error);
      return;
    }

    setState(prev => {
      if (prev.locations.some(l => l.name === location.name)) return prev;
      return { ...prev, locations: [...prev.locations, location] };
    });
  };

  const editLocation = async (oldName: string, updatedLocation: AppLocation) => {
    try {
      const response = await fetch(`${API_URL}/locations/${encodeURIComponent(oldName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLocation),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to update location:', error);
        return;
      }

      console.log('✅ Location updated in database:', updatedLocation.name);
    } catch (error) {
      console.error('Failed to update location in database:', error);
      return;
    }

    setState(prev => {
      const exists = prev.locations.find(l => l.name === oldName);
      if (!exists || (updatedLocation.name !== oldName && prev.locations.some(l => l.name === updatedLocation.name))) return prev;
      
      return {
        ...prev,
        locations: prev.locations.map(l => l.name === oldName ? updatedLocation : l),
        meters: prev.meters.map(m => m.location === oldName ? { ...m, location: updatedLocation.name } : m),
        movements: prev.movements.map(mov => {
          let updatedMov = { ...mov };
          if (mov.source === oldName) updatedMov.source = updatedLocation.name;
          if (mov.destination === oldName) updatedMov.destination = updatedLocation.name;
          return updatedMov;
        })
      };
    });
  };

  const value = useMemo(() => ({
    ...state,
    isLoading,
    addMeter,
    transferMeters,
    recordPose,
    recordReplacement,
    recordSale,
    updateMeter,
    updateMovement,
    receiveStock,
    updateThreshold,
    addLocation,
    editLocation,
    lowStockAlerts,
  }), [state, isLoading, lowStockAlerts]);

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};
