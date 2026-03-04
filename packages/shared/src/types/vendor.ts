import type { Address } from './warehouse.js';

export type VendorStatus = 'pending' | 'active' | 'suspended' | 'inactive';

export interface Vendor {
  id: string;
  code: string;
  name: string;
  email: string;
  address?: Address;
  status: VendorStatus;
  taxId?: string;
  paymentTerms?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorUser {
  id: string;
  vendorId: string;
  email: string;
  role: 'admin' | 'viewer' | 'operator';
  createdAt: Date;
}

export interface VendorPortalSession {
  vendorId: string;
  userId: string;
  token: string;
  expiresAt: Date;
}
