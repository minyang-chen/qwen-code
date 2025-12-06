import type { Server as SocketServer, Socket } from 'socket.io';
import type { SessionManager } from './SessionManager.js';
import { ClientAdapter } from './ClientAdapter.js';

const activeRequests = new Map<string, AbortController>();

export function setupWebSocket(
  io: SocketServer,
  sessionManager: SessionManager,
) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on(
      'chat:message',
      async (data: { sessionId: string; message: string }) => {
        const session = sessionManager.getSession(data.sessionId);
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        const abortController = new AbortController();
        activeRequests.set(socket.id, abortController);

        const adapter = new ClientAdapter(session.client);
        await adapter.sendMessage(data.message, socket, abortController.signal);

        activeRequests.delete(socket.id);
      },
    );

    socket.on('chat:cancel', () => {
      const abortController = activeRequests.get(socket.id);
      if (abortController) {
        abortController.abort();
        activeRequests.delete(socket.id);
        socket.emit('message:complete');
      }
    });

    socket.on('session:history', async (data: { sessionId: string }) => {
      const session = sessionManager.getSession(data.sessionId);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      const adapter = new ClientAdapter(session.client);
      const history = adapter.getHistory();
      socket.emit('session:history', history);
    });

    socket.on('session:compress', async (data: { sessionId: string }) => {
      const session = sessionManager.getSession(data.sessionId);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      const adapter = new ClientAdapter(session.client);
      await adapter.compressHistory();
      socket.emit('session:compressed');
    });

    socket.on('disconnect', () => {
      activeRequests.delete(socket.id);
      console.log('Client disconnected:', socket.id);
    });
  });
}
