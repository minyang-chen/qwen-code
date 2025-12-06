# Authentication Info Display Feature

## Overview

Added functionality to display login type and connection information in the web UI Settings modal.

## Changes Made

### 1. Server-side (packages/web-ui/server/src/index.ts)

- **New Endpoint**: `GET /api/auth/info`
  - Returns authentication information for the current user
  - Response includes:
    - `loginType`: Either "openai" or "qwen-oauth"
    - `baseUrl`: API base URL (for OpenAI-compatible mode)
    - `model`: Model name (for OpenAI-compatible mode)

### 2. Client-side (packages/web-ui/client/src/components/Settings.tsx)

- **New Interface**: `AuthInfo` to type the authentication data
- **New State**: `authInfo` to store fetched authentication information
- **New useEffect Hook**: Fetches auth info when Settings modal opens
- **New UI Section**: "Connection Information" panel displaying:
  - Login Type (OpenAI Compatible or Qwen OAuth)
  - Base URL (if using OpenAI-compatible mode)
  - Model (if using OpenAI-compatible mode)

## UI Design

- Info displayed in a blue-highlighted panel at the top of Settings
- Clean, minimal design with label-value pairs
- Conditionally shows Base URL and Model only for OpenAI-compatible mode
- Truncates long URLs to prevent layout issues

## Usage

1. Open the Settings modal (gear icon in the UI)
2. View "Connection Information" section at the top
3. See your current login type and connection details

## Example Display

**For Qwen OAuth:**

```
Connection Information
Login Type: Qwen OAuth
```

**For OpenAI Compatible:**

```
Connection Information
Login Type: OpenAI Compatible
Base URL: https://api.openai.com/v1
Model: gpt-4
```
