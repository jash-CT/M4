import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CarrierAdapterRegistry } from './carrier-adapter.registry';
import type { RateRequest, CreateShipmentRequest } from '@logistics/shared';

@Injectable()
export class CarrierService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adapters: CarrierAdapterRegistry,
  ) {}

  async list() {
    return this.prisma.carrier.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    }).then((rows) =>
      rows.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        type: c.type,
        integrationId: c.integrationId,
        isActive: c.isActive,
        config: c.configJson ? JSON.parse(c.configJson) : undefined,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    );
  }

  async get(id: string) {
    const c = await this.prisma.carrier.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Carrier not found');
    return {
      id: c.id,
      code: c.code,
      name: c.name,
      type: c.type,
      integrationId: c.integrationId,
      isActive: c.isActive,
      config: c.configJson ? JSON.parse(c.configJson) : undefined,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  async getRates(carrierId: string, request: RateRequest) {
    const carrier = await this.get(carrierId);
    const adapter = this.adapters.get(carrier.integrationId);
    if (!adapter) throw new BadRequestException(`Carrier integration ${carrier.integrationId} not available`);
    const rates = await adapter.getRates(request);
    return rates.map((r) => ({ ...r, carrierId }));
  }

  async createShipment(carrierId: string, request: CreateShipmentRequest) {
    const carrier = await this.get(carrierId);
    const adapter = this.adapters.get(carrier.integrationId);
    if (!adapter) throw new BadRequestException(`Carrier integration ${carrier.integrationId} not available`);
    const result = await adapter.createShipment(request);
    await this.prisma.shipment.create({
      data: {
        carrierId,
        externalId: result.shipmentId,
        trackingNumber: result.trackingNumber,
        status: 'created',
        originJson: JSON.stringify(request.shipper),
        destinationJson: JSON.stringify(request.recipient),
        parcelsJson: JSON.stringify(request.parcels),
        reference: request.reference,
      },
    });
    return result;
  }
}
