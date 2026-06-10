import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';

export class SocketManager {
  private socket: Socket | null = null;

  connect() {

    if (this.socket) return this.socket;

    const token = useAuthStore.getState().token;
    if (!token) {
      console.warn('🟡 [Socket] Connection aborted: No auth token found.');
      return null;
    }

    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    
    console.log('🟡 [Socket] Initializing Singleton Connection...');
    this.socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket'], // Force WebSockets to skip long-polling overhead
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('🟢 [Socket] Connected to Engine:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('🔴 [Socket] Disconnected from Engine.');
    });

    this.socket.on('connect_error', (err) => {
      console.error('🔴 [Socket] Connection Error:', err.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // 🚀 THE FIX: Mandate a specific callback reference for safe pub/sub
  subscribe(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) this.connect();
    this.socket?.on(event, callback);
  }

  // 🚀 THE FIX: Require the exact same callback to unsubscribe, protecting other listeners
  unsubscribe(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  // Helper method in case you need to push data back to the server later
  emit(event: string, data: any) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }
}

// Export a single, immutable instance
export const socketClient = new SocketManager();