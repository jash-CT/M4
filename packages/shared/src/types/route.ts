export interface RouteWaypoint {
  id: string;
  address: string;
  lat: number;
  lng: number;
  orderIndex: number;
  type: 'pickup' | 'delivery' | 'depot';
  timeWindow?: { start: string; end: string };
  serviceTimeMinutes?: number;
}

export interface Route {
  id: string;
  carrierId?: string;
  driverId?: string;
  vehicleId?: string;
  waypoints: RouteWaypoint[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
  estimatedStart: Date;
  estimatedEnd: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteOptimizationRequest {
  depot: { lat: number; lng: number };
  stops: Array<{
    id: string;
    lat: number;
    lng: number;
    type: 'pickup' | 'delivery';
    timeWindow?: { start: string; end: string };
    serviceTimeMinutes?: number;
    priority?: number;
  }>;
  vehicleCapacity?: number;
  maxRouteDurationMinutes?: number;
}

export interface RouteOptimizationResult {
  routes: Array<{
    waypoints: RouteWaypoint[];
    totalDistanceKm: number;
    totalDurationMinutes: number;
    sequence: string[];
  }>;
  unassigned: string[];
}
