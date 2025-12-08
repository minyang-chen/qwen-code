import { ToolExecutor } from './ToolExecutor.js';
import { DockerSandbox } from './DockerSandbox.js';
import type { Config } from '@qwen-code/core';
import type {
  ToolCallRequestInfo,
  ToolCallResponseInfo,
} from '@qwen-code/core';

export class SandboxedToolExecutor extends ToolExecutor {
  private sandbox: DockerSandbox | null = null;
  private userId: string;

  constructor(config: Config, userId: string, sandbox: DockerSandbox | null) {
    super(config);
    this.userId = userId;
    this.sandbox = sandbox;

    if (sandbox) {
      console.log('🐳 Using Docker sandbox for user:', userId);
    }
  }

  async executeTools(
    toolRequests: ToolCallRequestInfo[],
    signal: AbortSignal,
  ): Promise<ToolCallResponseInfo[]> {
    if (!this.sandbox) {
      return super.executeTools(toolRequests, signal);
    }

    console.log('🐳 Tool requests:', JSON.stringify(toolRequests, null, 2));

    const modifiedRequests = await Promise.all(
      toolRequests.map(async (request) => {
        // Intercept run_shell_command for all shell commands
        if (
          request.name === 'run_shell_command' ||
          request.name === 'execute_bash'
        ) {
          const command =
            request.input?.command ||
            (request as { args?: { command?: string } }).args?.command;

          if (!command) {
            console.error('🐳 No command found in request:', request);
            return request;
          }

          console.log('🐳 Executing in sandbox:', command);

          try {
            // Execute in /workspace (container's working directory)
            const result = await this.sandbox!.execute(command, signal);

            return {
              ...request,
              _sandboxResult: {
                output: result.stdout || result.stderr,
                exitCode: result.exitCode,
              },
            };
          } catch (error) {
            console.error('Sandbox execution error:', error);
            return {
              ...request,
              _sandboxResult: {
                output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                exitCode: 1,
              },
            };
          }
        }

        // Intercept fs_write for code files - ensure they're written to workspace
        if (
          request.name === 'fs_write' &&
          request.input?.path &&
          this.isCodeFile(request.input.path as string)
        ) {
          console.log(
            '🐳 Writing code file to sandbox workspace:',
            request.input.path,
          );
        }

        return request;
      }),
    );

    interface RequestWithSandboxResult extends ToolCallRequestInfo {
      _sandboxResult?: {
        output: string;
        exitCode: number;
      };
    }

    // Check if we handled any sandbox executions
    const sandboxResults = (
      modifiedRequests as RequestWithSandboxResult[]
    ).filter((r) => r._sandboxResult);
    if (sandboxResults.length > 0) {
      const results = sandboxResults.map((r) => ({
        callId: r.callId,
        responseParts: [
          {
            functionResponse: {
              id: r.callId,
              name: r.name,
              response: {
                output: r._sandboxResult!.output,
              },
            },
          },
        ],
        resultDisplay: r._sandboxResult!.output,
      }));
      console.log(
        '🐳 Returning sandbox results:',
        JSON.stringify(results, null, 2),
      );
      return results;
    }

    // Fall back to normal execution for non-bash tools
    return super.executeTools(toolRequests, signal);
  }

  private isCodeFile(path: string): boolean {
    const codeExtensions = [
      '.py',
      '.js',
      '.ts',
      '.java',
      '.cpp',
      '.c',
      '.go',
      '.rs',
      '.rb',
      '.php',
      '.sh',
    ];
    return codeExtensions.some((ext) => path.endsWith(ext));
  }

  getSandbox(): DockerSandbox | null {
    return this.sandbox;
  }
}
