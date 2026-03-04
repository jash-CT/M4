import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TrackingService } from './tracking.service';

@WebSocketGateway({ cors: true, path: '/api/ws' })
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private subscriptions = new Map<string, Set<string>>();

  constructor(private readonly tracking: TrackingService) {}

  handleConnection(client: { id: string }) {
    this.subscriptions.set(client.id, new Set());
  }

  handleDisconnect(client: { id: string }) {
    this.subscriptions.delete(client.id);
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(
    client: { id: string },
    payload: { trackingNumber?: string; shipmentId?: string },
  ) {
    const set = this.subscriptions.get(client.id);
    if (!set) return;
    if (payload.trackingNumber) set.add(`tn:${payload.trackingNumber}`);
    if (payload.shipmentId) set.add(`sm:${payload.shipmentId}`);
  }

  async broadcastUpdate(trackingNumber: string, data: unknown) {
    this.server.emit('tracking', { trackingNumber, data });
  }
}
