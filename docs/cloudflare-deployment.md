# CoSpace — Cloudflare Integration & Deployment Guide

This guide provides end-to-end instructions for deploying, tunneling, and exposing **CoSpace** to the public web using Cloudflare's edge infrastructure.

---

## 1. Architecture Overview

```text
                                  CLOUDFLARE EDGE
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  [DNS & SSL/TLS]              [CLOUDFLARE TUNNEL]              [CLOUDFLARE PAGES]
  Full (Strict) HTTPS          Ingress Routing Matrix           Static SPA Hosting
  DDoS & WAF Protection        Zero-Port Forwarding             Global CDN Distribution
        │                                │                                │
        └────────────────────────────────┼────────────────────────────────┘
                                         │
                                         ▼
                             COSPACE LOCAL SERVICES
                                         │
              ┌──────────────────────────┴──────────────────────────┐
              ▼                                                     ▼
      [CLIENT SERVICES]                                     [ADMIN SERVICES]
      • Frontend: Port 5173                                 • Frontend: Port 5174
      • Backend:  Port 3001                                 • Backend:  Port 3002
      • PostgreSQL: Port 5432                               • PostgreSQL: Port 5432
```

---

## 2. Option A: Quick Tunnels (Instant Public Demo URLs)

Cloudflare Quick Tunnels generate ephemeral public HTTPS URLs (e.g. `https://xxx.trycloudflare.com`) without requiring an account or custom domain.

### Step 1: Install `cloudflared` CLI
- **Windows (winget)**: `winget install Cloudflare.cloudflared`
- **Windows (Chocolatey)**: `choco install cloudflared`
- **macOS (Homebrew)**: `brew install cloudflared`
- **Direct Binary Download**: [GitHub Releases](https://github.com/cloudflare/cloudflared/releases/latest)

### Step 2: Start CoSpace
```bash
npm run dev
```

### Step 3: Launch Tunnel
```bash
# Tunnel Client Application (Frontend on 5173, reverse proxies to 3001 API)
npm run tunnel:client

# Or Tunnel Admin Application (Frontend on 5174, reverse proxies to 3002 API)
npm run tunnel:admin
```

Cloudflare outputs a public HTTPS link:
```text
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at:                                          |
|  https://random-subdomain.trycloudflare.com                                                |
+--------------------------------------------------------------------------------------------+
```

---

## 3. Option B: Production Named Cloudflare Tunnel (Custom Domain)

For permanent custom domains (e.g. `cospace.yourdomain.com` and `admin.cospace.yourdomain.com`):

### Step 1: Authenticate Cloudflare
```bash
cloudflared tunnel login
```

### Step 2: Create Named Tunnel
```bash
cloudflared tunnel create cospace-tunnel
```
This generates a tunnel UUID and credentials file (e.g. `~/.cloudflared/<UUID>.json`).

### Step 3: Route DNS Records
```bash
# Route Client Frontend & API
cloudflared tunnel route dns cospace-tunnel cospace.yourdomain.com

# Route Admin Frontend & API
cloudflared tunnel route dns cospace-tunnel admin.cospace.yourdomain.com
```

### Step 4: Configure `cloudflare/config.yml`
Update [cloudflare/config.yml](file:///c:/Users/rcaru/CoSpace/cloudflare/config.yml) with your Tunnel UUID:
```yaml
tunnel: <YOUR_TUNNEL_UUID>
credentials-file: /path/to/<YOUR_TUNNEL_UUID>.json

ingress:
  # Client App (SPA + API)
  - hostname: cospace.yourdomain.com
    path: /api/client/*
    service: http://localhost:3001
  - hostname: cospace.yourdomain.com
    service: http://localhost:5173

  # Admin App (Dashboard + API)
  - hostname: admin.cospace.yourdomain.com
    path: /api/admin/*
    service: http://localhost:3002
  - hostname: admin.cospace.yourdomain.com
    service: http://localhost:5174

  # Fallback catch-all
  - service: http_status:404
```

### Step 5: Run the Tunnel as a Service
```bash
cloudflared tunnel --config cloudflare/config.yml run cospace-tunnel
```

---

## 4. Option C: Cloudflare Pages (Frontend Hosting)

Deploy the React/Vite SPAs directly to Cloudflare Pages for global edge CDN hosting:

### Step 1: Build Frontends
```bash
npm run build
```

### Step 2: Deploy to Pages via Wrangler
```bash
# Deploy Client Frontend
npx wrangler pages deploy Client/Frontend/dist --project-name=cospace-client

# Deploy Admin Frontend
npx wrangler pages deploy Admin/Frontend/dist --project-name=cospace-admin
```

---

## 5. Security, CORS & SSL/TLS Configuration

### Cloudflare SSL/TLS Mode
- In Cloudflare Dashboard $\rightarrow$ **SSL/TLS**: Set encryption mode to **Full** or **Full (Strict)**.
- Enable **Always Use HTTPS** and **Automatic HTTPS Rewrites**.

### CORS Compatibility
Both `Client/Backend` and `Admin/Backend` are configured to automatically permit:
- Configured production URLs (`CLIENT_FRONTEND_URL`, `ADMIN_FRONTEND_URL`)
- Any Cloudflare tunnel domains (`*.trycloudflare.com`)
- Any Cloudflare Pages domains (`*.pages.dev`)
- Custom origins specified via `ALLOWED_ORIGINS` environment variable in `.env`.
