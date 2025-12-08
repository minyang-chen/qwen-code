import type { Server as SocketServer, Socket } from 'socket.io';
import type { SessionManager } from './SessionManager.js';
import { ClientAdapter } from './ClientAdapter.js';
import { SandboxedToolExecutor } from './SandboxedToolExecutor.js';
import { SandboxManager } from './SandboxManager.js';
import { SANDBOX_ENABLED, SESSION_TOKEN_LIMIT } from './config.js';

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
const sandboxManager = new SandboxManager();

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

        // Get or create sandbox for user
        const sandbox = SANDBOX_ENABLED
          ? await sandboxManager.getSandbox(
              session.userId,
              session.config.getWorkingDir(),
            )
          : null;

        // Update activity
        if (sandbox) {
          sandboxManager.updateActivity(session.userId);
        }

        const toolExecutor = new SandboxedToolExecutor(
          session.config,
          session.userId,
          sandbox,
        );
        const adapter = new ClientAdapter(
          session.client,
          toolExecutor,
          (inputTokens, outputTokens) => {
            sessionManager.updateTokenUsage(
              data.sessionId,
              inputTokens,
              outputTokens,
            );
          },
        );

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

        // Check token usage and warn if approaching limit
        if (session) {
          const usage = session.tokenUsage.totalTokens;
          const percentage = usage / SESSION_TOKEN_LIMIT;

          if (percentage >= 0.8 && percentage < 0.9) {
            socket.emit('message:chunk', {
              type: 'system',
              data: {
                text:
                  '\n\n⚠️ Token usage at ' +
                  Math.round(percentage * 100) +
                  '%. Consider using /compress to reduce context size.',
              },
            });
          } else if (percentage >= 0.9) {
            socket.emit('message:chunk', {
              type: 'system',
              data: {
                text:
                  '\n\n🚨 Token usage at ' +
                  Math.round(percentage * 100) +
                  '%! Use /compress soon to avoid hitting the limit.',
              },
            });
          }
        }

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

      const sandbox = SANDBOX_ENABLED
        ? await sandboxManager.getSandbox(
            session.userId,
            session.config.getWorkingDir(),
          )
        : null;
      const toolExecutor = new SandboxedToolExecutor(
        session.config,
        session.userId,
        sandbox,
      );
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

      const sandbox = SANDBOX_ENABLED
        ? await sandboxManager.getSandbox(
            session.userId,
            session.config.getWorkingDir(),
          )
        : null;
      const toolExecutor = new SandboxedToolExecutor(
        session.config,
        session.userId,
        sandbox,
      );
      const adapter = new ClientAdapter(session.client, toolExecutor);
      const result = await adapter.compressHistory();
      socket.emit('session:compressed', result);
    });

    socket.on(
      'chat:command',
      async (data: { sessionId: string; command: string }) => {
        const session = sessionManager.getSession(data.sessionId);
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        const command = data.command.toLowerCase();
        const parts = data.command.split(' ');
        const cmd = parts[0].toLowerCase();

        // Get sandbox
        const sandbox = SANDBOX_ENABLED
          ? await sandboxManager.getSandbox(
              session.userId,
              session.config.getWorkingDir(),
            )
          : null;

        if (cmd === '/my_sandbox' && sandbox) {
          try {
            const info = await sandbox.getSandboxInfo();
            socket.emit('message:chunk', {
              type: 'text',
              data: {
                text: `🐳 **Sandbox Information:**
- **Container:** \`${info.containerName}\`
- **Image:** \`${info.image}\`
- **Status:** ${info.status}
- **Workspace:** \`${info.workspaceDir}\`
- **User ID:** \`${info.userId}\`
- **Uptime:** ${info.uptime || 'N/A'}
- **Memory Limit:** ${info.memory || 'N/A'}
- **CPU Limit:** ${info.cpu || 'N/A'}`,
              },
            });
          } catch (error) {
            socket.emit('message:chunk', {
              type: 'text',
              data: {
                text: `❌ **Error:** ${error instanceof Error ? error.message : 'Failed to get sandbox info'}`,
              },
            });
          }
          socket.emit('message:complete');
        } else if (cmd === '/restart_sandbox' && sandbox) {
          try {
            await sandbox.restart();
            socket.emit('message:chunk', {
              type: 'text',
              data: {
                text: `🐳 **Sandbox Restarted:** Container has been restarted`,
              },
            });
          } catch (error) {
            socket.emit('message:chunk', {
              type: 'text',
              data: {
                text: `❌ **Error:** ${error instanceof Error ? error.message : 'Failed to restart sandbox'}`,
              },
            });
          }
          socket.emit('message:complete');
        } else if (cmd === '/reset_sandbox' && sandbox) {
          try {
            await sandbox.reset();
            socket.emit('message:chunk', {
              type: 'text',
              data: {
                text: `🐳 **Sandbox Reset:** Container has been reset to clean state`,
              },
            });
          } catch (error) {
            socket.emit('message:chunk', {
              type: 'text',
              data: {
                text: `❌ **Error:** ${error instanceof Error ? error.message : 'Failed to reset sandbox'}`,
              },
            });
          }
          socket.emit('message:complete');
        } else if (cmd === '/save_sandbox' && sandbox) {
          try {
            const snapshotName = parts[1] || undefined;
            const savedName = await sandbox.save(snapshotName);
            socket.emit('message:chunk', {
              type: 'text',
              data: { text: `🐳 **Sandbox Saved:** \`${savedName}\`` },
            });
          } catch (error) {
            socket.emit('message:chunk', {
              type: 'text',
              data: {
                text: `❌ **Error:** ${error instanceof Error ? error.message : 'Failed to save sandbox'}`,
              },
            });
          }
          socket.emit('message:complete');
        } else if (cmd === '/load_sandbox' && sandbox) {
          try {
            const snapshotName = parts[1];
            if (!snapshotName) {
              socket.emit('message:chunk', {
                type: 'text',
                data: {
                  text: `❌ **Error:** Please specify snapshot name. Use \`/list_snapshots\` to see available snapshots.`,
                },
              });
            } else {
              await sandbox.load(snapshotName);
              socket.emit('message:chunk', {
                type: 'text',
                data: { text: `🐳 **Sandbox Loaded:** \`${snapshotName}\`` },
              });
            }
          } catch (error) {
            socket.emit('message:chunk', {
              type: 'text',
              data: {
                text: `❌ **Error:** ${error instanceof Error ? error.message : 'Failed to load sandbox'}`,
              },
            });
          }
          socket.emit('message:complete');
        } else if (cmd === '/list_snapshots' && sandbox) {
          try {
            const snapshots = await sandbox.listSnapshots();
            if (snapshots.length === 0) {
              socket.emit('message:chunk', {
                type: 'text',
                data: { text: `🐳 **Snapshots:** No saved snapshots found` },
              });
            } else {
              socket.emit('message:chunk', {
                type: 'text',
                data: {
                  text: `🐳 **Available Snapshots:**\n${snapshots.map((s) => `- \`${s}\``).join('\n')}`,
                },
              });
            }
          } catch (error) {
            socket.emit('message:chunk', {
              type: 'text',
              data: {
                text: `❌ **Error:** ${error instanceof Error ? error.message : 'Failed to list snapshots'}`,
              },
            });
          }
          socket.emit('message:complete');
        } else if (command === '/directory') {
          socket.emit('message:chunk', {
            type: 'text',
            data: {
              text: `📁 **Current Directory:** \`${session.config.getWorkingDir()}\``,
            },
          });
          socket.emit('message:complete');
        } else if (command === '/memory') {
          const memUsage = process.memoryUsage();
          const formatMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(2);
          socket.emit('message:chunk', {
            type: 'text',
            data: {
              text: `💾 **Memory Usage:**\n- RSS: ${formatMB(memUsage.rss)} MB\n- Heap Used: ${formatMB(memUsage.heapUsed)} MB\n- Heap Total: ${formatMB(memUsage.heapTotal)} MB\n- External: ${formatMB(memUsage.external)} MB`,
            },
          });
          socket.emit('message:complete');
        } else if (command === '/tools') {
          socket.emit('message:chunk', {
            type: 'text',
            data: {
              text: `🔧 **Available Tools:**\n- fs_read\n- fs_write\n- execute_bash\n- web_search\n- web_fetch`,
            },
          });
          socket.emit('message:complete');
        } else if (command === '/extensions') {
          socket.emit('message:chunk', {
            type: 'text',
            data: { text: `🧩 **Extensions:** No extensions loaded` },
          });
          socket.emit('message:complete');
        } else if (command === '/mcp') {
          socket.emit('message:chunk', {
            type: 'text',
            data: { text: `🔌 **MCP Servers:** No MCP servers configured` },
          });
          socket.emit('message:complete');
        } else {
          socket.emit('message:chunk', {
            type: 'text',
            data: { text: `❌ Unknown command: ${command}` },
          });
          socket.emit('message:complete');
        }
      },
    );

    socket.on('disconnect', () => {
      activeRequests.delete(socket.id);
      console.log('Client disconnected:', socket.id);
    });
  });
}
