import { Module } from '@nestjs/common';
import { CarrierController } from './carrier.controller';
import { CarrierService } from './carrier.service';
import { CarrierAdapterRegistry } from './carrier-adapter.registry';
import { StubCarrierAdapter } from './adapters/stub.adapter';

@Module({
  controllers: [CarrierController],
  providers: [
    CarrierService,
    CarrierAdapterRegistry,
    StubCarrierAdapter,
  ],
  exports: [CarrierService, CarrierAdapterRegistry],
})
export class CarrierModule {}
