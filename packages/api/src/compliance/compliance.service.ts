import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CustomsItem, DocumentType } from '@logistics/shared';

@Injectable()
export class ComplianceService {
  constructor(private readonly prisma: PrismaService) {}

  async getRules(countryCode?: string) {
    const rules = await this.prisma.complianceRule.findMany({
      where: { isActive: true, ...(countryCode ? { countryCode } : {}) },
      orderBy: [{ countryCode: 'asc' }, { type: 'asc' }],
    });
    return rules.map((r) => ({
      id: r.id,
      name: r.name,
      countryCode: r.countryCode,
      type: r.type,
      conditions: r.conditionsJson ? JSON.parse(r.conditionsJson) : undefined,
      requiredDocuments: r.requiredDocuments.split(',') as DocumentType[],
      isActive: r.isActive,
    }));
  }

  async getDeclarationByShipment(shipmentId: string, userId: string) {
    // Verify shipment ownership before accessing declaration
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      select: { id: true, userId: true },
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    if (shipment.userId !== userId) {
      throw new ForbiddenException('Access denied: you do not own this shipment');
    }

    const d = await this.prisma.customsDeclaration.findUnique({
      where: { shipmentId },
      include: { documents: true },
    });
    if (!d) throw new NotFoundException('Customs declaration not found');
    return {
      id: d.id,
      shipmentId: d.shipmentId,
      countryOfExport: d.countryOfExport,
      countryOfImport: d.countryOfImport,
      incoterm: d.incoterm,
      items: JSON.parse(d.itemsJson) as CustomsItem[],
      documents: d.documents.map((doc) => ({
        id: doc.id,
        type: doc.type,
        name: doc.name,
        url: doc.url,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
        reviewedAt: doc.reviewedAt,
      })),
      status: d.status,
      submittedAt: d.submittedAt ?? undefined,
      clearedAt: d.clearedAt ?? undefined,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  async createDeclaration(shipmentId: string, data: { countryOfExport: string; countryOfImport: string; incoterm: string; items: CustomsItem[] }) {
    return this.prisma.customsDeclaration.create({
      data: {
        shipmentId,
        countryOfExport: data.countryOfExport,
        countryOfImport: data.countryOfImport,
        incoterm: data.incoterm,
        itemsJson: JSON.stringify(data.items),
        status: 'pending',
      },
    });
  }

  async addDocument(declarationId: string, type: DocumentType, name: string, url: string) {
    return this.prisma.complianceDocument.create({
      data: { declarationId, type, name, url, status: 'pending' },
    });
  }

  async submitDeclaration(id: string) {
    return this.prisma.customsDeclaration.update({
      where: { id },
      data: { status: 'under_review', submittedAt: new Date() },
    });
  }
}
