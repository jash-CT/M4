import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { RouteOptimizationRequest, RouteOptimizationResult, RouteWaypoint } from '@logistics/shared';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async optimize(body: RouteOptimizationRequest): Promise<RouteOptimizationResult> {
    const { depot, stops, vehicleCapacity, maxRouteDurationMinutes } = body;
    const sequence = this.simpleTSP(depot, stops);
    const waypoints: RouteWaypoint[] = sequence.map((s, i) => ({
      id: s.id,
      address: `${s.lat},${s.lng}`,
      lat: s.lat,
      lng: s.lng,
      orderIndex: i,
      type: s.type,
      timeWindow: s.timeWindow,
      serviceTimeMinutes: s.serviceTimeMinutes,
    }));
    const totalDistanceKm = this.haversineDistance(depot, stops[0] ?? depot) +
      sequence.slice(1).reduce((acc, cur, i) => acc + this.haversineDistance(sequence[i]!, cur), 0) +
      (stops.length ? this.haversineDistance(sequence[sequence.length - 1]!, depot) : 0);
    const totalDurationMinutes = Math.round(totalDistanceKm * 2) + (stops.reduce((a, s) => a + (s.serviceTimeMinutes ?? 0), 0));
    return {
      routes: [{
        waypoints,
        totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
        totalDurationMinutes,
        sequence: sequence.map((s) => s.id),
      }],
      unassigned: [],
    };
  }

  private haversineDistance(
    a: { lat: number; lng: number },
    b: { lat: number; lng: number },
  ): number {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const x =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return R * c;
  }

  private simpleTSP(
    depot: { lat: number; lng: number },
    stops: RouteOptimizationRequest['stops'],
  ): RouteOptimizationRequest['stops'] {
    if (stops.length <= 1) return [...stops];
    const withDist = stops.map((s) => ({
      ...s,
      dist: this.haversineDistance(depot, s),
    }));
    withDist.sort((a, b) => a.dist - b.dist);
    return this.nearestNeighbor(depot, withDist);
  }

  private nearestNeighbor(
    start: { lat: number; lng: number },
    stops: Array<RouteOptimizationRequest['stops'][0] & { dist?: number }>,
  ): RouteOptimizationRequest['stops'] {
    const result: RouteOptimizationRequest['stops'] = [];
    let current = start;
    const remaining = new Map(stops.map((s) => [s.id, s]));
    while (remaining.size > 0) {
      let nearest: (typeof stops)[0] | null = null;
      let minDist = Infinity;
      for (const s of remaining.values()) {
        const d = this.haversineDistance(current, s);
        if (d < minDist) {
          minDist = d;
          nearest = s;
        }
      }
      if (!nearest) break;
      remaining.delete(nearest.id);
      result.push(nearest);
      current = nearest;
    }
    return result;
  }

  async createRoute(carrierId: string | null, waypoints: RouteWaypoint[], estimatedStart: Date, estimatedEnd: Date) {
    const totalDistanceKm = waypoints.length * 5;
    const totalDurationMinutes = Math.round((estimatedEnd.getTime() - estimatedStart.getTime()) / 60000);
    return this.prisma.route.create({
      data: {
        carrierId,
        waypointsJson: JSON.stringify(waypoints),
        totalDistanceKm,
        totalDurationMinutes,
        estimatedStart,
        estimatedEnd,
        status: 'planned',
      },
    });
  }

  async list(status?: string) {
    return this.prisma.route.findMany({
      where: status ? { status } : undefined,
      orderBy: { estimatedStart: 'desc' },
      take: 100,
    }).then((rows) =>
      rows.map((r) => ({
        id: r.id,
        carrierId: r.carrierId,
        driverId: r.driverId,
        vehicleId: r.vehicleId,
        waypoints: JSON.parse(r.waypointsJson) as RouteWaypoint[],
        totalDistanceKm: r.totalDistanceKm,
        totalDurationMinutes: r.totalDurationMinutes,
        estimatedStart: r.estimatedStart,
        estimatedEnd: r.estimatedEnd,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    );
  }

  async get(id: string) {
    const r = await this.prisma.route.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Route not found');
    return {
      id: r.id,
      carrierId: r.carrierId,
      driverId: r.driverId,
      vehicleId: r.vehicleId,
      waypoints: JSON.parse(r.waypointsJson) as RouteWaypoint[],
      totalDistanceKm: r.totalDistanceKm,
      totalDurationMinutes: r.totalDurationMinutes,
      estimatedStart: r.estimatedStart,
      estimatedEnd: r.estimatedEnd,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
