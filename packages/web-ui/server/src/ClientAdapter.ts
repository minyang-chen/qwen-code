import type { GeminiClient as Client } from '@qwen-code/core';
import type { Socket } from 'socket.io';
import { nanoid } from 'nanoid';

export class ClientAdapter {
  constructor(private client: Client) {}

  async sendMessage(
    message: string,
    socket: Socket,
    signal?: AbortSignal,
  ): Promise<void> {
    try {
      const abortController = new AbortController();
      const promptId = nanoid();

      if (signal) {
        signal.addEventListener('abort', () => abortController.abort());
      }

      const stream = this.client.sendMessageStream(
        message,
        abortController.signal,
        promptId,
      );

      for await (const chunk of stream) {
        if (chunk.type === 'content' && chunk.value) {
          socket.emit('message:chunk', {
            type: 'text',
            data: { text: chunk.value },
          });
        }
      }

      socket.emit('message:complete');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        socket.emit('message:complete');
        return;
      }
      console.error('ClientAdapter error:', error);
      socket.emit('message:error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  getHistory() {
    return this.client.getHistory();
  }

  async compressHistory() {
    return this.client.compressHistory();
  }
}
