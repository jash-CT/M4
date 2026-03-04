import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CarrierAdapterRegistry } from '../carrier/carrier-adapter.registry';

@Injectable()
export class TrackingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adapters: CarrierAdapterRegistry,
  ) {}

  async getByTrackingNumber(trackingNumber: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { trackingNumber },
      include: { events: true, carrier: true },
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    const adapter = this.adapters.get(shipment.carrier.integrationId);
    let liveEvents = shipment.events.map((e) => ({
      id: e.id,
      shipmentId: e.shipmentId,
      type: e.status,
      description: e.description,
      location: e.location ?? undefined,
      occurredAt: e.occurredAt,
      source: 'database',
      raw: e.rawJson ? JSON.parse(e.rawJson) : undefined,
    }));
    if (adapter?.getTracking) {
      try {
        const live = await adapter.getTracking(trackingNumber);
        liveEvents = live.events.map((ev, i) => ({
          id: `live-${i}`,
          shipmentId: shipment.id,
          type: live.status as any,
          description: ev.description,
          location: ev.location,
          occurredAt: ev.occurredAt,
          source: 'carrier',
          raw: undefined,
        }));
      } catch {
        // fallback to DB events
      }
    }
    liveEvents.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    return {
      shipmentId: shipment.id,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      lastEvent: liveEvents[liveEvents.length - 1],
      estimatedDelivery: shipment.estimatedDelivery ?? undefined,
      events: liveEvents,
    };
  }

  async getByShipmentId(shipmentId: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { events: true },
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    return this.getByTrackingNumber(shipment.trackingNumber);
  }

  async recordEvent(shipmentId: string, status: string, description: string, location?: string, raw?: Record<string, unknown>) {
    const event = await this.prisma.shipmentEvent.create({
      data: {
        shipmentId,
        status,
        description,
        location,
        occurredAt: new Date(),
        rawJson: raw ? JSON.stringify(raw) : null,
      },
    });
    await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: { status, updatedAt: new Date() },
    });
    return event;
  }
}
