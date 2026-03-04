import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CarrierService } from './carrier.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('carriers')
@UseGuards(JwtAuthGuard)
export class CarrierController {
  constructor(private readonly carrier: CarrierService) {}

  @Get()
  list() {
    return this.carrier.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.carrier.get(id);
  }

  @Post(':id/rates')
  getRates(@Param('id') id: string, @Body() body: { origin: { postalCode: string; country: string }; destination: { postalCode: string; country: string }; parcels: Array<{ weightKg: number; lengthCm: number; widthCm: number; heightCm: number }> }) {
    return this.carrier.getRates(id, body as any);
  }

  @Post(':id/shipments')
  createShipment(@Param('id') id: string, @Body() body: any) {
    return this.carrier.createShipment(id, body);
  }
}
