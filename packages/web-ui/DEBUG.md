# Web UI Debugging Guide

## Issue: Typing a prompt but nothing happens

This usually means the message is not being processed by the backend. Here's how to debug:

### Step 1: Check if servers are running

```bash
# Check if both servers are running
ps aux | grep -E "(vite|tsx)" | grep web-ui

# You should see:
# - tsx watching server/src/index.ts (port 3000)
# - vite dev server (port 5173)
```

### Step 2: Check browser console

Open browser DevTools (F12) and check the Console tab for errors:

**Common errors:**

- `WebSocket connection failed` - Server not running on port 3000
- `401 Unauthorized` - Authentication issue
- `Session not found` - Session creation failed
- `CORS error` - CORS configuration issue

### Step 3: Check Network tab

In browser DevTools, go to Network tab and:

1. **Check initial requests:**
   - `POST /api/auth/login` - Should return 200 with auth token
   - `POST /api/sessions` - Should return 200 with sessionId
   - `WS ws://localhost:3000/socket.io/` - WebSocket connection

2. **When you send a message:**
   - Look for `chat:message` event in WS tab
   - Check if server responds with `message:chunk` events

### Step 4: Check server logs

Look at the terminal where you ran `npm run web-ui:dev`:

**Expected logs:**

```
Server running on http://localhost:3000
Client connected: <socket-id>
```

**Error logs to look for:**

- `Session not found`
- `Client initialization failed`
- `API key not configured`

### Step 5: Verify environment variables

The web UI needs the same environment variables as the CLI:

```bash
# Check if these are set
echo $OPENAI_API_KEY
echo $OPENAI_BASE_URL
echo $OPENAI_MODEL
```

If not set, create `.env` in project root:

```env
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=your_api_endpoint
OPENAI_MODEL=your_model
```

### Step 6: Test the core client directly

The issue might be with the GeminiClient initialization. Check if the core package is working:

```bash
# Test CLI (should work if env vars are set)
npm run start -- "Hello"
```

If CLI works but web UI doesn't, the issue is in the web UI integration.

## Common Fixes

### Fix 1: Restart servers

```bash
# Kill all node processes
pkill -f "tsx.*web-ui"
pkill -f "vite.*web-ui"

# Restart
npm run web-ui:dev
```

### Fix 2: Clear browser cache

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Fix 3: Check SessionManager initialization

The issue might be that `GeminiClient` is not being initialized with proper config. Check:

```typescript
// In SessionManager.ts
createSession(userId: string, config: Config): Session {
  const client = new Client(config); // ← Config might be empty!
  // ...
}
```

The `config` parameter is coming from the request body, which is empty `{}` in App.tsx:

```typescript
// In App.tsx
const sessionRes = await fetch('/api/sessions', {
  method: 'POST',
  body: JSON.stringify({}), // ← Empty config!
});
```

**Solution:** The Client should use environment variables by default. Check if `@qwen-code/core` is properly reading env vars.

### Fix 4: Add debug logging

Add console.log statements to trace the flow:

**In ChatContainer.tsx:**

```typescript
const handleSend = (message: string) => {
  console.log('Sending message:', message, 'sessionId:', sessionId);
  if (!sessionId || !socket) {
    console.error('Cannot send: sessionId or socket missing');
    return;
  }
  // ...
  socket.emit('chat:message', { sessionId, message });
  console.log('Message emitted');
};
```

**In server/src/websocket.ts:**

```typescript
socket.on('chat:message', async (data) => {
  console.log('Received chat:message:', data);
  const session = sessionManager.getSession(data.sessionId);
  if (!session) {
    console.error('Session not found:', data.sessionId);
    socket.emit('error', { message: 'Session not found' });
    return;
  }
  console.log('Session found, sending to adapter');
  // ...
});
```

**In ClientAdapter.ts:**

```typescript
async sendMessage(message: string, socket: Socket): Promise<void> {
  console.log('ClientAdapter.sendMessage called with:', message);
  try {
    console.log('Getting stream from client...');
    const stream = this.client.sendMessageStream(message);
    console.log('Stream obtained, iterating...');

    for await (const chunk of stream) {
      console.log('Received chunk:', chunk);
      // ...
    }
  } catch (error) {
    console.error('Error in sendMessage:', error);
    // ...
  }
}
```

## Still not working?

If none of the above helps, the issue is likely in the `@qwen-code/core` package initialization. The `GeminiClient` might not be reading environment variables properly when instantiated from the web UI.

**Workaround:** Explicitly pass config when creating session:

```typescript
// In App.tsx
const sessionRes = await fetch('/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: 'your-api-key',
    baseURL: 'your-base-url',
    model: 'your-model',
  }),
});
```

**Better solution:** Modify SessionManager to read env vars:

```typescript
// In SessionManager.ts
createSession(userId: string, config: Partial<Config> = {}): Session {
  const fullConfig: Config = {
    apiKey: config.apiKey || process.env.OPENAI_API_KEY,
    baseURL: config.baseURL || process.env.OPENAI_BASE_URL,
    model: config.model || process.env.OPENAI_MODEL,
    ...config,
  };
  const client = new Client(fullConfig);
  // ...
}
```
