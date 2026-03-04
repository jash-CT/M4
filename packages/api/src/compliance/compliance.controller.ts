import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('compliance')
@UseGuards(JwtAuthGuard)
export class ComplianceController {
  constructor(private readonly compliance: ComplianceService) {}

  @Get('rules')
  getRules(@Query('countryCode') countryCode?: string) {
    return this.compliance.getRules(countryCode);
  }

  @Get('declarations/shipment/:shipmentId')
  getDeclarationByShipment(@Param('shipmentId') shipmentId: string) {
    return this.compliance.getDeclarationByShipment(shipmentId);
  }

  @Post('declarations')
  createDeclaration(@Body() body: { shipmentId: string; countryOfExport: string; countryOfImport: string; incoterm: string; items: Array<{ description: string; quantity: number; unit: string; weightKg: number; value: number; currency: string; hsCode: string; countryOfOrigin: string }> }) {
    return this.compliance.createDeclaration(body.shipmentId, body as any);
  }

  @Post('declarations/:id/documents')
  addDocument(@Param('id') id: string, @Body() body: { type: string; name: string; url: string }) {
    return this.compliance.addDocument(id, body.type as any, body.name, body.url);
  }

  @Post('declarations/:id/submit')
  submitDeclaration(@Param('id') id: string) {
    return this.compliance.submitDeclaration(id);
  }
}
