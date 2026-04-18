export type MeterDiameter = string;
export type MeterType = 'Volumétrique' | 'Vitesse' | 'Électromagnétique' | 'Ultrasons';
export type MeterStatus = 'Neuf' | 'Installé' | 'À l\'arrêt' | 'Vendu';

export interface Meter {
  id: string;
  serialNumber: string;
  diameter: MeterDiameter;
  type: MeterType;
  status: MeterStatus;
  location: string; // Agency or Antenna Name
  lastUpdate: string;
}

export type MovementType = 'Transfert' | 'Pose' | 'Remplacement' | 'Vente' | 'Réintégration' | 'Réception';

export interface Movement {
  id: string;
  meterId?: string;
  date: string;
  type: MovementType;
  source: string;
  destination: string;
  serialNumber: string;
  diameter?: string;
  details?: string;
  clientInfo?: {
    code: string;
    name?: string;
    address?: string;
    realizationDate?: string;
    fileNumber?: string;
  };
  orderInfo?: {
    orderNumber?: string;
    orderDate?: string;
    issuer?: string;
  };
}

export type LocationType = 'Agence' | 'Antenne';

export interface AppLocation {
  name: string;
  type: LocationType;
  parentAgency?: string; // Only for Antennas
}

export interface Threshold {
  diameter: MeterDiameter;
  type: MeterType;
  minQuantity: number;
}

export interface StockState {
  meters: Meter[];
  movements: Movement[];
  locations: AppLocation[];
  thresholds?: Threshold[];
}
