import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api';
import type { Notification } from '@/types';

let socket: Socket | null = null;

export function connectSocket(userId: string): Socket {
  if (socket) return socket;
  socket = io('/', {
    query: { userId },
    transports: ['websocket', 'polling'],
    auth: { token: getAccessToken() },
  });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function onNotification(cb: (notification: Notification) => void): () => void {
  socket?.on('notification', cb);
  return () => socket?.off('notification', cb);
}
