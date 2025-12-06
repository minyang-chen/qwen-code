import type { GeminiClient as Client } from '@qwen-code/core';
import type { Socket } from 'socket.io';
import { nanoid } from 'nanoid';
import type { ToolCallRequestInfo } from '@qwen-code/core';
import { ToolExecutor } from './ToolExecutor.js';

type Part = { text?: string; inlineData?: { mimeType: string; data: string } };

export class ClientAdapter {
  private toolExecutor: ToolExecutor;

  constructor(
    private client: Client,
    toolExecutor: ToolExecutor,
  ) {
    this.toolExecutor = toolExecutor;
  }

  async sendMessage(
    message: string | Part[],
    socket: Socket,
    signal?: AbortSignal,
    isContinuation: boolean = false,
  ): Promise<void> {
    try {
      const abortController = new AbortController();
      const promptId = nanoid();
      const toolCallNames = new Map<string, string>();
      const toolRequests: ToolCallRequestInfo[] = [];

      if (signal) {
        signal.addEventListener('abort', () => abortController.abort());
      }

      const stream = this.client.sendMessageStream(
        message,
        abortController.signal,
        promptId,
        { isContinuation },
      );

      for await (const chunk of stream) {
        if (chunk.type === 'content' && chunk.value) {
          socket.emit('message:chunk', {
            type: 'text',
            data: { text: chunk.value },
          });
        } else if (chunk.type === 'tool_call_request') {
          toolCallNames.set(chunk.value.callId, chunk.value.name);
          toolRequests.push(chunk.value);
          socket.emit('tool:call', {
            name: chunk.value.name,
            args: chunk.value.args,
          });
        } else if (chunk.type === 'tool_call_response') {
          const result = chunk.value.resultDisplay
            ? typeof chunk.value.resultDisplay === 'string'
              ? chunk.value.resultDisplay
              : JSON.stringify(chunk.value.resultDisplay)
            : chunk.value.error?.message || 'Tool execution completed';

          socket.emit('tool:response', {
            name: toolCallNames.get(chunk.value.callId) || 'unknown',
            result,
          });
        }
      }

      // Execute tools if any were requested
      if (toolRequests.length > 0 && !abortController.signal.aborted) {
        const toolResults = await this.toolExecutor.executeTools(
          toolRequests,
          abortController.signal,
        );

        // Emit tool results to frontend
        for (const result of toolResults) {
          const toolName = toolCallNames.get(result.callId) || 'unknown';
          const resultText = result.resultDisplay
            ? typeof result.resultDisplay === 'string'
              ? result.resultDisplay
              : JSON.stringify(result.resultDisplay)
            : result.error?.message || 'Tool execution completed';

          socket.emit('tool:response', {
            name: toolName,
            result: resultText,
          });
        }

        // Submit tool responses back to continue conversation
        const responseParts = toolResults.flatMap((r) => r.responseParts);

        await this.sendMessage(responseParts, socket, signal, true);
        return;
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
    const promptId = nanoid();
    return this.client.tryCompressChat(promptId, true);
  }
}
