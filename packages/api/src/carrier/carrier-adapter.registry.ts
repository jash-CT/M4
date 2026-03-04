import { Injectable } from '@nestjs/common';
import type { RateRequest, Rate, CreateShipmentRequest, CreateShipmentResponse } from '@logistics/shared';

export interface ICarrierAdapter {
  readonly integrationId: string;
  getRates(request: RateRequest): Promise<Rate[]>;
  createShipment(request: CreateShipmentRequest): Promise<CreateShipmentResponse>;
  getTracking?(trackingNumber: string): Promise<{ status: string; events: Array<{ description: string; location?: string; occurredAt: Date }> }>;
}

@Injectable()
export class CarrierAdapterRegistry {
  private adapters = new Map<string, ICarrierAdapter>();

  register(adapter: ICarrierAdapter) {
    this.adapters.set(adapter.integrationId, adapter);
  }

  get(integrationId: string): ICarrierAdapter | undefined {
    return this.adapters.get(integrationId);
  }

  getAll(): ICarrierAdapter[] {
    return Array.from(this.adapters.values());
  }
}
