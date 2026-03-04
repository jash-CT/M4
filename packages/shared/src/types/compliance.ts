export type DocumentType =
  | 'commercial_invoice'
  | 'packing_list'
  | 'certificate_of_origin'
  | 'customs_declaration'
  | 'bill_of_lading'
  | 'air_waybill'
  | 'dangerous_goods'
  | 'export_license'
  | 'import_permit';

export type ComplianceStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

export interface CustomsDeclaration {
  id: string;
  shipmentId: string;
  countryOfExport: string;
  countryOfImport: string;
  incoterm: string;
  items: CustomsItem[];
  documents: ComplianceDocument[];
  status: ComplianceStatus;
  submittedAt?: Date;
  clearedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomsItem {
  description: string;
  quantity: number;
  unit: string;
  weightKg: number;
  value: number;
  currency: string;
  hsCode: string;
  countryOfOrigin: string;
}

export interface ComplianceDocument {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  status: ComplianceStatus;
  uploadedAt: Date;
  reviewedAt?: Date;
}

export interface ComplianceRule {
  id: string;
  name: string;
  countryCode: string;
  type: 'import' | 'export' | 'transit';
  conditions: Record<string, unknown>;
  requiredDocuments: DocumentType[];
  isActive: boolean;
}
