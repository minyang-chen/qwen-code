# Quick Fix: Prompt Not Working in Web UI

## The Problem

When you type a prompt in the web UI and press Send, nothing happens. This is because the Qwen Code client wasn't being initialized properly with your API credentials.

## The Solution

I've fixed the code in `SessionManager.ts` and `index.ts`. Now you need to:

### 1. Make sure environment variables are set

The web UI needs the same environment variables as the CLI:

```bash
# Check if these are set
echo $OPENAI_API_KEY
echo $OPENAI_BASE_URL
echo $OPENAI_MODEL
```

If not set, create or update `.env` in the project root:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=your_api_endpoint
OPENAI_MODEL=your_model_choice
```

### 2. Restart the web UI servers

```bash
# Stop the current servers (Ctrl+C in the terminal)

# Then restart
npm run web-ui:dev
```

### 3. Test it

1. Open http://localhost:5173
2. Wait for "Loading..." to finish
3. Type a message and press Send
4. You should see the response streaming in

## Debugging

If it still doesn't work, check:

### Browser Console (F12)

Look for errors in the Console tab:

- ✅ `Client connected: <id>` - Good!
- ❌ `Session not found` - Session creation failed
- ❌ `401 Unauthorized` - Auth issue
- ❌ `WebSocket connection failed` - Server not running

### Server Logs

In the terminal where you ran `npm run web-ui:dev`, look for:

- ✅ `Server running on http://localhost:3000` - Good!
- ✅ `Client connected: <socket-id>` - WebSocket connected
- ❌ `Failed to create session` - Check env vars
- ❌ `API key not configured` - Set OPENAI_API_KEY

### Network Tab

In browser DevTools, check Network tab:

1. `POST /api/auth/login` should return 200
2. `POST /api/sessions` should return 200 with sessionId
3. `WS ws://localhost:3000/socket.io/` should show "101 Switching Protocols"

## What Was Fixed

### Before (Broken)

```typescript
// SessionManager.ts
createSession(userId: string, config: Config): Session {
  const client = new Client(config); // ← config was empty {}!
  // Client had no API key, so it couldn't make requests
}
```

### After (Fixed)

```typescript
// SessionManager.ts
async createSession(userId: string, partialConfig: Partial<Config> = {}): Promise<Session> {
  const config = await createConfig(partialConfig); // ← Reads env vars!
  const client = new Client(config);
  await client.initialize(); // ← Properly initialize
}
```

Now the client is initialized with your API credentials from environment variables, just like the CLI.

## Still Not Working?

If you're still having issues:

1. **Test the CLI first:**

   ```bash
   npm run start -- "Hello"
   ```

   If this doesn't work, your env vars aren't set correctly.

2. **Check if ports are in use:**

   ```bash
   lsof -i :3000
   lsof -i :5173
   ```

3. **Clear everything and restart:**

   ```bash
   # Kill all node processes
   pkill -f "tsx.*web-ui"
   pkill -f "vite.*web-ui"

   # Clear caches
   rm -rf packages/web-ui/client/node_modules/.vite

   # Restart
   npm run web-ui:dev
   ```

4. **Check the detailed debug guide:**
   See `DEBUG.md` in this directory for more troubleshooting steps.
