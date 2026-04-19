import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  runTransaction, 
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Meter, Movement, MeterStatus } from '../types';

export const MOVEMENT_TYPES = {
  APPRO: { id: 'APPRO', label: 'Approvisionnement', direction: 'ENTREE' },
  TRANSF_RECU: { id: 'TRANSF_RECU', label: 'Transfert Reçu', direction: 'ENTREE' },
  BRANCHEMENT: { id: 'BRANCHEMENT', label: 'Branchement Neuf', direction: 'SORTIE' },
  REMPLACEMENT: { id: 'REMPLACEMENT', label: 'Remplacement Compteur', direction: 'SORTIE' },
  VENTE: { id: 'VENTE', label: 'Vente', direction: 'SORTIE' },
  TRANSF_EMIS: { id: 'TRANSF_EMIS', label: 'Transfert Émis', direction: 'SORTIE' },
  REINTEGRATION: { id: 'REINTEGRATION', label: 'Réintégration Fournisseur', direction: 'SORTIE' },
};

export async function createMovement(
  movementData: Omit<Movement, 'id' | 'date' | 'meterSerialNumbers'>,
  meterIds: string[]
) {
  return runTransaction(db, async (transaction) => {
    const mvtRef = doc(collection(db, 'movements'));
    const timestamp = serverTimestamp();
    const meterSerialNumbers: string[] = [];
    
    // PHASE 1 : TOUTES LES LECTURES d'abord
    const metersData: (Meter | null)[] = [];
    for (const meterId of meterIds) {
      const meterRef = doc(db, 'meters', meterId);
      const meterSnap = await transaction.get(meterRef);
      
      if (meterSnap.exists()) {
        metersData.push(meterSnap.data() as Meter);
      } else {
        // Compteur n'existe pas encore, on le créera
        metersData.push(null);
      }
    }
    
    // PHASE 2 : TOUTES LES ÉCRITURES ensuite
    const stockChanges: Record<string, number> = {};
    
    for (let i = 0; i < meterIds.length; i++) {
      const meterId = meterIds[i];
      const meterData = metersData[i];
      const meterRef = doc(db, 'meters', meterId);
      
      // Déterminer le numéro de série et le diamètre
      let serialNumber: string;
      let diameterId: string;
      
      if (meterData) {
        // Compteur existant
        serialNumber = meterData.serialNumber;
        diameterId = meterData.diameterId;
      } else {
        // Nouveau compteur - extraire les infos de l'ID
        serialNumber = meterId;
        // Essayer d'extraire le diamètre de l'ID (format: DN15_timestamp_num)
        const diameterMatch = meterId.match(/^(DN\d+)_/);
        diameterId = diameterMatch ? diameterMatch[1] : 'UNKNOWN';
      }
      
      meterSerialNumbers.push(serialNumber);

      // Update meter status and location
      let newStatus: MeterStatus = meterData?.status || 'EN_STOCK';
      let newStoreId = meterData?.currentStoreId;

      const type = movementData.typeId;
      
      if (type === 'APPRO' || type === 'TRANSF_RECU') {
        newStatus = 'EN_STOCK';
        newStoreId = movementData.destStoreId;
      } else if (type === 'TRANSF_EMIS') {
        newStatus = 'EN_STOCK';
        newStoreId = movementData.destStoreId;
      } else if (type === 'BRANCHEMENT' || type === 'VENTE' || type === 'REMPLACEMENT') {
        newStatus = type === 'BRANCHEMENT' ? 'POSE' : 'VENDU';
        newStoreId = undefined;
      }

      if (meterData) {
        // Compteur existant : update
        transaction.update(meterRef, {
          status: newStatus,
          currentStoreId: newStoreId || null,
          lastMovementDate: timestamp
        });
      } else {
        // Nouveau compteur : create
        transaction.set(meterRef, {
          serialNumber,
          diameterId,
          brandId: 'DEFAULT',
          status: newStatus,
          currentStoreId: newStoreId || null,
          lastMovementDate: timestamp
        });
      }

      // Create movement line
      const lineRef = doc(collection(mvtRef, 'lines'));
      transaction.set(lineRef, {
        meterId,
        serialNumber
      });

      // Calculer les changements de stock
      if (movementData.sourceStoreId) {
        const sourceStockId = `${movementData.sourceStoreId}_${diameterId}`;
        stockChanges[sourceStockId] = (stockChanges[sourceStockId] || 0) - 1;
      }

      if (movementData.destStoreId) {
        const destStockId = `${movementData.destStoreId}_${diameterId}`;
        stockChanges[destStockId] = (stockChanges[destStockId] || 0) + 1;
      }
    }

    // Apply aggregated stock changes
    for (const [stockId, change] of Object.entries(stockChanges)) {
      const stockRef = doc(db, 'stockLevels', stockId);
      const [storeId, diameterId] = stockId.split('_');
      transaction.set(stockRef, {
        storeId,
        diameterId,
        quantity: increment(change)
      }, { merge: true });
    }

    // Create movement header with serial numbers
    transaction.set(mvtRef, {
      ...movementData,
      date: timestamp,
      meterSerialNumbers
    });

    return mvtRef.id;
  });
}

export async function setupInitialData() {
  const batch = writeBatch(db);
  
  // Movement Types
  Object.values(MOVEMENT_TYPES).forEach(type => {
    batch.set(doc(db, 'movementTypes', type.id), type);
  });
  
  // Diameters
  ['DN15', 'DN20', 'DN25', 'DN32', 'DN40', 'DN50'].forEach(val => {
    batch.set(doc(db, 'diameters', val), { value: val });
  });

  // Brands
  ['SENSUS', 'ITRON', 'ZENNER', 'DIEHL', 'MADALENA'].forEach(brand => {
    batch.set(doc(db, 'brands', brand.toLowerCase()), { label: brand });
  });

  // Sample Store and Threshold if none exists
  const storeRef = doc(db, 'stores', 'agence_centrale');
  batch.set(storeRef, {
    label: 'Agence Centrale',
    type: 'AGENCE',
    code: 'AC01'
  });

  const thresholdRef = doc(db, 'thresholds', 'mc_dn15');
  batch.set(thresholdRef, {
    storeId: 'mag_central',
    diameterId: 'DN15',
    minQuantity: 10
  });

  await batch.commit();
}
