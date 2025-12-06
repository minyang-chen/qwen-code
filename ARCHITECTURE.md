# Qwen Code - Architecture Documentation

**Version:** 0.3.0  
**Last Updated:** December 4, 2025

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Package Structure](#package-structure)
4. [Core Components](#core-components)
5. [Data Flow](#data-flow)
6. [Key Design Patterns](#key-design-patterns)
7. [Technology Stack](#technology-stack)

---

## Executive Summary

Qwen Code is an AI-powered CLI tool adapted from Google Gemini CLI, optimized for Qwen3-Coder models. It provides developers with intelligent code assistance through a terminal interface, supporting multiple authentication methods, extensible tool systems, and advanced features like vision model support and subagent delegation.

### Key Capabilities

- **Code Understanding**: Query and edit large codebases beyond context limits
- **Task Automation**: Automate PR handling, rebases, and operational tasks
- **Multi-Modal Support**: Automatic vision model switching for image inputs
- **Extensible Tools**: File operations, shell execution, web search, MCP integration
- **Session Management**: Token tracking, history compression, checkpointing

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interfaces                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Terminal   │  │  VS Code     │  │   Zed IDE    │         │
│  │     CLI      │  │  Extension   │  │  Integration │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      CLI Package Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  UI Layer (React/Ink)                                    │  │
│  │  - AppContainer, Components, Themes, Contexts            │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Configuration Management                                │  │
│  │  - Settings, Extensions, Key Bindings, Trusted Folders   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Services                                                │  │
│  │  - Command Service, Prompt Loaders, File Commands        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      Core Package Layer                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Core Logic                                              │  │
│  │  - Client, ContentGenerator, GeminiChat, Turn Manager   │  │
│  │  - Token Limits, Prompts, Tool Scheduler                │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Authentication Layer                                    │  │
│  │  - Qwen OAuth2, Code Assist OAuth, OpenAI Compatible    │  │
│  │  - Token Management, Credential Storage                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tool System                                             │  │
│  │  - Tool Registry, Tool Scheduler, Tool Implementations   │  │
│  │  - File Tools, Shell Tools, Web Tools, MCP Tools        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Services Layer                                          │  │
│  │  - Shell Execution, File Discovery, Git Service         │  │
│  │  - Chat Recording, Compression, Loop Detection          │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Subagent System                                         │  │
│  │  - Subagent Manager, Built-in Agents, Validation        │  │
│  │  - Event System, Statistics, Hooks                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    External Services Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Qwen API    │  │  OpenAI API  │  │  Web Search  │         │
│  │  (OAuth)     │  │  Compatible  │  │   Services   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  MCP Servers │  │  Git Repos   │  │  File System │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Input → CLI UI → Core Client → Content Generator → API
                ↓                           ↓
         Tool Scheduler ← Tool Registry ← Tool Call
                ↓
         Tool Execution → Result → API → Response → UI
```

---

## Package Structure

### Monorepo Organization

```
qwen-code/
├── packages/
│   ├── cli/                    # CLI interface package
│   ├── core/                   # Core business logic
│   ├── vscode-ide-companion/   # VS Code extension
│   └── test-utils/             # Shared test utilities
├── integration-tests/          # End-to-end tests
├── scripts/                    # Build and utility scripts
├── docs/                       # Documentation
└── dist/                       # Build output
```

### Package Dependencies

```
┌─────────────────────────────────────────┐
│              CLI Package                │
│  - UI Components (React/Ink)            │
│  - Configuration Management             │
│  - Command Handlers                     │
└─────────────────┬───────────────────────┘
                  │ depends on
                  ↓
┌─────────────────────────────────────────┐
│             Core Package                │
│  - Business Logic                       │
│  - API Integration                      │
│  - Tool System                          │
│  - Services                             │
└─────────────────────────────────────────┘
```

---

## Core Components

### 1. CLI Package (`packages/cli`)

#### 1.1 UI Layer

**Location**: `src/ui/`

**Components**:

- `AppContainer.tsx`: Main application orchestrator
- `components/`: Reusable UI components
  - Chat interface components
  - Tool approval dialogs
  - Status indicators
  - Error displays
- `themes/`: Theme definitions and management
- `contexts/`: React contexts
  - `SettingsContext`: Global settings
  - `SessionContext`: Session state

**Key Features**:

- Terminal-based UI using React/Ink
- Real-time streaming response rendering
- Interactive tool approval
- Keyboard shortcut handling
- Theme customization

#### 1.2 Configuration System

**Location**: `src/config/`

**Components**:

- `config.ts`: CLI configuration loader
- `settings.ts`: User settings management
- `settingsSchema.ts`: Settings validation schema
- `extension.ts`: Extension system
- `keyBindings.ts`: Keyboard shortcuts
- `trustedFolders.ts`: Folder access control

**Configuration Hierarchy**:

1. Command-line arguments (highest priority)
2. Environment variables
3. Project `.env` file
4. User settings (`~/.qwen/settings.json`)
5. Default values (lowest priority)

#### 1.3 Services

**Location**: `src/services/`

**Components**:

- `CommandService.ts`: Command orchestration
- `McpPromptLoader.ts`: MCP prompt loading
- `FileCommandLoader.ts`: File-based command loading
- `BuiltinCommandLoader.ts`: Built-in command loading

#### 1.4 Non-Interactive Mode

**Location**: `src/nonInteractive/`

**Components**:

- `session.ts`: Non-interactive session management
- `control/`: Control flow for non-interactive execution
- `io/`: Input/output handling

**Features**:

- Batch processing
- Automated tool approval
- JSON output format
- Exit code handling

### 2. Core Package (`packages/core`)

#### 2.1 Core Logic

**Location**: `src/core/`

**Components**:

- `client.ts`: Main client orchestrator
- `contentGenerator.ts`: Content generation abstraction
- `geminiChat.ts`: Gemini API integration
- `turn.ts`: Conversation turn management
- `prompts.ts`: Prompt construction
- `tokenLimits.ts`: Token management
- `coreToolScheduler.ts`: Tool execution scheduling
- `logger.ts`: Logging system

**Client Responsibilities**:

- Manage conversation state
- Coordinate tool execution
- Handle API communication
- Track token usage
- Manage history compression

#### 2.2 Authentication System

**Location**: `src/qwen/`, `src/code_assist/`

**Implementations**:

1. **Qwen OAuth2** (`qwenOAuth2.ts`)
   - Browser-based OAuth flow
   - Token caching and refresh
   - 2,000 requests/day quota
   - 60 requests/minute rate limit

2. **OpenAI Compatible** (`openaiContentGenerator/`)
   - API key authentication
   - Multiple provider support
   - Custom endpoint configuration

3. **Code Assist OAuth** (`code_assist/oauth2.ts`)
   - Google Code Assist integration
   - OAuth2 flow
   - Token management

**Token Management**:

- `sharedTokenManager.ts`: Centralized token management
- Automatic refresh
- Secure storage
- Expiration handling

#### 2.3 Tool System

**Location**: `src/tools/`

**Architecture**:

```typescript
interface Tool {
  name: string;
  description: string;
  parameters: ToolParameters;
  execute(args: unknown, context: ToolContext): Promise<ToolResult>;
}
```

**Tool Categories**:

1. **File Operations**
   - `read-file.ts`: Read file contents
   - `write-file.ts`: Write/create files
   - `read-many-files.ts`: Batch file reading
   - `ls.ts`: Directory listing
   - `glob.ts`: Pattern-based file search

2. **File Editing**
   - `edit.ts`: Line-based editing
   - `smart-edit.ts`: Intelligent editing with LLM assistance

3. **Search Tools**
   - `grep.ts`: Text search in files
   - `ripGrep.ts`: Fast recursive search

4. **Shell Tools**
   - `shell.ts`: Execute shell commands
   - PTY support for interactive commands
   - Output streaming

5. **Web Tools**
   - `web-fetch.ts`: Fetch web content
   - `web-search/`: Web search integration

6. **Task Management**
   - `task.ts`: Task execution
   - `todoWrite.ts`: TODO list management

7. **Memory/Context**
   - `memoryTool.ts`: Context persistence and retrieval

8. **MCP Integration**
   - `mcp-client.ts`: MCP server communication
   - `mcp-tool.ts`: MCP tool wrapper
   - `mcp-client-manager.ts`: MCP client lifecycle

**Tool Registry**:

- Central registration system
- Tool discovery
- Parameter validation
- Tool metadata management

**Tool Scheduler**:

- Execution orchestration
- User approval workflow
- Parallel execution support
- Error handling and retry

#### 2.4 Services

**Location**: `src/services/`

**Components**:

1. **Shell Execution Service** (`shellExecutionService.ts`)
   - Command execution
   - PTY support
   - Output capture
   - Timeout handling

2. **File Discovery Service** (`fileDiscoveryService.ts`)
   - BFS file search
   - Ignore pattern support
   - Caching

3. **Git Service** (`gitService.ts`)
   - Git operations
   - Repository detection
   - Commit history

4. **Chat Recording Service** (`chatRecordingService.ts`)
   - Conversation persistence
   - Replay capability
   - Export formats

5. **Chat Compression Service** (`chatCompressionService.ts`)
   - History summarization
   - Token optimization
   - Context preservation

6. **Loop Detection Service** (`loopDetectionService.ts`)
   - Infinite loop detection
   - Pattern recognition
   - Automatic termination

#### 2.5 Subagent System

**Location**: `src/subagents/`

**Components**:

- `subagent-manager.ts`: Orchestration
- `subagent.ts`: Individual agent implementation
- `builtin-agents.ts`: Predefined agents
- `validation.ts`: Agent validation
- `subagent-events.ts`: Event system
- `subagent-statistics.ts`: Performance tracking

**Subagent Lifecycle**:

```
Create → Initialize → Execute → Report → Terminate
```

**Features**:

- Isolated context
- Specific tool access
- Independent conversation history
- Result aggregation
- Error isolation

#### 2.6 Utilities

**Location**: `src/utils/`

**Key Utilities**:

- `fileUtils.ts`: File operations
- `paths.ts`: Path handling
- `shell-utils.ts`: Shell utilities
- `retry.ts`: Retry logic
- `errorParsing.ts`: Error parsing
- `gitUtils.ts`: Git utilities
- `ignorePatterns.ts`: Ignore pattern handling
- `editor.ts`: Text editing utilities
- `terminalSerializer.ts`: Terminal output serialization

### 3. VS Code IDE Companion (`packages/vscode-ide-companion`)

**Purpose**: VS Code integration

**Features**:

- Extension activation
- IDE context provider
- File system integration
- Communication with CLI

### 4. Test Utils (`packages/test-utils`)

**Purpose**: Shared testing utilities

**Components**:

- Mock implementations
- Test helpers
- Fixtures

---

## Data Flow

### Interactive Session Flow

```
1. User Input
   ↓
2. CLI: Parse input, load context
   ↓
3. CLI: Send to Core Client
   ↓
4. Core: Construct prompt with history
   ↓
5. Core: Send to Content Generator
   ↓
6. Content Generator: API request
   ↓
7. API: Process request
   ↓
8. API: Return response (text or tool call)
   ↓
9. Core: Process response
   ↓
10. [If tool call]
    ↓
11. Core: Schedule tool execution
    ↓
12. CLI: Request user confirmation
    ↓
13. User: Approve/Reject
    ↓
14. Core: Execute tool
    ↓
15. Core: Send result to API
    ↓
16. [Loop to step 7]
    ↓
17. [If text response]
    ↓
18. Core: Return to CLI
    ↓
19. CLI: Render response
    ↓
20. User: Next input
```

### Tool Execution Flow

```
Model Request
    ↓
Tool Scheduler
    ↓
Validate Tool Exists
    ↓
Check Approval Required
    ↓
[If approval needed]
    ↓
Request User Approval
    ↓
[If approved]
    ↓
Execute Tool
    ↓
Capture Result
    ↓
Return to Model
```

### Authentication Flow (Qwen OAuth)

```
1. User initiates authentication
   ↓
2. CLI opens browser to OAuth endpoint
   ↓
3. User authenticates with qwen.ai
   ↓
4. OAuth callback returns tokens
   ↓
5. Tokens cached locally
   ↓
6. Automatic refresh on expiration
```

---

## Key Design Patterns

### 1. Strategy Pattern

**Usage**: Content Generation

```typescript
interface ContentGenerator {
  generateContent(
    request: GenerateContentRequest,
  ): Promise<GenerateContentResponse>;
  generateContentStream(
    request: GenerateContentRequest,
  ): AsyncIterable<GenerateContentResponse>;
}

// Implementations:
// - QwenContentGenerator
// - OpenAIContentGenerator
// - LoggingContentGenerator (decorator)
```

### 2. Registry Pattern

**Usage**: Tool System

```typescript
class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  register(tool: Tool): void;
  get(name: string): Tool | undefined;
  list(): Tool[];
}
```

### 3. Observer Pattern

**Usage**: Event System

```typescript
class SubagentEventEmitter {
  on(event: string, handler: Function): void;
  emit(event: string, data: any): void;
}
```

### 4. Decorator Pattern

**Usage**: Logging, Retry Logic

```typescript
class LoggingContentGenerator implements ContentGenerator {
  constructor(private wrapped: ContentGenerator) {}

  async generateContent(request: GenerateContentRequest) {
    logger.log('Request:', request);
    const response = await this.wrapped.generateContent(request);
    logger.log('Response:', response);
    return response;
  }
}
```

### 5. Factory Pattern

**Usage**: Client Creation

```typescript
function createClient(config: Config): Client {
  const contentGenerator = createContentGenerator(config);
  const toolRegistry = createToolRegistry(config);
  return new Client(contentGenerator, toolRegistry, config);
}
```

### 6. Command Pattern

**Usage**: CLI Commands

```typescript
interface Command {
  name: string;
  execute(context: CommandContext): Promise<void>;
}
```

---

## Technology Stack

### Core Technologies

- **Runtime**: Node.js >=20.0.0
- **Language**: TypeScript
- **UI Framework**: React + Ink (terminal UI)
- **Build Tool**: esbuild
- **Test Framework**: Vitest
- **Package Manager**: npm

### Key Dependencies

**CLI Package**:

- `ink`: Terminal UI framework
- `react`: UI library
- `yargs`: CLI argument parsing
- `dotenv`: Environment variable loading
- `chalk`: Terminal styling

**Core Package**:

- `openai`: OpenAI API client
- `simple-git`: Git operations
- `@modelcontextprotocol/sdk`: MCP integration
- `zod`: Schema validation
- `tiktoken`: Token counting

**Development**:

- `typescript`: Type system
- `eslint`: Linting
- `prettier`: Code formatting
- `vitest`: Testing
- `husky`: Git hooks

### Optional Dependencies

- `node-pty`: Terminal emulation
- `@lydell/node-pty`: Platform-specific PTY bindings

---

## Security Considerations

### 1. Trusted Folders

**Mechanism**:

- User must approve folder access
- Approval persisted in settings
- Validation on file operations

**Implementation**: `packages/cli/src/config/trustedFolders.ts`

### 2. Tool Execution Approval

**Categories**:

- **Read-only**: Auto-approved (configurable)
- **Write operations**: User confirmation required
- **Shell commands**: User confirmation required

**Configuration**: Settings file

### 3. Credential Storage

**OAuth Tokens**:

- Encrypted local storage
- Automatic refresh
- Secure deletion on logout

**API Keys**:

- Environment variables
- Settings file (user-managed)
- Never logged or transmitted

### 4. Sandbox Mode

**Purpose**: Isolated execution environment

**Implementations**:

- Docker container
- Podman container
- macOS sandbox profiles

**Configuration**: `--sandbox` flag

---

## Performance Optimizations

### 1. Token Caching

**Purpose**: Reduce redundant API calls

**Mechanism**: Cache prompt prefixes

### 2. Streaming Responses

**Purpose**: Immediate feedback

**Implementation**: Server-sent events from API

### 3. Parallel Tool Execution

**Purpose**: Faster multi-tool operations

**Limitation**: Independent tools only

### 4. File Search Optimization

**Tools**:

- BFS file search
- ripgrep integration
- Ignore pattern caching

### 5. History Compression

**Trigger**: Approaching token limit

**Process**:

1. Identify compressible content
2. Summarize older turns
3. Preserve recent context
4. Update conversation history

---

## Error Handling

### Error Categories

1. **API Errors**
   - Rate limits
   - Quota exceeded
   - Network failures
   - Invalid responses

2. **Tool Errors**
   - Execution failures
   - Invalid arguments
   - Permission denied
   - Timeout

3. **Configuration Errors**
   - Invalid settings
   - Missing credentials
   - Invalid extensions

4. **User Errors**
   - Invalid input
   - Cancelled operations

### Retry Logic

**Implementation**: `packages/core/src/utils/retry.ts`

**Strategy**: Exponential backoff

**Configuration**: Per-error type

### Fallback Strategies

**Model Fallback**: Switch to alternative model on error

**Tool Fallback**: Alternative tool implementations

### Loop Detection

**Purpose**: Prevent infinite tool execution loops

**Mechanism**: Pattern detection in tool calls

**Action**: Terminate and notify user

---

## Testing Strategy

### Unit Tests

**Framework**: Vitest

**Coverage**: Core logic, utilities, services

**Location**: `*.test.ts` files alongside source

**Example**:

```typescript
describe('ToolRegistry', () => {
  it('should register and retrieve tools', () => {
    const registry = new ToolRegistry();
    const tool = createMockTool('test-tool');
    registry.register(tool);
    expect(registry.get('test-tool')).toBe(tool);
  });
});
```

### Integration Tests

**Location**: `integration-tests/`

**Scenarios**:

- File operations
- Shell execution
- MCP integration
- Extension loading
- Web search

### Terminal Bench

**Purpose**: Benchmark against standard tasks

**Location**: `integration-tests/terminal-bench/`

**Results**: Tracked in README

---

## Deployment

### Distribution Methods

1. **npm**: `npm install -g @qwen-code/qwen-code`
2. **Homebrew**: `brew install qwen-code`
3. **Docker**: `ghcr.io/qwenlm/qwen-code`
4. **Source**: Clone and build

### Build Process

**Script**: `npm run build`

**Steps**:

1. TypeScript compilation
2. Bundle with esbuild
3. Copy assets
4. Generate version info

**Output**: `dist/` directory

### Release Process

**Versioning**: Semantic versioning

**Workflow**: GitHub Actions

**Steps**:

1. Version bump
2. Build all packages
3. Run tests
4. Publish to npm
5. Create GitHub release
6. Build Docker image

---

## Monitoring & Telemetry

### Telemetry System

**Purpose**: Usage analytics, error tracking

**Implementation**: `packages/core/src/telemetry/`

**Data Collected**:

- Command usage
- Tool execution
- Error occurrences
- Performance metrics

**Privacy**: Opt-in, anonymized

### Logging

**Levels**: Debug, Info, Warn, Error

**Destinations**:

- Console (development)
- File (production)
- Telemetry service

**Configuration**: Environment variables

---

## Future Enhancements

### Planned Features

- Enhanced code understanding
- Multi-repository support
- Advanced refactoring tools
- Collaborative sessions
- Plugin marketplace

### Performance Improvements

- Incremental context updates
- Smarter token management
- Parallel subagent execution
- Caching optimizations

### Integration Expansions

- Additional IDE support
- CI/CD integration
- Cloud workspace support
- Team collaboration features

---

## Glossary

- **Turn**: Single request-response cycle in conversation
- **Tool**: Executable function available to the model
- **Subagent**: Specialized agent for delegated tasks
- **MCP**: Model Context Protocol
- **Content Generator**: API client abstraction
- **Tool Scheduler**: Tool execution orchestrator
- **Session**: Continuous conversation with history
- **Checkpoint**: Saved conversation state
- **PTY**: Pseudo-terminal for interactive shell commands

---

**Document Version**: 1.0  
**Maintained By**: Qwen Code Team  
**Last Review**: December 4, 2025
