import type { Address } from './warehouse.js';
import type { Parcel } from './carrier.js';

export type ShipmentStatus =
  | 'created'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'cancelled';

export interface Shipment {
  id: string;
  externalId?: string;
  carrierId: string;
  trackingNumber: string;
  status: ShipmentStatus;
  origin: Address;
  destination: Address;
  parcels: Parcel[];
  reference?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  description: string;
  location?: string;
  occurredAt: Date;
  raw?: Record<string, unknown>;
}
