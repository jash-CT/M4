import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorOnly } from '../auth/guards';

@Controller('vendor')
@VendorOnly()
export class VendorController {
  constructor(private readonly vendor: VendorService) {}

  @Get('profile')
  getProfile(@Req() req: { user: { vendorId: string } }) {
    return this.vendor.getVendorProfile(req.user.vendorId);
  }

  @Get('receiving-orders')
  getReceivingOrders(@Req() req: { user: { vendorId: string } }, @Query('status') status?: string) {
    return this.vendor.getReceivingOrdersForVendor(req.user.vendorId, status);
  }

  @Get('receiving-orders/:orderId')
  getReceivingOrder(@Req() req: { user: { vendorId: string } }, @Param('orderId') orderId: string) {
    return this.vendor.getReceivingOrderForVendor(req.user.vendorId, orderId);
  }
}
