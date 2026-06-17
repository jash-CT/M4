import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
  WsException,
import { Server } from 'socket.io';
import { Server, Socket } from 'socket.io';

import { UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
@WebSocketGateway({ cors: true, path: '/api/ws' })
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private subscriptions = new Map<string, Set<string>>();
  private subscriptions = new Map<string, { userId: string; channels: Set<string> }>();
  constructor(private readonly tracking: TrackingService) {}

  handleConnection(client: { id: string }) {
  private authenticateClient(client: Socket): string | null {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return null;
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error('JWT_SECRET not configured');
        return null;
      }
      const payload = verify(token, secret) as { userId?: string; sub?: string };
      return payload.userId || payload.sub || null;
    } catch (err) {
      return null;
    }
  }

  handleConnection(client: Socket) {
    const userId = this.authenticateClient(client);
    if (!userId) {
      client.disconnect(true);
      return;
    }
    this.subscriptions.set(client.id, { userId, channels: new Set() });

  handleDisconnect(client: { id: string }) {
    this.subscriptions.delete(client.id);
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(
    client: Socket,
    payload: { trackingNumber?: string; shipmentId?: string },
  ) {
    const sub = this.subscriptions.get(client.id);
    if (!sub) {
      throw new WsException('Unauthorized');
    }

    if (payload.trackingNumber) {
      const hasAccess = await this.tracking.canAccessTrackingNumber(sub.userId, payload.trackingNumber);
      if (!hasAccess) {
        throw new WsException('Forbidden: cannot access tracking number');
      }
      sub.channels.add(`tn:${payload.trackingNumber}`);
    }
    if (payload.shipmentId) {
      const hasAccess = await this.tracking.canAccessShipment(sub.userId, payload.shipmentId);
      if (!hasAccess) {
        throw new WsException('Forbidden: cannot access shipment');
      }
      sub.channels.add(`sm:${payload.shipmentId}`);
    }
  }

  async broadcastUpdate(trackingNumber: string, data: unknown) {
    this.server.emit('tracking', { trackingNumber, data });
  }
}
