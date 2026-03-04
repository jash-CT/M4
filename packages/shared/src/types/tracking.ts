export type TrackingEventType =
  | 'created'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'delay'
  | 'customs_hold'
  | 'available_for_pickup';

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  type: TrackingEventType;
  description: string;
  location?: string;
  lat?: number;
  lng?: number;
  occurredAt: Date;
  source: string;
  raw?: Record<string, unknown>;
}

export interface TrackingSummary {
  shipmentId: string;
  trackingNumber: string;
  status: string;
  lastEvent?: TrackingEvent;
  estimatedDelivery?: Date;
  events: TrackingEvent[];
}
