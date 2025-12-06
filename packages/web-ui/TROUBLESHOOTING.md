# Web UI Troubleshooting Guide

## Quick Start

```bash
# From project root
./start-webui.sh

# Or manually
npm run web-ui:dev
```

Then open http://localhost:5173 in your browser.

## Common Issues

### 1. Dependencies Not Installed

**Symptom**: Error messages about missing modules (fastify, react, etc.)

**Solution**:

```bash
npm install
```

### 2. Ports Already in Use

**Symptom**: `EADDRINUSE` error

**Solution**:

```bash
# Check what's using the ports
lsof -i :3000
lsof -i :5173

# Kill the processes or change ports in:
# - packages/web-ui/server/src/index.ts (PORT variable)
# - packages/web-ui/client/vite.config.ts (server.port)
```

### 3. 401 Unauthorized Errors

**Symptom**: Session creation fails with 401 errors in console

**Possible causes**:

- Cookie not being set/sent properly
- Proxy configuration issue
- Browser blocking cookies

**Solution**:

1. Clear browser cookies for localhost
2. Check browser console for errors
3. Verify Vite proxy is working (check Network tab)
4. Try accessing http://localhost:3000/api/auth/login directly

### 4. WebSocket Connection Failed

**Symptom**: Real-time updates not working

**Solution**:

- Check if server is running on port 3000
- Verify CORS settings in server/src/index.ts
- Check browser console for WebSocket errors

### 5. Build Errors

**Symptom**: TypeScript or build errors

**Solution**:

```bash
# Rebuild all packages
npm run build:packages

# Or rebuild specific packages
cd packages/web-ui/server && npm run build
cd packages/web-ui/client && npm run build
```

## Development Tips

### Hot Reload Not Working

Both client and server support hot reload:

- **Client**: Vite automatically reloads on file changes
- **Server**: tsx watch automatically restarts on file changes

If hot reload stops working:

```bash
# Stop the servers (Ctrl+C)
# Clear Vite cache
rm -rf packages/web-ui/client/node_modules/.vite
# Restart
npm run web-ui:dev
```

### Debugging

**Server logs**: Check the terminal where you ran `npm run web-ui:dev`

**Client logs**: Open browser DevTools Console

**Network issues**: Check browser DevTools Network tab

### Environment Variables

Create `.env` in project root:

```env
# Server
PORT=3000
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173

# Qwen API (same as CLI)
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=your_api_endpoint
OPENAI_MODEL=your_model
```

## Still Having Issues?

1. Check the main logs in terminal
2. Check browser console for errors
3. Verify all dependencies are installed: `npm install`
4. Try a clean install:
   ```bash
   rm -rf node_modules package-lock.json
   rm -rf packages/*/node_modules
   npm install
   ```
