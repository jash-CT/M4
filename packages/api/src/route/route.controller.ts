import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RouteService } from './route.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RouteController {
  constructor(private readonly route: RouteService) {}

  @Get()
  list(@Query('status') status?: string) {
    return this.route.list(status);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.route.get(id);
  }

  @Post('optimize')
  optimize(@Body() body: { depot: { lat: number; lng: number }; stops: Array<{ id: string; lat: number; lng: number; type: 'pickup' | 'delivery'; timeWindow?: { start: string; end: string }; serviceTimeMinutes?: number }> }) {
    return this.route.optimize(body as any);
  }

  @Post()
  create(
    @Body()
    body: {
      carrierId?: string;
      waypoints: Array<{ id: string; address: string; lat: number; lng: number; orderIndex: number; type: string; serviceTimeMinutes?: number }>;
      estimatedStart: string;
      estimatedEnd: string;
    },
  ) {
    return this.route.createRoute(
      body.carrierId ?? null,
      body.waypoints as any,
      new Date(body.estimatedStart),
      new Date(body.estimatedEnd),
    );
  }
}
