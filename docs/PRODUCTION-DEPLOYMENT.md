# Production Deployment Guide

## 🔧 Issues Fixed

### ✅ Issue 1: API `/promotions/active` 404 Error

**Problem:**

- PromotionsSection was using manual `fetch()` instead of RTK Query
- URL was concatenating incorrectly: `http://localhost:4000/api/v1/promotions/active`
- Backend endpoint might not be implemented

**Solution:**

- ✅ Replaced manual fetch with `useGetActivePromotionsQuery` hook
- ✅ Now uses consistent API configuration
- ✅ Gracefully hides section if endpoint returns 404

**Files Changed:**

- `src/containers/landing-page/PromotionsSection.tsx`

---

### ⚠️ Issue 2: WebSocket Not Working in Production

**Problem:**

- WebSocket connects to `NEXT_PUBLIC_API_URL` from `.env.local`
- Currently set to `http://localhost:4000` → only works locally
- Production domain: `dsa-bus-booking.io.vn`

**Root Cause:** Both Frontend and Backend configuration issues

---

## 🚀 Production Setup Checklist

### Frontend Configuration

#### 1. Update Environment Variables

For **production deployment**, update `.env.local` or create `.env.production`:

```bash
# Production API URL (HTTPS required for WebSocket Secure)
NEXT_PUBLIC_API_URL=https://api.dsa-bus-booking.io.vn

# Production App URL
NEXT_PUBLIC_APP_URL=https://dsa-bus-booking.io.vn
```

#### 2. Rebuild Application

```bash
npm run build
npm start
```

---

### Backend Configuration Required

#### 1. Enable CORS for Production Domain

```javascript
// backend/src/app.js or similar
const cors = require('cors');

app.use(
  cors({
    origin: [
      'http://localhost:3000', // Development
      'https://dsa-bus-booking.io.vn', // Production
    ],
    credentials: true,
  })
);
```

#### 2. Configure Socket.IO for Production

```javascript
// backend/src/socket.js or similar
const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://dsa-bus-booking.io.vn'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'], // Important!
  allowEIO3: true,
});
```

#### 3. Nginx Reverse Proxy Configuration (if using Nginx)

Add this to your nginx config for WebSocket support:

```nginx
server {
    listen 443 ssl;
    server_name api.dsa-bus-booking.io.vn;

    # SSL certificates
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for WebSocket
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

#### 4. Check Backend Listening Address

Make sure backend is accessible:

```javascript
// Should listen on 0.0.0.0 or specific IP, not just localhost
server.listen(4000, '0.0.0.0', () => {
  console.log('Server running on port 4000');
});
```

---

## 🧪 Testing WebSocket in Production

### 1. Test Connection

Open browser console on production site and check:

```javascript
// Should see these logs:
[Socket.IO] API URL: https://api.dsa-bus-booking.io.vn
[Socket.IO] Connecting to: https://api.dsa-bus-booking.io.vn
✅ [Socket.IO] Connected: <socket-id>
✅ [Socket.IO] Transport: websocket  // Should be websocket, not polling
```

### 2. Check Network Tab

1. Open DevTools → Network Tab
2. Filter by "WS" (WebSocket)
3. Should see: `wss://api.dsa-bus-booking.io.vn/socket.io/?EIO=4&transport=websocket`
4. Status should be "101 Switching Protocols"

### 3. Common Issues

| Issue              | Cause                      | Solution                          |
| ------------------ | -------------------------- | --------------------------------- |
| Connection refused | Backend not running        | Check backend server status       |
| 404 on socket.io   | Socket.IO not initialized  | Verify Socket.IO setup on backend |
| CORS error         | Domain not allowed         | Add domain to CORS whitelist      |
| Transport: polling | WebSocket blocked          | Check nginx config, firewall      |
| SSL error          | Mixed content (HTTP/HTTPS) | Ensure all URLs use HTTPS         |

---

## 📋 Deployment Steps Summary

### Frontend

1. ✅ Update `.env.local` with production URLs
2. ✅ Run `npm run build`
3. ✅ Deploy to hosting (Vercel, Netlify, etc.)

### Backend

1. ⚠️ Update CORS configuration
2. ⚠️ Update Socket.IO configuration
3. ⚠️ Configure reverse proxy (Nginx/Apache)
4. ⚠️ Enable HTTPS (required for WSS)
5. ⚠️ Test Socket.IO endpoint: `https://api.dsa-bus-booking.io.vn/socket.io/`

---

## 🔍 Debugging Commands

### Check if backend is reachable

```bash
# Test API endpoint
curl https://api.dsa-bus-booking.io.vn/api/v1/promotions/active

# Test Socket.IO handshake
curl https://api.dsa-bus-booking.io.vn/socket.io/?EIO=4&transport=polling
```

### Check WebSocket in browser console

```javascript
// Manual test
const socket = io('https://api.dsa-bus-booking.io.vn', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => console.log('Connected:', socket.id));
socket.on('connect_error', (err) => console.error('Error:', err));
```

---

## 📞 Next Steps

**Backend team must:**

1. Implement `/api/v1/promotions/active` endpoint (or confirm it exists)
2. Update CORS settings for production domain
3. Configure Socket.IO for production
4. Set up HTTPS with valid SSL certificate
5. Configure reverse proxy if using Nginx

**Frontend team:**

1. ✅ Code fixes are complete
2. ⏳ Update env vars when deploying to production
3. ⏳ Test after backend is configured

---

## 📚 Reference Documentation

- [Socket.IO Deployment Guide](https://socket.io/docs/v4/deploying/)
- [Nginx WebSocket Proxying](https://nginx.org/en/docs/http/websocket.html)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
