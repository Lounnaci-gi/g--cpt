import { Timestamp } from 'firebase/firestore';

export type MeterStatus = 'EN_STOCK' | 'POSE' | 'INSTALLE' | 'VENDU' | 'RETOURNE';
export type StoreType = 'UNITE' | 'AGENCE' | 'ANTENNE';
export type MovementDirection = 'ENTREE' | 'SORTIE';

export interface Unit {
  id: string;
  code: string;
  label: string;
  address?: string;
}

export interface Agency {
  id: string;
  code: string;
  label: string;
  unitId: string;
}

export interface Branch {
  id: string;
  code: string;
  label: string;
  agencyId: string;
  commune: string;
}

export interface Store {
  id: string;
  label: string;
  code: string;
  type: StoreType;
  unitId?: string;
  agencyId?: string;
  branchId?: string;
}

export interface Brand {
  id: string;
  label: string;
}

export interface Diameter {
  id: string;
  value: string;
}

export interface Meter {
  id: string;
  serialNumber: string;
  diameterId: string;
  brandId: string;
  status: MeterStatus;
  currentStoreId?: string;
  lastMovementDate?: Timestamp;
}

export interface Movement {
  id: string;
  date: Timestamp;
  typeId: string;
  sourceStoreId?: string;
  destStoreId?: string;
  supplierId?: string;
  deliveryNote?: string;
  subscriberId?: string;
  fileNumber?: string;
  responsible?: string;
  observation?: string;
  createdBy: string;
  meterSerialNumbers?: string[];
}

export interface StockLevel {
  id: string;
  storeId: string;
  diameterId: string;
  quantity: number;
}

export interface Threshold {
  id: string;
  storeId: string;
  diameterId: string;
  minQuantity: number;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
}
