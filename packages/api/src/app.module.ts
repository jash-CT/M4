import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { CarrierModule } from './carrier/carrier.module';
import { RouteModule } from './route/route.module';
import { ComplianceModule } from './compliance/compliance.module';
import { TrackingModule } from './tracking/tracking.module';
import { VendorModule } from './vendor/vendor.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    WarehouseModule,
    CarrierModule,
    RouteModule,
    ComplianceModule,
    TrackingModule,
    VendorModule,
    HealthModule,
  ],
})
export class AppModule {}
