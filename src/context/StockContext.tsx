import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Meter, Movement, StockState, MeterStatus, MovementType, MeterType, Threshold, AppLocation, LocationType } from '../types';

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
  receiveStock: (quantity: number, diameter: string, type: MeterType, date: string, location: string, serialNumber?: string, orderInfo?: Movement['orderInfo']) => void;
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

  const addMovement = async (type: MovementType, source: string, destination: string, serialNumber: string, details?: string, clientInfo?: Movement['clientInfo'], orderInfo?: Movement['orderInfo'], meterId?: string, diameter?: string, date?: string) => {
    const newMovement: Movement = {
      id: Math.random().toString(36).substr(2, 9),
      meterId,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      type,
      source,
      destination,
      serialNumber,
      diameter,
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

  const updateMeterStatus = (id: string, status: MeterStatus, location: string, diameter?: string, type?: MeterType, serialNumber?: string, date?: string) => {
    setState(prev => {
      const exists = prev.meters.some(m => m.id === id);
      const updateDate = date ? new Date(date).toISOString() : new Date().toISOString();
      
      // Check for uniqueness if creating or updating SN
      if (serialNumber) {
        const alreadyExists = prev.meters.some(m => m.serialNumber === serialNumber && m.id !== id);
        if (alreadyExists) {
          console.warn(`Serial number ${serialNumber} already exists. Status update restricted.`);
          // We can still update status, but we don't change the SN if it creates a collision
          serialNumber = undefined; 
        }
      }

      if (!exists) {
        const newMeter: Meter = {
          id,
          serialNumber: serialNumber || '',
          diameter: diameter || 'DN15',
          type: type || 'Volumétrique',
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
            ? { ...m, status, location, lastUpdate: updateDate, diameter: diameter || m.diameter, type: type || m.type, serialNumber: serialNumber !== undefined ? serialNumber : m.serialNumber } 
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
          id: Math.random().toString(36).substr(2, 9),
          meterId: id,
          date: movementDate,
          type: 'Transfert' as MovementType,
          source: from,
          destination: to,
          serialNumber: meter?.serialNumber || 'SANS S/N',
          diameter: meter?.diameter,
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

  const recordPose = (id: string, location: string, clientInfo?: Movement['clientInfo'], diameter?: string, type?: MeterType) => {
    const meter = state.meters.find(m => m.id === id);
    const date = clientInfo?.realizationDate;
    updateMeterStatus(id, 'Installé', location, diameter, type, undefined, date);
    addMovement('Pose', location, 'Client', meter?.serialNumber || 'SANS S/N', undefined, clientInfo, undefined, id, diameter || meter?.diameter, date);
  };

  const recordReplacement = (newId: string, oldId: string | null, location: string, clientInfo?: Movement['clientInfo'], diameter?: string, type?: MeterType, oldMeterSN?: string) => {
    const newMeter = state.meters.find(m => m.id === newId);
    const oldMeter = oldId ? state.meters.find(m => m.id === oldId) : null;
    const date = clientInfo?.realizationDate;
    updateMeterStatus(newId, 'Installé', location, diameter, type, undefined, date);
    addMovement('Remplacement', location, 'Client', newMeter?.serialNumber || 'SANS S/N', `Remplace ${oldMeter?.serialNumber || oldMeterSN || 'INCONNU'}`, clientInfo, undefined, newId, diameter || newMeter?.diameter, date);
    
    if (oldId) {
      updateMeterStatus(oldId, 'À l\'arrêt', location, undefined, undefined, undefined, date);
      addMovement('Remplacement', 'Client', location, oldMeter?.serialNumber || oldMeterSN || 'SANS S/N', `Remplacé par ${newMeter?.serialNumber || 'SANS S/N'}`, clientInfo, undefined, oldId, oldMeter?.diameter, date);
    }
  };

  const recordSale = (id: string, location: string, clientInfo?: Movement['clientInfo'], diameter?: string, type?: MeterType) => {
    const meter = state.meters.find(m => m.id === id);
    const date = clientInfo?.realizationDate;
    updateMeterStatus(id, 'Vendu', location, diameter, type);
    addMovement('Vente', location, 'Client Tiers', meter?.serialNumber || 'SANS S/N', undefined, clientInfo, undefined, id, diameter || meter?.diameter, date);
  };

  const updateMeter = (id: string, updatedMeter: Partial<Meter>) => {
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

  const updateMovement = (id: string, updatedMovement: Partial<Movement>) => {
    setState(prev => ({
      ...prev,
      movements: (prev.movements || []).map(m => 
        m.id === id ? { ...m, ...updatedMovement } : m
      ),
    }));
  };

  const receiveStock = async (quantity: number, diameter: string, type: MeterType, date: string, location: string, serialNumber?: string, orderInfo?: Movement['orderInfo']) => {
    const newMeters: Meter[] = [];
    
    for (let i = 0; i < quantity; i++) {
      const generatedSN = quantity === 1 && serialNumber ? serialNumber : (serialNumber ? `${serialNumber}-${i + 1}` : '');
      
      // Skip if SN already exists (strict uniqueness)
      if (generatedSN && state.meters.some(m => m.serialNumber === generatedSN)) {
        continue;
      }

      const newMeter: Meter = {
        id: Math.random().toString(36).substr(2, 9) + '-' + i,
        serialNumber: generatedSN,
        diameter,
        type,
        status: 'Neuf',
        location,
        lastUpdate: new Date(date).toISOString(),
      };

      newMeters.push(newMeter);

      // Sauvegarder chaque compteur dans la BDD
      try {
        await fetch(`${API_URL}/meters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serialNumber: generatedSN,
            diameter,
            type,
            status: 'Neuf',
            location,
          }),
        });
      } catch (error) {
        console.error('Failed to save meter to database:', error);
      }
    }

    if (newMeters.length === 0) return;

    const receptionMovement: Movement = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(date).toISOString(),
      type: 'Réception',
      source: 'Fournisseur',
      destination: location,
      serialNumber: quantity === 1 && serialNumber ? serialNumber : `LOT DE ${newMeters.length} (${diameter})`,
      diameter,
      details: `Réception de ${newMeters.length} compteurs ${type} (sur ${quantity} demandés, les doublons ont été ignorés)`,
      orderInfo,
    };

    // Sauvegarder le mouvement dans la BDD
    try {
      await fetch(`${API_URL}/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receptionMovement),
      });
      console.log('✅ Reception movement saved to database');
    } catch (error) {
      console.error('Failed to save movement to database:', error);
    }

    // Mettre à jour le state local
    setState(prev => ({
      ...prev,
      meters: [...prev.meters, ...newMeters],
      movements: [receptionMovement, ...(prev.movements || [])],
    }));
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
