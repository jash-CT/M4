import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('warehouses')
@UseGuards(JwtAuthGuard)
export class WarehouseController {
  constructor(private readonly warehouse: WarehouseService) {}

  @Get()
  list() {
    return this.warehouse.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.warehouse.get(id);
  }

  @Get(':id/inventory')
  getInventory(@Param('id') id: string, @Query('sku') sku?: string) {
    return this.warehouse.getInventory(id, sku);
  }

  @Get(':id/receiving-orders')
  getReceivingOrders(@Param('id') id: string, @Query('status') status?: string) {
    return this.warehouse.getReceivingOrders(id, status);
  }

  @Get(':id/shipment-orders')
  getShipmentOrders(@Param('id') id: string, @Query('status') status?: string) {
    return this.warehouse.getShipmentOrders(id, status);
  }
}
