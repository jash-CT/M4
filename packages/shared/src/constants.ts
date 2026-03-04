export const INCOTERMS = [
  'EXW',
  'FCA',
  'CPT',
  'CIP',
  'DAP',
  'DPU',
  'DDP',
  'FAS',
  'FOB',
  'CFR',
  'CIF',
] as const;

export const DOCUMENT_TYPES = [
  'commercial_invoice',
  'packing_list',
  'certificate_of_origin',
  'customs_declaration',
  'bill_of_lading',
  'air_waybill',
  'dangerous_goods',
  'export_license',
  'import_permit',
] as const;

export const CARRIER_TYPES = ['parcel', 'ltl', 'ftl', 'air', 'ocean', 'rail'] as const;

export const SHIPMENT_STATUSES = [
  'created',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'exception',
  'cancelled',
] as const;
