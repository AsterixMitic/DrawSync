import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import type { ITokenProviderPort } from '../../domain/ports';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    @Inject('ITokenProviderPort')
    private readonly tokenProvider: ITokenProviderPort,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const token =
      client.handshake.auth?.token ??
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new WsException('Missing authentication token');
    }

    const payload = this.tokenProvider.verify(token);
    if (!payload) {
      throw new WsException('Invalid or expired token');
    }

    (client as any).user = payload;
    return true;
  }
}
