import type { Server as SocketServer, Socket } from 'socket.io';
import type { SessionManager } from './SessionManager.js';
import { ClientAdapter } from './ClientAdapter.js';
import { ToolExecutor } from './ToolExecutor.js';

async function extractTextFromPDF(base64Data: string): Promise<string> {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    return '';
  }
}

const activeRequests = new Map<string, AbortController>();

export function setupWebSocket(
  io: SocketServer,
  sessionManager: SessionManager,
) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on(
      'chat:message',
      async (data: {
        sessionId: string;
        message: string;
        files?: Array<{
          name: string;
          type: string;
          size: number;
          data: string;
        }>;
      }) => {
        const session = sessionManager.getSession(data.sessionId);
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        const abortController = new AbortController();
        activeRequests.set(socket.id, abortController);

        const toolExecutor = new ToolExecutor(session.config);
        const adapter = new ClientAdapter(session.client, toolExecutor);

        let finalMessage = data.message;

        // Extract text from PDF files
        if (data.files && data.files.length > 0) {
          const fileContents: string[] = [];

          for (const file of data.files) {
            if (file.type === 'application/pdf') {
              const base64Data = file.data.includes(',')
                ? file.data.split(',')[1]
                : file.data;

              const text = await extractTextFromPDF(base64Data);
              if (text) {
                fileContents.push(
                  `\n\n--- Content from ${file.name} ---\n${text}\n--- End of ${file.name} ---\n`,
                );
              }
            }
          }

          if (fileContents.length > 0) {
            finalMessage = `${data.message}\n${fileContents.join('\n')}`;
          }
        }

        await adapter.sendMessage(finalMessage, socket, abortController.signal);

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

      const toolExecutor = new ToolExecutor(session.config);
      const adapter = new ClientAdapter(session.client, toolExecutor);
      const history = adapter.getHistory();
      socket.emit('session:history', history);
    });

    socket.on('session:compress', async (data: { sessionId: string }) => {
      const session = sessionManager.getSession(data.sessionId);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      const toolExecutor = new ToolExecutor(session.config);
      const adapter = new ClientAdapter(session.client, toolExecutor);
      const result = await adapter.compressHistory();
      socket.emit('session:compressed', result);
    });

    socket.on('disconnect', () => {
      activeRequests.delete(socket.id);
      console.log('Client disconnected:', socket.id);
    });
  });
}
