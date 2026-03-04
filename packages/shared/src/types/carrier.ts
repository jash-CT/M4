export type CarrierType = 'parcel' | 'ltl' | 'ftl' | 'air' | 'ocean' | 'rail';

export interface Carrier {
  id: string;
  code: string;
  name: string;
  type: CarrierType;
  integrationId: string;
  isActive: boolean;
  config?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RateRequest {
  origin: AddressRef;
  destination: AddressRef;
  parcels: Parcel[];
  serviceLevel?: string;
  declaredValue?: number;
  currency?: string;
}

export interface AddressRef {
  postalCode: string;
  country: string;
  city?: string;
  state?: string;
}

export interface Parcel {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  quantity?: number;
}

export interface Rate {
  carrierId: string;
  serviceCode: string;
  serviceName: string;
  amount: number;
  currency: string;
  estimatedDays?: number;
  expiresAt?: Date;
}

export interface CreateShipmentRequest {
  carrierId: string;
  serviceCode: string;
  shipper: AddressRef & { name: string; phone?: string };
  recipient: AddressRef & { name: string; phone?: string; email?: string };
  parcels: Parcel[];
  reference?: string;
  labelFormat?: 'pdf' | 'zpl';
}

export interface CreateShipmentResponse {
  shipmentId: string;
  trackingNumber: string;
  labelUrl?: string;
  labelData?: string;
  trackingUrl?: string;
}
