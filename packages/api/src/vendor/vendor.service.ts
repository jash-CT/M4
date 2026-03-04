import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VendorService {
  constructor(private readonly prisma: PrismaService) {}

  async getVendorProfile(vendorId: string) {
    const v = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });
    if (!v) throw new NotFoundException('Vendor not found');
    return {
      id: v.id,
      code: v.code,
      name: v.name,
      email: v.email,
      address: v.addressJson ? JSON.parse(v.addressJson) : undefined,
      status: v.status,
      taxId: v.taxId ?? undefined,
      paymentTerms: v.paymentTerms ?? undefined,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    };
  }

  async getReceivingOrdersForVendor(vendorId: string, status?: string) {
    const orders = await this.prisma.receivingOrder.findMany({
      where: { vendorId, ...(status ? { status } : {}) },
      include: { warehouse: true },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => ({
      id: o.id,
      warehouseId: o.warehouseId,
      warehouse: o.warehouse,
      purchaseOrderId: o.purchaseOrderId ?? undefined,
      status: o.status,
      expectedAt: o.expectedAt ?? undefined,
      receivedAt: o.receivedAt ?? undefined,
      lines: JSON.parse(o.linesJson),
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }));
  }

  async getReceivingOrderForVendor(vendorId: string, orderId: string) {
    const o = await this.prisma.receivingOrder.findFirst({
      where: { id: orderId, vendorId },
      include: { warehouse: true },
    });
    if (!o) throw new ForbiddenException('Order not found or access denied');
    return {
      id: o.id,
      warehouseId: o.warehouseId,
      warehouse: o.warehouse,
      purchaseOrderId: o.purchaseOrderId ?? undefined,
      status: o.status,
      expectedAt: o.expectedAt ?? undefined,
      receivedAt: o.receivedAt ?? undefined,
      lines: JSON.parse(o.linesJson),
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
  }
}
