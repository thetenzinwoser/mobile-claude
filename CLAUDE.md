# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mobile Claude is a React Native/Expo chat app that executes Claude Code CLI commands through a local Express server. The architecture is: Phone App → Internet → ngrok/cloudflare → Your Computer → Claude Code CLI.

## Commands

### Server (in `/server`)
```bash
npm install          # Install dependencies
npm start            # Start server (node index.js)
npm run dev          # Start with nodemon for auto-reload
```

### Mobile App (in `/app`)
```bash
npm install          # Install dependencies
npm start            # Start Expo dev server (expo start)
npm run ios          # Start iOS simulator
npm run android      # Start Android emulator
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

## Architecture

### Two-Package Structure
- **`/app`** - React Native/Expo mobile app (TypeScript)
- **`/server`** - Express.js backend (JavaScript)

### Server (`server/index.js`)
- Express server on port 3000
- Spawns Claude Code CLI with `claude -p` command
- **Critical**: Uses `stdio: ['inherit', 'pipe', 'pipe']` to prevent hanging (stdin must be 'inherit')
- Endpoints: `POST /api/claude`, `GET /api/health`
- 2-minute timeout per request

### App (`app/App.tsx`)
- Single-file React Native app with all UI and logic
- API_URL constant on line 16 - update for deployment
- DEFAULT_WORKING_DIR on line 19 - default directory for Claude Code
- Messages stored in local state (not persisted)
- Max input length: 4000 characters

## Configuration

- App server URL: `app/App.tsx` line 16 - update `API_URL` constant
- App working directory: `app/App.tsx` line 19 - update `DEFAULT_WORKING_DIR`

## Key Implementation Details

- Server spawns: `claude -p "<prompt>" --dangerously-skip-permissions --output-format json`
- Prompts are sent to Claude Code CLI with a configurable working directory
- JSON output is parsed to extract the result

## Known Issues

### Claude CLI Hanging from Node.js
When spawning Claude Code from Node.js, the process hangs if stdin is piped. The fix is:
```javascript
spawn('claude', args, {
  stdio: ['inherit', 'pipe', 'pipe']  // stdin must be 'inherit', not 'pipe'
});
```

## Deployment

### Exposing Server to Internet
Use ngrok or Cloudflare Tunnel to expose localhost:3000:
```bash
ngrok http 3000
# or
cloudflared tunnel --url http://localhost:3000
```
Then update `API_URL` in `app/App.tsx` with the generated https URL.

### Local Network Development
For same-WiFi testing, use your computer's local IP:
```typescript
const API_URL = 'http://192.168.1.xxx:3000';
```

## Troubleshooting

- **"Network request failed"**: Verify server is running (`curl http://localhost:3000/api/health`), tunnel is active, and URL in App.tsx matches
- **Request hangs with no output**: Check that `stdio` is `['inherit', 'pipe', 'pipe']` in spawn call
- **"Claude is working..." never completes**: The Claude Code CLI may be waiting for input; ensure `--dangerously-skip-permissions` flag is present
