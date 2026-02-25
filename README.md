<p align="center">
  <img src="https://img.shields.io/badge/⚡-Agentic_AI_Navigator-0d9488?style=for-the-badge&labelColor=020617" alt="Agentic AI Navigator" />
</p>

<h1 align="center">Agentic AI Navigator</h1>

<p align="center">
  <strong>An interactive, self-paced learning platform for mastering Agentic AI — from ReAct fundamentals through production-grade multi-agent systems.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react&logoColor=white" alt="React 18.3" />
  <img src="https://img.shields.io/badge/Vite-6.0-646cff?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Bundle-67KB_gzip-22c55e?style=flat-square" alt="67KB gzipped" />
  <img src="https://img.shields.io/badge/Dependencies-2-14b8a6?style=flat-square" alt="2 dependencies" />
  <img src="https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square" alt="MIT License" />
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-curriculum">Curriculum</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 📖 Overview

**Agentic AI Navigator** is a browser-based, gamified learning platform designed for **semi-technical professionals, business leaders, and developers** who want to understand the architecture and implementation of modern AI agent systems.

The curriculum covers **15 modules across 5 phases**, progressing from foundational agent concepts to production deployment patterns. Each module includes rich explanatory content, animated architecture diagrams, key takeaways, and interactive knowledge-check quizzes with XP tracking.

### Who Is This For?

| Audience | What You'll Learn |
|---|---|
| **Business Leaders & PMs** | How agents work, what RAG is, how to evaluate AI systems |
| **Solutions Architects** | Multi-agent orchestration, LangGraph patterns, production observability |
| **Software Engineers** | Tool calling, chunking strategies, prompt injection defenses |
| **AI/ML Engineers** | Advanced RAG pipelines, hybrid retrieval, evaluation metrics |

---

## ✨ Features

### 🎓 Learning Experience
- **15 progressive modules** with gated advancement — complete quizzes to unlock the next step
- **Interactive architecture diagrams** — animated SVG flowcharts for every concept (ReAct loops, RAG pipelines, LangGraph graphs, etc.)
- **Knowledge-check quizzes** with randomized answer ordering, instant feedback, and explanations
- **XP and streak tracking** — gamified progression with visual progress bars
- **Key takeaways** — concise, scannable summaries for each module

### 📱 Fully Responsive
- Optimized layouts for phones (360px+), tablets, and desktop
- Touch-optimized interactions with no hover dependencies
- iOS safe-area support (notch, Dynamic Island, home indicator)
- Fluid typography using CSS `clamp()` for all text sizes
- Diagrams auto-scale with responsive node sizing and spacing

### ⚡ Performance
- **67KB gzipped** total bundle — no external runtime dependencies beyond React
- **Zero heavy libraries** — diagrams rendered with pure React SVG (no D3, no canvas)
- Memoized components (`React.memo`) to prevent unnecessary re-renders
- Debounced state persistence (300ms) to reduce storage writes
- CSS animations only — no JavaScript animation libraries

### ♿ Accessibility
- Full ARIA labeling (`role`, `aria-label`, `aria-expanded`, `aria-current`, `aria-checked`)
- `role="radiogroup"` and `role="radio"` for quiz options
- `role="progressbar"` for XP and course progress indicators
- Keyboard navigation support (`N` = next module, `P` = previous module)
- `focus-visible` outlines on all interactive elements
- Decorative elements marked `aria-hidden="true"`

### 💾 Persistent Progress
- Progress, XP, quiz answers, and streaks saved to `localStorage`
- Automatic resume on return visits
- Reset option with confirmation modal

---

## 📚 Curriculum

### Phase A — Agent Foundations (Modules 1–6)

| # | Module | Concept |
|---|---|---|
| 1 | **The Agentic Core** | The ReAct (Reason + Act) Loop |
| 2 | **Contextual Intelligence** | Advanced Retrieval-Augmented Generation |
| 3 | **Multi-Agent Systems** | LangGraph Architectures |
| 4 | **Agent Basics** | Chatbot vs Agent vs Workflow |
| 5 | **Tool Use** | Reliable Tool Calling Patterns |
| 6 | **Planning** | Plan First, Execute Second |

### Phase B — RAG Deep Dive (Modules 7–10)

| # | Module | Concept |
|---|---|---|
| 7 | **Chunking** | How to Split Documents Correctly |
| 8 | **Embeddings** | Meaning as Vectors |
| 9 | **Retrieval** | Top-K, Filters, MMR, Hybrid Search |
| 10 | **Prompt Assembly** | Grounded Generation |

### Phase C — Evaluation & Security (Modules 11–12)

| # | Module | Concept |
|---|---|---|
| 11 | **RAG Evaluation** | Groundedness and Relevance Metrics |
| 12 | **Threats** | Prompt Injection in RAG Systems |

### Phase D — Multi-Agent Systems (Modules 13–14)

| # | Module | Concept |
|---|---|---|
| 13 | **LangGraph Execution** | Nodes, Edges, and Control Flow |
| 14 | **Agent Reliability** | Budgets, Retries, and Stop Conditions |

### Phase E — Production Systems (Module 15)

| # | Module | Concept |
|---|---|---|
| 15 | **Productionization** | Observability and Testing |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) **18+** (LTS recommended)
- npm (comes with Node.js)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/agentic-ai-navigator.git
cd agentic-ai-navigator

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview the production build locally
npm run preview
```

The production build outputs to the `dist/` directory.

---

## 🌐 Deployment

All options below are **100% free** and can handle **500+ concurrent users** without issue.

### Option 1: Vercel (Recommended)

The fastest path from code to live URL.

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Sign up with GitHub (free)
3. Click **"Add New Project"** → Import your repository
4. Vercel auto-detects Vite — click **Deploy**
5. Live at `your-project.vercel.app` in ~60 seconds

| Vercel Free Tier | Limit |
|---|---|
| Bandwidth | 100 GB/month |
| Deployments | Unlimited |
| Custom domains | Yes |
| SSL | Automatic |
| Edge CDN | Global |

> The included `vercel.json` handles SPA routing and asset caching headers automatically.

### Option 2: Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → Sign up (free)
3. **"Add new site"** → Import from Git → Select repo
4. Build command: `npm run build` — Publish directory: `dist`
5. Click **Deploy site**

| Netlify Free Tier | Limit |
|---|---|
| Bandwidth | 100 GB/month |
| Build minutes | 300/month |
| Custom domains | Yes |
| SSL | Automatic |

> The included `netlify.toml` configures build settings and SPA redirects.

### Option 3: Cloudflare Pages

1. Push to GitHub
2. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
3. Connect repository → Framework preset: **Vite** → Deploy
4. Live at `your-project.pages.dev`

| Cloudflare Pages Free Tier | Limit |
|---|---|
| Bandwidth | **Unlimited** |
| Deployments | 500/month |
| Custom domains | Yes |
| SSL | Automatic |

### Option 4: GitHub Pages

```bash
# Install gh-pages helper
npm install -D gh-pages

# Add to package.json scripts:
# "deploy": "npm run build && gh-pages -d dist"

# Then run:
npm run deploy
```

> **Note:** Set `base: '/your-repo-name/'` in `vite.config.js` if deploying to a subpath.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | React 18.3 | Component architecture, state management |
| **Build Tool** | Vite 6 | Development server, production bundling |
| **Diagrams** | Pure SVG (React) | Animated architecture diagrams — zero library dependency |
| **Styling** | CSS-in-JS + CSS Variables | Theming, responsive design, animations |
| **State** | React hooks + localStorage | Persistent progress tracking |
| **Animations** | CSS Keyframes | Fade-up, shake, confetti, pulse effects |
| **Typography** | Instrument Sans + JetBrains Mono | Body text + code/mono elements |

### Why No External Libraries?

This project deliberately avoids heavy dependencies:

- **No D3.js** — Diagrams use pure React SVG with `useMemo` for path calculations
- **No animation library** — CSS keyframes handle all motion
- **No state management library** — React's built-in `useState`/`useCallback`/`useMemo` suffice
- **No CSS framework** — CSS variables + inline styles for full control

Result: **2 production dependencies** (React + ReactDOM), **67KB gzipped** total.

---

## 📁 Project Structure

```
agentic-ai-navigator/
├── public/                  # Static assets
├── src/
│   ├── App.jsx              # Entire application (single-file architecture)
│   │   ├── Data             # 15 modules × 5 phases with content, diagrams, quizzes
│   │   ├── ToastProvider    # Notification system
│   │   ├── Diagram          # Pure SVG diagram renderer (memoized)
│   │   ├── Md               # Markdown-to-HTML renderer (memoized)
│   │   ├── Quiz             # Quiz with deterministic shuffle (memoized)
│   │   ├── SidebarItem      # Navigation item (memoized)
│   │   └── AppCore          # Main app shell with state management
│   └── main.jsx             # React DOM entry point
├── index.html               # HTML shell with meta tags
├── vite.config.js           # Vite build configuration
├── vercel.json              # Vercel deployment config
├── netlify.toml             # Netlify deployment config
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

---

## ⚙️ Configuration

### Environment

No environment variables required. The app is entirely client-side.

### Customization

**Add or edit modules** — Modify the `steps` array in `src/App.jsx`:

```jsx
{
  id: 16,
  phase: "E",
  title: "Your New Module",
  conceptName: "Your Concept",
  icon: "🎯",
  markdownContent: `### Your Heading\nYour content with **bold** and *italic*...`,
  keyTakeaways: ["Takeaway 1", "Takeaway 2"],
  diagram: {
    nodes: [
      { id: "a", label: "Node A", type: "process", x: 0.2, y: 0.5 },
      { id: "b", label: "Node B", type: "output", x: 0.8, y: 0.5 },
    ],
    edges: [
      { from: "a", to: "b", label: "Flow" },
    ]
  },
  activity: {
    question: "Your quiz question?",
    options: ["Wrong A", "Wrong B", "Correct C", "Wrong D"],
    correctIndex: 2,
    explanation: "Why C is correct."
  }
}
```

**Add new phases** — Add to the `phases` array:

```jsx
{ id: "F", name: "Advanced Topics", color: "#ef4444", icon: "🔬", range: [16, 18] }
```

**Diagram node types** — Available visual styles:

| Type | Color | Use For |
|---|---|---|
| `terminal` | Grey | Start/End nodes |
| `process` | Teal | Processing steps |
| `agent` | Teal (alt) | AI agents |
| `supervisor` | Orange | Orchestrator nodes |
| `input` | Blue | Data inputs |
| `output` | Green | Results/outputs |
| `external` | Indigo | External services/tools |
| `database` | Purple | Storage/databases |

---

## 🧪 Browser Support

| Browser | Version | Status |
|---|---|---|
| Chrome | 90+ | ✅ Fully supported |
| Firefox | 90+ | ✅ Fully supported |
| Safari | 15+ | ✅ Fully supported |
| Edge | 90+ | ✅ Fully supported |
| Safari iOS | 15+ | ✅ Fully supported |
| Chrome Android | 90+ | ✅ Fully supported |

---

## 🧰 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR at `localhost:5173` |
| `npm run build` | Create optimized production build in `dist/` |
| `npm run preview` | Serve the production build locally for testing |

---

## 🤝 Contributing

Contributions are welcome! Here's how to help:

### Adding Content

1. Fork the repository
2. Add or improve modules in the `steps` array
3. Each module needs: `markdownContent`, `diagram`, `keyTakeaways`, and `activity`
4. Submit a pull request

### Reporting Issues

- Open a [GitHub Issue](../../issues) with:
  - Browser and device info
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshot if applicable

### Development Guidelines

- Keep the single-file architecture — it enables easy sharing and embedding
- Memoize new components with `React.memo` if they receive stable props
- Wrap callbacks in `useCallback` to prevent re-render cascades
- Test on mobile (360px width) before submitting
- Maintain ARIA labeling on all interactive elements
- No new runtime dependencies without strong justification

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgements

- Curriculum content informed by research from [Anthropic](https://www.anthropic.com), [LangChain](https://langchain.com), and [LlamaIndex](https://llamaindex.ai)
- Typography: [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans) and [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
- Built with [React](https://react.dev) and [Vite](https://vitejs.dev)

---

<p align="center">
  <strong>⚡ Built for the AI Navigator Program ⚡</strong>
  <br/>
  <sub>Designed for semi-technical professionals mastering the agentic AI landscape</sub>
</p>