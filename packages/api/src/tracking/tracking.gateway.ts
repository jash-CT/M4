import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UnauthorizedException } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@WebSocketGateway({ cors: true, path: '/api/ws' })
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private subscriptions = new Map<string, Set<string>>();
  private authenticatedClients = new Map<string, { userId: string; token: string }>();

  constructor(private readonly tracking: TrackingService) {}

  async handleConnection(client: any) {
    try {
      const token = client.handshake?.query?.token || client.handshake?.auth?.token;
      if (!token) {
        client.disconnect(true);
        return;
      }
      const user = await this.tracking.validateToken(token);
      this.authenticatedClients.set(client.id, { userId: user.id, token });
    } catch (error) {
      client.disconnect(true);
      return;
    }
    this.subscriptions.set(client.id, new Set());
  }

  handleDisconnect(client: { id: string }) {
    this.subscriptions.delete(client.id);
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(
    client: any,
    payload: { trackingNumber?: string; shipmentId?: string },
  ) {
    const auth = this.authenticatedClients.get(client.id);
    if (!auth) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    const set = this.subscriptions.get(client.id);
    if (!set) return;

    const hasAccess = await this.tracking.verifyShipmentAccess(auth.userId, payload.trackingNumber, payload.shipmentId);
    if (!hasAccess) {
      client.emit('error', { message: 'Access denied to requested shipment' });
      return;
    }

    if (payload.trackingNumber) set.add(`tn:${payload.trackingNumber}`);
    if (payload.shipmentId) set.add(`sm:${payload.shipmentId}`);
  }

  async broadcastUpdate(trackingNumber: string, data: unknown) {
    this.server.emit('tracking', { trackingNumber, data });
  }
}
