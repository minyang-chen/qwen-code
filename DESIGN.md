# Qwen Code - Design Document

**Version:** 0.2.2  
**Last Updated:** December 2, 2025

## Executive Summary

Qwen Code is an AI-powered command-line workflow tool specifically optimized for Qwen3-Coder models. Adapted from Google Gemini CLI, it provides developers with advanced code understanding, automated task execution, and intelligent assistance through a terminal interface. The system supports multiple authentication methods including Qwen OAuth, OpenAI-compatible APIs, and various regional providers.

## 1. System Overview

### 1.1 Purpose

Qwen Code enables developers to:

- Query and edit large codebases beyond traditional context window limits
- Automate operational tasks (PR handling, complex rebases)
- Leverage vision models for multimodal analysis
- Execute shell commands and file operations with AI assistance
- Integrate with IDEs through companion extensions

### 1.2 Key Features

- **Enhanced Parser**: Optimized for Qwen-Coder models
- **Vision Model Support**: Automatic detection and switching for image inputs
- **Session Management**: Configurable token limits with compression
- **Multi-Auth Support**: OAuth, OpenAI-compatible, regional providers
- **Tool Ecosystem**: Extensible tool system for file operations, shell execution, web search
- **Subagent System**: Delegated task execution with specialized agents
- **MCP Integration**: Model Context Protocol for extended capabilities

## 2. Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Terminal   │  │  VS Code     │  │   Zed IDE    │     │
│  │     CLI      │  │  Extension   │  │  Integration │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      CLI Package                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  UI Layer (React/Ink)                                │  │
│  │  - AppContainer, Components, Themes                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Configuration & Settings                            │  │
│  │  - Config loader, Settings schema, Extensions        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services                                            │  │
│  │  - Command Service, Prompt Loader                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Core Package                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Core Logic                                          │  │
│  │  - Client, ContentGenerator, GeminiChat             │  │
│  │  - Turn Management, Token Limits, Prompts           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Authentication                                      │  │
│  │  - Qwen OAuth2, Code Assist OAuth, OpenAI Auth      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tool System                                         │  │
│  │  - Tool Registry, Tool Scheduler                     │  │
│  │  - File Tools, Shell Tools, Web Tools, MCP Tools    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services                                            │  │
│  │  - Shell Execution, File Discovery, Git Service     │  │
│  │  - Chat Recording, Compression, Loop Detection      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Subagent System                                     │  │
│  │  - Subagent Manager, Built-in Agents, Validation    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Qwen API    │  │  OpenAI API  │  │  Web Search  │     │
│  │  (OAuth)     │  │  Compatible  │  │   Services   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Package Structure

#### 2.2.1 CLI Package (`packages/cli`)

**Responsibility**: User interface, input/output handling, configuration management

**Key Components**:

- `src/ui/`: React/Ink-based terminal UI
  - `AppContainer.tsx`: Main application container
  - `components/`: Reusable UI components
  - `themes/`: Theme management and definitions
  - `contexts/`: React contexts (Settings, Session)
- `src/config/`: Configuration management
  - `config.ts`: CLI configuration loader
  - `settings.ts`: User settings management
  - `extension.ts`: Extension system
  - `keyBindings.ts`: Keyboard shortcut configuration
- `src/commands/`: Command implementations
  - `extensions.tsx`: Extension management commands
  - `mcp.ts`: MCP server commands
- `src/services/`: CLI-specific services
  - `CommandService.ts`: Command orchestration
  - `McpPromptLoader.ts`: MCP prompt loading
  - `FileCommandLoader.ts`: File-based command loading

#### 2.2.2 Core Package (`packages/core`)

**Responsibility**: Business logic, API communication, tool execution

**Key Components**:

- `src/core/`: Core conversation logic
  - `client.ts`: Main client orchestrator
  - `contentGenerator.ts`: Content generation abstraction
  - `geminiChat.ts`: Gemini API integration
  - `coreToolScheduler.ts`: Tool execution scheduling
  - `prompts.ts`: Prompt construction
  - `tokenLimits.ts`: Token management
  - `turn.ts`: Conversation turn handling
- `src/qwen/`: Qwen-specific implementations
  - `qwenOAuth2.ts`: Qwen OAuth authentication
  - `qwenContentGenerator.ts`: Qwen content generation
  - `sharedTokenManager.ts`: Token management
- `src/tools/`: Tool implementations
  - `read-file.ts`, `write-file.ts`: File operations
  - `shell.ts`: Shell command execution
  - `grep.ts`, `ripGrep.ts`, `glob.ts`: Search tools
  - `edit.ts`, `smart-edit.ts`: File editing
  - `web-fetch.ts`, `web-search/`: Web tools
  - `mcp-client.ts`, `mcp-tool.ts`: MCP integration
  - `task.ts`, `todoWrite.ts`: Task management
  - `memoryTool.ts`: Memory/context management
- `src/services/`: Core services
  - `shellExecutionService.ts`: Shell execution
  - `fileDiscoveryService.ts`: File discovery
  - `gitService.ts`: Git operations
  - `chatRecordingService.ts`: Conversation recording
  - `chatCompressionService.ts`: History compression
  - `loopDetectionService.ts`: Infinite loop detection
- `src/subagents/`: Subagent system
  - `subagent-manager.ts`: Subagent orchestration
  - `subagent.ts`: Subagent implementation
  - `builtin-agents.ts`: Built-in agent definitions
  - `validation.ts`: Subagent validation
- `src/utils/`: Utility functions
  - File operations, path handling, encoding
  - Error handling, retry logic
  - Git utilities, ignore patterns
  - Shell utilities, terminal serialization

#### 2.2.3 VS Code IDE Companion (`packages/vscode-ide-companion`)

**Responsibility**: VS Code integration

**Key Components**:

- Extension activation and lifecycle
- IDE context provider
- File system integration
- Communication protocol with CLI

#### 2.2.4 Test Utils (`packages/test-utils`)

**Responsibility**: Shared testing utilities

## 3. Core Subsystems

### 3.1 Authentication System

#### 3.1.1 Qwen OAuth (Recommended)

**Flow**:

1. User initiates authentication
2. CLI opens browser to Qwen OAuth endpoint
3. User authenticates with qwen.ai account
4. OAuth callback returns tokens
5. Tokens cached locally with automatic refresh

**Implementation**: `packages/core/src/qwen/qwenOAuth2.ts`

**Benefits**:

- 2,000 requests/day
- 60 requests/minute
- No manual token management
- Automatic credential refresh

#### 3.1.2 OpenAI-Compatible API

**Configuration Sources**:

1. Environment variables (`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`)
2. Project `.env` file
3. Settings file

**Supported Providers**:

- Alibaba Cloud Bailian (China)
- ModelScope (China, free tier)
- Alibaba Cloud ModelStudio (International)
- OpenRouter (International, free tier)

#### 3.1.3 Code Assist OAuth

**Purpose**: Integration with Google Code Assist

**Implementation**: `packages/core/src/code_assist/oauth2.ts`

### 3.2 Content Generation System

#### 3.2.1 Content Generator Abstraction

**Interface**: `ContentGenerator`

**Implementations**:

- `QwenContentGenerator`: Qwen API integration
- `OpenAIContentGenerator`: OpenAI-compatible APIs
- `LoggingContentGenerator`: Wrapper with logging

**Key Methods**:

- `generateContent()`: Single request
- `generateContentStream()`: Streaming response
- `countTokens()`: Token counting

#### 3.2.2 Request Flow

```
User Input
    ↓
Client.sendMessage()
    ↓
Turn.execute()
    ↓
ContentGenerator.generateContentStream()
    ↓
[Tool Execution Loop]
    ↓
CoreToolScheduler.executeTool()
    ↓
Tool.execute()
    ↓
[Return to Model]
    ↓
Final Response
```

### 3.3 Tool System

#### 3.3.1 Tool Architecture

**Base Interface**: `Tool`

```typescript
interface Tool {
  name: string;
  description: string;
  parameters: ToolParameters;
  execute(args: unknown, context: ToolContext): Promise<ToolResult>;
}
```

**Tool Registry**: Central registration and lookup

**Tool Scheduler**: Execution orchestration with user confirmation

#### 3.3.2 Tool Categories

**File Operations**:

- `read-file`: Read file contents
- `write-file`: Write/create files
- `read-many-files`: Batch file reading
- `edit`: Line-based file editing
- `smart-edit`: Intelligent file editing
- `ls`: Directory listing
- `glob`: Pattern-based file search

**Search Tools**:

- `grep`: Text search in files
- `ripGrep`: Fast recursive search
- File search utilities

**Shell Tools**:

- `shell`: Execute shell commands
- Shell execution service with PTY support

**Web Tools**:

- `web-fetch`: Fetch web content
- `web-search`: Web search integration

**Task Management**:

- `task`: Task execution
- `todoWrite`: TODO list management

**Memory/Context**:

- `memoryTool`: Context persistence

**MCP Tools**:

- `mcp-client`: MCP server communication
- `mcp-tool`: MCP tool wrapper

#### 3.3.3 Tool Execution Flow

1. Model requests tool execution
2. Tool scheduler validates request
3. User confirmation (if required)
4. Tool execution
5. Result returned to model
6. Model processes result

### 3.4 Subagent System

#### 3.4.1 Purpose

Delegate specialized tasks to focused agents with:

- Isolated context
- Specific tool access
- Independent conversation history

#### 3.4.2 Architecture

**Components**:

- `SubagentManager`: Orchestration
- `Subagent`: Individual agent instance
- `BuiltinAgents`: Predefined agents

**Lifecycle**:

1. Main agent identifies need for subagent
2. Subagent created with specific context
3. Subagent executes task
4. Results returned to main agent
5. Subagent terminated

#### 3.4.3 Built-in Agents

Extensible system for domain-specific agents

### 3.5 Session Management

#### 3.5.1 Token Tracking

**Components**:

- Token counter per request
- Cumulative session tracking
- Configurable limits

**Configuration**: `.qwen/settings.json`

```json
{
  "sessionTokenLimit": 32000
}
```

#### 3.5.2 History Compression

**Trigger**: Approaching token limit

**Process**:

1. Identify compressible content
2. Summarize older turns
3. Preserve recent context
4. Update conversation history

**Command**: `/compress`

#### 3.5.3 Checkpointing

**Purpose**: Save/restore conversation state

**Storage**: Local filesystem

**Commands**:

- `/save`: Save checkpoint
- `/load`: Load checkpoint

### 3.6 Vision Model Support

#### 3.6.1 Auto-Detection

**Trigger**: Image detected in input

**Behavior**:

- Prompt user for vision model switch
- Options: once, session, persist, skip

#### 3.6.2 Configuration

**Settings**: `.qwen/settings.json`

```json
{
  "experimental": {
    "visionModelPreview": true,
    "vlmSwitchMode": "once"
  }
}
```

**CLI Override**: `--vlm-switch-mode`

### 3.7 MCP Integration

#### 3.7.1 Model Context Protocol

**Purpose**: Standardized context provision to LLMs

**Components**:

- MCP client for server communication
- OAuth provider for authentication
- Tool wrapper for MCP tools
- Prompt loader for MCP prompts

#### 3.7.2 MCP Server Management

**Configuration**: Settings file

**Lifecycle**:

- Server discovery
- Connection establishment
- Tool/prompt registration
- Request routing

## 4. Data Flow

### 4.1 Interactive Session Flow

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

### 4.2 Non-Interactive Flow

```
1. Command line arguments
   ↓
2. CLI: Parse arguments
   ↓
3. CLI: Execute non-interactive mode
   ↓
4. Core: Process with auto-approval
   ↓
5. Core: Execute tools automatically
   ↓
6. CLI: Output results
   ↓
7. Exit
```

## 5. Configuration System

### 5.1 Configuration Hierarchy

1. Command-line arguments (highest priority)
2. Environment variables
3. Project `.env` file
4. User settings (`~/.qwen/settings.json`)
5. Default values (lowest priority)

### 5.2 Settings Schema

**Location**: `packages/cli/src/config/settingsSchema.ts`

**Key Settings**:

- `model`: Model selection
- `sessionTokenLimit`: Token limit
- `experimental`: Feature flags
- `tools`: Tool configuration
- `sandbox`: Sandbox settings
- `theme`: UI theme
- `keyBindings`: Keyboard shortcuts

### 5.3 Extension System

**Purpose**: Extend functionality with custom commands/tools

**Structure**:

```
extension-dir/
  qwen-extension.json
  commands/
  tools/
```

**Configuration**: Settings file

## 6. Security Considerations

### 6.1 Trusted Folders

**Purpose**: Prevent unauthorized file access

**Mechanism**:

- User must approve folder access
- Approval persisted in settings
- Validation on file operations

### 6.2 Tool Execution Approval

**Categories**:

- **Read-only**: Auto-approved (configurable)
- **Write operations**: User confirmation required
- **Shell commands**: User confirmation required

### 6.3 Sandbox Mode

**Purpose**: Isolated execution environment

**Implementations**:

- Docker container
- Podman container
- macOS sandbox profiles

**Configuration**: `--sandbox` flag

### 6.4 Credential Storage

**OAuth Tokens**: Encrypted local storage

**API Keys**: Environment variables or secure settings

**MCP OAuth**: Token storage with refresh

## 7. Performance Optimizations

### 7.1 Token Caching

**Purpose**: Reduce redundant API calls

**Mechanism**: Cache prompt prefixes

### 7.2 Streaming Responses

**Purpose**: Immediate feedback

**Implementation**: Server-sent events from API

### 7.3 Parallel Tool Execution

**Purpose**: Faster multi-tool operations

**Limitation**: Independent tools only

### 7.4 File Search Optimization

**Tools**:

- BFS file search
- ripgrep integration
- Ignore pattern caching

## 8. Error Handling

### 8.1 Error Categories

- **API Errors**: Rate limits, quota, network
- **Tool Errors**: Execution failures
- **Configuration Errors**: Invalid settings
- **User Errors**: Invalid input

### 8.2 Retry Logic

**Mechanism**: Exponential backoff

**Configuration**: Per-error type

**Implementation**: `packages/core/src/utils/retry.ts`

### 8.3 Fallback Strategies

**Model Fallback**: Switch to alternative model on error

**Tool Fallback**: Alternative tool implementations

### 8.4 Loop Detection

**Purpose**: Prevent infinite tool execution loops

**Mechanism**: Pattern detection in tool calls

**Action**: Terminate and notify user

## 9. Testing Strategy

### 9.1 Unit Tests

**Framework**: Vitest

**Coverage**: Core logic, utilities, services

**Location**: `*.test.ts` files alongside source

### 9.2 Integration Tests

**Location**: `integration-tests/`

**Scenarios**:

- File operations
- Shell execution
- MCP integration
- Extension loading
- Web search

### 9.3 Terminal Bench

**Purpose**: Benchmark against standard tasks

**Location**: `integration-tests/terminal-bench/`

**Results**: Tracked in README

## 10. Deployment

### 10.1 Distribution Methods

- **npm**: `npm install -g @qwen-code/qwen-code`
- **Homebrew**: `brew install qwen-code`
- **Docker**: `ghcr.io/qwenlm/qwen-code`
- **Source**: Clone and build

### 10.2 Build Process

**Script**: `npm run build`

**Steps**:

1. TypeScript compilation
2. Bundle with esbuild
3. Copy assets
4. Generate version info

**Output**: `dist/` directory

### 10.3 Release Process

**Versioning**: Semantic versioning

**Workflow**: GitHub Actions

**Steps**:

1. Version bump
2. Build all packages
3. Run tests
4. Publish to npm
5. Create GitHub release
6. Build Docker image

## 11. Monitoring & Telemetry

### 11.1 Telemetry System

**Purpose**: Usage analytics, error tracking

**Implementation**: `packages/core/src/telemetry/`

**Data Collected**:

- Command usage
- Tool execution
- Error occurrences
- Performance metrics

**Privacy**: Opt-in, anonymized

### 11.2 Logging

**Levels**: Debug, Info, Warn, Error

**Destinations**:

- Console (development)
- File (production)
- Telemetry service

**Configuration**: Environment variables

## 12. Future Enhancements

### 12.1 Planned Features

- Enhanced code understanding
- Multi-repository support
- Advanced refactoring tools
- Collaborative sessions
- Plugin marketplace

### 12.2 Performance Improvements

- Incremental context updates
- Smarter token management
- Parallel subagent execution
- Caching optimizations

### 12.3 Integration Expansions

- Additional IDE support
- CI/CD integration
- Cloud workspace support
- Team collaboration features

## 13. Development Guidelines

### 13.1 Code Style

**Linting**: ESLint with TypeScript

**Formatting**: Prettier

**Pre-commit**: Husky hooks

### 13.2 Contribution Process

1. Fork repository
2. Create feature branch
3. Implement changes with tests
4. Run linting and tests
5. Submit pull request
6. Code review
7. Merge

**Reference**: `CONTRIBUTING.md`

### 13.3 Documentation

**Requirements**:

- JSDoc for public APIs
- README for packages
- Architecture docs for major features
- User guides in `docs/`

## 14. Dependencies

### 14.1 Core Dependencies

- **Node.js**: >=20.0.0
- **React/Ink**: Terminal UI
- **TypeScript**: Type safety
- **Vitest**: Testing framework

### 14.2 Optional Dependencies

- **node-pty**: Terminal emulation
- **Docker/Podman**: Sandbox execution

### 14.3 Development Dependencies

- **esbuild**: Bundling
- **ESLint**: Linting
- **Prettier**: Formatting
- **Husky**: Git hooks

## 15. Glossary

- **Turn**: Single request-response cycle in conversation
- **Tool**: Executable function available to the model
- **Subagent**: Specialized agent for delegated tasks
- **MCP**: Model Context Protocol
- **Content Generator**: API client abstraction
- **Tool Scheduler**: Tool execution orchestrator
- **Session**: Continuous conversation with history
- **Checkpoint**: Saved conversation state

## Appendix A: File Structure

```
qwen-code/
├── packages/
│   ├── cli/                    # CLI package
│   │   ├── src/
│   │   │   ├── ui/            # Terminal UI
│   │   │   ├── config/        # Configuration
│   │   │   ├── commands/      # Commands
│   │   │   ├── services/      # CLI services
│   │   │   └── utils/         # CLI utilities
│   │   └── package.json
│   ├── core/                   # Core package
│   │   ├── src/
│   │   │   ├── core/          # Core logic
│   │   │   ├── qwen/          # Qwen integration
│   │   │   ├── tools/         # Tool implementations
│   │   │   ├── services/      # Core services
│   │   │   ├── subagents/     # Subagent system
│   │   │   ├── utils/         # Core utilities
│   │   │   └── mcp/           # MCP integration
│   │   └── package.json
│   ├── vscode-ide-companion/   # VS Code extension
│   └── test-utils/             # Test utilities
├── integration-tests/          # Integration tests
├── scripts/                    # Build scripts
├── docs/                       # Documentation
├── .github/                    # GitHub workflows
└── package.json               # Root package
```

## Appendix B: Key Algorithms

### B.1 Token Limit Management

```typescript
function checkTokenLimit(session: Session): boolean {
  const currentTokens = session.totalTokens;
  const limit = session.config.sessionTokenLimit;

  if (currentTokens > limit * 0.9) {
    // Approaching limit, suggest compression
    return false;
  }

  return true;
}
```

### B.2 Tool Execution Scheduling

```typescript
async function scheduleTool(
  toolCall: ToolCall,
  context: ToolContext,
): Promise<ToolResult> {
  // Validate tool exists
  const tool = toolRegistry.get(toolCall.name);

  // Check if approval needed
  if (tool.requiresApproval && !context.autoApprove) {
    const approved = await requestUserApproval(toolCall);
    if (!approved) {
      return { error: 'User rejected tool execution' };
    }
  }

  // Execute tool
  try {
    return await tool.execute(toolCall.args, context);
  } catch (error) {
    return { error: error.message };
  }
}
```

### B.3 History Compression

```typescript
async function compressHistory(
  history: Turn[],
  targetTokens: number,
): Promise<Turn[]> {
  const recentTurns = history.slice(-5); // Keep recent
  const oldTurns = history.slice(0, -5);

  // Summarize old turns
  const summary = await summarizeTurns(oldTurns);

  return [{ role: 'system', content: summary }, ...recentTurns];
}
```

---

**Document Version**: 1.0  
**Maintained By**: Qwen Code Team  
**Last Review**: December 2, 2025
