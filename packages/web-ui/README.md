# Qwen Code Web UI

Web-based interface for Qwen Code with all CLI functionality.

## Architecture

```
Browser (React) ←→ WebSocket/HTTP ←→ Server (Fastify) ←→ Core Package
```

## Features

- **Real-time Chat**: WebSocket streaming for instant responses
- **Code Highlighting**: Syntax highlighting for code blocks
- **Session Management**: Multiple concurrent sessions
- **Tool Execution**: Visual approval for tool calls
- **90%+ Code Reuse**: Shares core logic with CLI

## Quick Start

### Development

```bash
# From project root
npm install

# Start both server and client
npm run web-ui:dev

# Or start separately:
# Terminal 1: Server
npm run web-ui:server

# Terminal 2: Client
npm run web-ui:client
```

Access at: http://localhost:5173

### Production Build

```bash
# Build server
cd packages/web-ui/server
npm run build

# Build client
cd packages/web-ui/client
npm run build

# Start server
cd packages/web-ui/server
npm start
```

## Project Structure

```
web-ui/
├── server/              # Backend (Fastify + Socket.io)
│   ├── src/
│   │   ├── SessionManager.ts    # Session lifecycle
│   │   ├── ClientAdapter.ts     # Core client wrapper
│   │   ├── websocket.ts         # WebSocket handlers
│   │   └── index.ts             # Server entry
│   └── package.json
└── client/              # Frontend (React + Vite)
    ├── src/
    │   ├── components/          # UI components
    │   ├── hooks/               # React hooks
    │   ├── store/               # Zustand state
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

## Configuration

### Server

Environment variables:

- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: JWT signing secret
- `CORS_ORIGIN`: Allowed CORS origin (default: http://localhost:5173)
- `NODE_ENV`: Environment (development/production)

### Client

Vite proxy configured to forward `/api` requests to server.

## API Endpoints

### REST API

- `POST /api/auth/login` - Login (dev mode: auto-login)
- `POST /api/sessions` - Create new session
- `GET /api/sessions` - List user sessions
- `DELETE /api/sessions/:id` - Delete session

### WebSocket Events

**Client → Server:**

- `chat:message` - Send chat message
- `session:history` - Get session history
- `session:compress` - Compress session history

**Server → Client:**

- `message:chunk` - Streaming message chunk
- `message:complete` - Message complete
- `message:error` - Error occurred
- `session:history` - Session history data
- `session:compressed` - Compression complete

## Development

### Adding Features

1. **Backend**: Add handlers in `server/src/websocket.ts`
2. **Frontend**: Add components in `client/src/components/`
3. **State**: Update store in `client/src/store/chatStore.ts`

### Code Reuse

The server reuses the entire `@qwen-code/core` package:

- Client logic
- Tool system
- API integration
- Authentication
- Services

Example:

```typescript
import { Client } from '@qwen-code/core';

const client = new Client(config);
const stream = client.sendMessageStream(message);
```

## Testing

```bash
# Server tests
cd packages/web-ui/server
npm test

# Client tests
cd packages/web-ui/client
npm test
```

## Deployment

### Docker

```bash
# Build images
docker build -t qwen-code-server ./packages/web-ui/server
docker build -t qwen-code-client ./packages/web-ui/client

# Run with docker-compose
docker-compose up
```

### Manual

1. Build both packages
2. Serve client static files with nginx
3. Run server with PM2 or systemd
4. Configure reverse proxy

## Security

- JWT authentication with httpOnly cookies
- CSRF protection
- Rate limiting
- Session isolation per user
- Tool execution approval required

## Troubleshooting

### WebSocket Connection Failed

Check CORS settings and ensure server is running on correct port.

### Session Not Found

Session may have expired. Refresh page to create new session.

### Build Errors

Ensure all dependencies are installed:

```bash
npm install
```

## License

Same as main Qwen Code project.
