import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Address, WarehouseStatus } from '@logistics/shared';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.warehouse.findMany({
      where: { status: 'active' },
      include: { zones: true },
      orderBy: { code: 'asc' },
    });
    return rows.map((w) => this.toWarehouse(w));
  }

  async get(id: string) {
    const w = await this.prisma.warehouse.findUnique({
      where: { id },
      include: { zones: true },
    });
    if (!w) throw new NotFoundException('Warehouse not found');
    return this.toWarehouse(w);
  }

  async getInventory(warehouseId: string, sku?: string) {
    await this.get(warehouseId);
    const items = await this.prisma.inventoryItem.findMany({
      where: { warehouseId, ...(sku ? { sku } : {}) },
      orderBy: [{ sku: 'asc' }, { lotNumber: 'asc' }],
    });
    return items.map((i) => ({
      id: i.id,
      warehouseId: i.warehouseId,
      zoneId: i.zoneId ?? undefined,
      sku: i.sku,
      quantity: i.quantity,
      reservedQuantity: i.reservedQuantity,
      unit: i.unit,
      locationCode: i.locationCode ?? undefined,
      lotNumber: i.lotNumber ?? undefined,
      expiryDate: i.expiryDate ?? undefined,
      updatedAt: i.updatedAt,
    }));
  }

  async getReceivingOrders(warehouseId: string, status?: string) {
    await this.get(warehouseId);
    const orders = await this.prisma.receivingOrder.findMany({
      where: { warehouseId, ...(status ? { status } : {}) },
      include: { vendor: true },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => this.toReceivingOrder(o));
  }

  async getShipmentOrders(warehouseId: string, status?: string) {
    await this.get(warehouseId);
    const orders = await this.prisma.shipmentOrder.findMany({
      where: { warehouseId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => this.toShipmentOrder(o));
  }

  private toWarehouse(w: {
    id: string;
    code: string;
    name: string;
    addressJson: string;
    status: string;
    timezone: string;
    capacityJson: string | null;
    createdAt: Date;
    updatedAt: Date;
    zones: { id: string; code: string; name: string; type: string }[];
  }) {
    return {
      id: w.id,
      code: w.code,
      name: w.name,
      address: JSON.parse(w.addressJson) as Address,
      status: w.status as WarehouseStatus,
      timezone: w.timezone,
      capacity: w.capacityJson ? JSON.parse(w.capacityJson) : undefined,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      zones: w.zones.map((z) => ({ id: z.id, warehouseId: w.id, code: z.code, name: z.name, type: z.type })),
    };
  }

  private toReceivingOrder(o: {
    id: string;
    warehouseId: string;
    vendorId: string;
    purchaseOrderId: string | null;
    status: string;
    expectedAt: Date | null;
    receivedAt: Date | null;
    linesJson: string;
    createdAt: Date;
    updatedAt: Date;
    vendor: { id: string; code: string; name: string };
  }) {
    return {
      id: o.id,
      warehouseId: o.warehouseId,
      vendorId: o.vendorId,
      vendor: o.vendor,
      purchaseOrderId: o.purchaseOrderId ?? undefined,
      status: o.status,
      expectedAt: o.expectedAt ?? undefined,
      receivedAt: o.receivedAt ?? undefined,
      lines: JSON.parse(o.linesJson),
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
  }

  private toShipmentOrder(o: {
    id: string;
    warehouseId: string;
    orderReference: string;
    status: string;
    carrierId: string | null;
    trackingNumber: string | null;
    linesJson: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: o.id,
      warehouseId: o.warehouseId,
      orderReference: o.orderReference,
      status: o.status,
      carrierId: o.carrierId ?? undefined,
      trackingNumber: o.trackingNumber ?? undefined,
      lines: JSON.parse(o.linesJson),
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
  }
}
