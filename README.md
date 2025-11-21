# Mobile Claude Chat App

A React Native/Expo mobile app that connects to Claude AI through a local server on your home computer.

## Architecture

```
Phone App → Internet → ngrok/cloudflare → Your Computer → Claude API
```

## Setup

### 1. Server Setup (Your Home Computer)

```bash
cd server

# Create .env file with your API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY from https://console.anthropic.com/

# Install dependencies
npm install

# Start server
npm start
```

### 2. Expose Server to Internet

Option A - ngrok:
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000
# Copy the https URL (e.g., https://abc123.ngrok-free.app)
```

Option B - Cloudflare Tunnel:
```bash
# Install cloudflared
cloudflared tunnel --url http://localhost:3000
# Copy the https URL
```

### 3. Update App with Server URL

Edit `app/App.tsx` line 16:
```typescript
const API_URL = 'https://your-ngrok-or-cloudflare-url';
```

### 4. Run the Mobile App

```bash
cd app

# Install Expo CLI if needed
npm install -g expo-cli

# Start Expo
npx expo start
```

Then:
- **iOS**: Scan QR code with Camera app (or press `i` for simulator)
- **Android**: Scan QR code with Expo Go app (or press `a` for emulator)

## Development

### Running locally (same network)
If your phone and computer are on the same WiFi, you can use your computer's local IP:
```typescript
const API_URL = 'http://192.168.1.xxx:3000';
```

### Building for production
```bash
cd app
npx expo build:ios
npx expo build:android
```

## Costs

- **Claude API**: Usage-based pricing at https://www.anthropic.com/pricing
- **ngrok**: Free tier available, paid for persistent URLs
- **Expo**: Free for development, EAS Build for production apps

## Troubleshooting

### "Network request failed"
- Check server is running: `curl http://localhost:3000/api/health`
- Check ngrok/cloudflare tunnel is active
- Verify URL in App.tsx matches tunnel URL

### "Failed to get response from Claude"
- Check ANTHROPIC_API_KEY in server/.env
- Verify API key has credits at console.anthropic.com
