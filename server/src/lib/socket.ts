import { Server } from 'socket.io';
import http from 'http';
import { config } from '../config';

let io: Server | null = null;
const userSockets = new Map<string, Set<string>>();

export function initSocket(server: http.Server): Server {
  io = new Server(server, {
    cors: { origin: config.clientUrl, credentials: true },
  });

  io.on('connection', (socket) => {
    const userId = (socket.handshake.query.userId as string) || '';
    if (userId) {
      if (!userSockets.has(userId)) userSockets.set(userId, new Set());
      userSockets.get(userId)!.add(socket.id);
      socket.join(`user:${userId}`);
    }
    socket.on('disconnect', () => {
      if (userId && userSockets.has(userId)) {
        userSockets.get(userId)!.delete(socket.id);
        if (userSockets.get(userId)!.size === 0) userSockets.delete(userId);
      }
    });
  });

  return io;
}

export function getIo(): Server | null {
  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown): void {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}
