# Agentic AI Navigator

Interactive learning curriculum covering AI agents, RAG, multi-agent systems, and production deployment.

## Quick Deploy (Free)

### Option 1: Vercel (Recommended) ⚡
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → Sign up free with GitHub
3. Click **"Add New Project"** → Import your repo
4. It auto-detects Vite. Click **Deploy**
5. Done — you get a `*.vercel.app` URL

**Free tier:** 100GB bandwidth/month, unlimited deploys, handles 500+ concurrent easily.

### Option 2: Netlify
1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → Sign up free
3. Click **"Add new site"** → Import from Git → Select repo
4. Build command: `npm run build` | Publish dir: `dist`
5. Click **Deploy**

**Free tier:** 100GB bandwidth/month, 300 build minutes/month.

### Option 3: GitHub Pages (No build server needed)
```bash
npm install
npm run build
# Push the dist/ folder to gh-pages branch
```

### Option 4: Cloudflare Pages
1. Push to GitHub
2. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
3. Connect repo → Framework: Vite → Deploy

**Free tier:** Unlimited bandwidth, 500 deploys/month.

## Local Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview  # test production build locally
```
