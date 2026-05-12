import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '@eventflux/config';
import { logger } from '@eventflux/logger';

export class WebSocketManager {
  private io: Server;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: { origin: '*' } 
    });
    this.io.use(this.authenticate.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));
  }

  private authenticate(socket: Socket, next: (err?: Error) => void) {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) throw new Error('Authentication error: Token missing');

      const decoded = jwt.verify(token, config.backend.jwtSecret) as { id: string; tenantId: string };
      
      (socket as any).tenantId = decoded.tenantId;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  }

  private handleConnection(socket: Socket) {
    const tenantId = (socket as any).tenantId;
    socket.join(tenantId);
    
    logger.info(`🔌 Client connected to WebSocket room: ${tenantId}`);

    socket.on('disconnect', () => {
      logger.info(`🔌 Client disconnected from room: ${tenantId}`);
    });
  }
  public broadcastToTenant(tenantId: string, eventName: string, payload: any) {
    this.io.to(tenantId).emit(eventName, payload);
  }
}