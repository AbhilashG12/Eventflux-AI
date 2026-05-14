import { create } from 'zustand';

interface SocketMessage {
  nodeId: string;
  status: string;
  timestamp?: string;
}

interface SocketStore {
  lastMessage: SocketMessage | null;
  setLastMessage: (msg: SocketMessage) => void;
  clearMessage: () => void;
}

export const useSocketStore = create<SocketStore>((set) => ({
  lastMessage: null,
  setLastMessage: (msg) => set({ lastMessage: msg }),
  
  clearMessage: () => set({ lastMessage: null }),
}));