export type WarehouseStatus = 'active' | 'inactive' | 'maintenance';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: Address;
  status: WarehouseStatus;
  timezone: string;
  capacity?: Capacity;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface Capacity {
  totalVolumeM3: number;
  totalWeightKg: number;
  usedVolumeM3?: number;
  usedWeightKg?: number;
}

export interface WarehouseZone {
  id: string;
  warehouseId: string;
  code: string;
  name: string;
  type: 'receiving' | 'storage' | 'picking' | 'shipping' | 'quarantine';
}

export interface InventoryItem {
  id: string;
  warehouseId: string;
  zoneId?: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  unit: string;
  locationCode?: string;
  lotNumber?: string;
  expiryDate?: Date;
  updatedAt: Date;
}

export interface ReceivingOrder {
  id: string;
  warehouseId: string;
  vendorId: string;
  purchaseOrderId?: string;
  status: 'draft' | 'pending' | 'receiving' | 'completed' | 'cancelled';
  expectedAt?: Date;
  receivedAt?: Date;
  lines: ReceivingLine[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceivingLine {
  sku: string;
  expectedQuantity: number;
  receivedQuantity: number;
  unit: string;
  lotNumber?: string;
}

export interface ShipmentOrder {
  id: string;
  warehouseId: string;
  orderReference: string;
  status: 'draft' | 'allocated' | 'picked' | 'packed' | 'shipped' | 'cancelled';
  carrierId?: string;
  trackingNumber?: string;
  lines: ShipmentLine[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentLine {
  sku: string;
  quantity: number;
  unit: string;
}
