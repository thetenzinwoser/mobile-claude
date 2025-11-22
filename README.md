# Mobile Claude

A React Native/Expo mobile app that lets you run Claude Code commands from your phone.

## Architecture

```
Phone App → Internet → ngrok/cloudflare → Your Computer → Claude Code CLI
```

## Quick Start

### 1. Server Setup

```bash
cd server
npm install
npm start
```

### 2. Expose to Internet

```bash
# Option A: ngrok
ngrok http 3000

# Option B: Cloudflare Tunnel
cloudflared tunnel --url http://localhost:3000
```

### 3. Configure App

Edit `app/App.tsx`:
- Line 16: Set `API_URL` to your tunnel URL
- Line 19: Set `DEFAULT_WORKING_DIR` to your projects directory

### 4. Run Mobile App

```bash
cd app
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or Camera app (iOS).

## Local Network Development

If your phone and computer are on the same WiFi:
```typescript
const API_URL = 'http://192.168.1.xxx:3000';
```

## API Endpoints

- `POST /api/claude` - Execute Claude Code command
- `GET /api/health` - Health check

## How It Works

The server spawns Claude Code CLI for each request:
```bash
claude -p "<prompt>" --dangerously-skip-permissions --output-format json
```

Each prompt is independent (no conversation history). The working directory is configurable per request.

## Troubleshooting

**"Network request failed"**
- Check server: `curl http://localhost:3000/api/health`
- Verify tunnel is active
- Confirm URL in App.tsx matches

**Request hangs indefinitely**
- This is a known Node.js issue with Claude CLI
- Ensure server uses `stdio: ['inherit', 'pipe', 'pipe']` in spawn call

## License

MIT
