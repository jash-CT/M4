import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly tracking: TrackingService) {}

  @Get('by-number/:trackingNumber')
  getByTrackingNumber(@Param('trackingNumber') trackingNumber: string) {
    return this.tracking.getByTrackingNumber(trackingNumber);
  }

  @Get('shipment/:shipmentId')
  @UseGuards(JwtAuthGuard)
  getByShipmentId(@Param('shipmentId') shipmentId: string) {
    return this.tracking.getByShipmentId(shipmentId);
  }
}
