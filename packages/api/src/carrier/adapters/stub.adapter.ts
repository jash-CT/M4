import { Injectable } from '@nestjs/core';
import type { RateRequest, Rate, CreateShipmentRequest, CreateShipmentResponse } from '@logistics/shared';
import type { ICarrierAdapter } from '../carrier-adapter.registry';
import { CarrierAdapterRegistry } from '../carrier-adapter.registry';

@Injectable()
export class StubCarrierAdapter implements ICarrierAdapter {
  readonly integrationId = 'stub';

  constructor(registry: CarrierAdapterRegistry) {
    registry.register(this);
  }

  async getRates(_request: RateRequest): Promise<Rate[]> {
    return [
      { carrierId: '', serviceCode: 'standard', serviceName: 'Standard', amount: 15.99, currency: 'USD', estimatedDays: 5 },
      { carrierId: '', serviceCode: 'express', serviceName: 'Express', amount: 29.99, currency: 'USD', estimatedDays: 2 },
    ];
  }

  async createShipment(request: CreateShipmentRequest): Promise<CreateShipmentResponse> {
    const trackingNumber = `STUB${Date.now().toString(36).toUpperCase()}`;
    return {
      shipmentId: `stub-${trackingNumber}`,
      trackingNumber,
      trackingUrl: `https://track.example.com/${trackingNumber}`,
    };
  }

  async getTracking(trackingNumber: string) {
    return {
      status: 'in_transit',
      events: [
        { description: 'Shipment created', occurredAt: new Date(Date.now() - 86400000) },
        { description: 'In transit', location: 'Distribution Center', occurredAt: new Date() },
      ],
    };
  }
}
