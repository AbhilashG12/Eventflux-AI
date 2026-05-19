import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';

export class SocketManager {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    const token = useAuthStore.getState().token;
    if (!token) return;

    this.socket = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('🟢 WebSocket Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('🔴 WebSocket Disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(event: string, callback: (data: any) => void) {
    if (!this.socket) this.connect();
    this.socket?.on(event, callback);
  }

  unsubscribe(event: string) {
    this.socket?.off(event);
  }
}

export const socketClient = new SocketManager();