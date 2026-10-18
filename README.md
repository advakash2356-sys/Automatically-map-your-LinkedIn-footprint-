# Automatically-map-your-LinkedIn-footprint-

> **Prototype / demo.** This project uses simulated data. It has **no real LinkedIn access**: no login, no scraping of your profile, and nothing is posted or applied on your behalf. Telemetry (IP, location, tunnel, latency, progress/"humanized visit" steps) is sample data generated in `server.ts`, and the IP shown is a reserved documentation address. Treat it as a UI/workflow concept, not a working footprint-mapping tool.

The Enterprise White-Hat Career Operations Engine powered by Akash Sync Agent to automatically map your career footprint.

## Features

- **Safe 4-Step Copilot Deck**: Operations flow for India and Global Remote career opportunities.
- **Resume & Document Ingestion**: Ingests and parses documents using `pdf-parse` and `mammoth`.
- **OCR Job Ingestion & AI Analysis**: Powered by Google GenAI (`@google/genai`).
- **Telemetry & Engine Tracking (demo/simulated)**: Dashboard showing IP, location, tunnel status, latency, uptime and caffeination state. These values are hardcoded demo data in `server.ts`, not live measurements.
- **Admin & Control Drawer**: Manage network settings, subscribers, tasks, logs, and Cloudflare configurations.
- **Celestial Progress Dashboard**: Dynamic completion scoring across profile ingestion, target verification, and application history.
- **Workspace Navigation**: Dedicated views including VisionPanel, HistoryPanel, QuickStartGuide, and Compliance Verification.
- **Compliance & Audit Exports**: Built-in compliance checks and verification tracking.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Motion, Lucide React
- **Backend**: Express, Node.js, `tsx`, `esbuild`
- **AI / SDK**: `@google/genai` (Google GenAI)
- **Document Parsers**: `pdf-parse`, `mammoth`
- **Language / Tooling**: TypeScript

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Create a `.env` file from `.env.example` and supply your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: `GEMINI_API_KEY` is required by `server.ts` to initialize the Google GenAI client).*

## Usage

- **Start Development Server**:
  ```bash
  npm run dev
  ```
  Runs `tsx server.ts` (starts Express server on port 3000 with Vite middleware integration).

- **Type Check**:
  ```bash
  npm run lint
  ```

- **Production Build**:
  ```bash
  npm run build
  ```

- **Start Production Server**:
  ```bash
  npm start
  ```

- **Clean Build Artifacts**:
  ```bash
  npm run clean
  ```

## Project Structure

```
├── .env.example
├── .gitignore
├── assets/
│   └── .aistudio/
│       └── .gitignore
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── AdminDrawer.tsx
│   │   ├── CelestialProgressDashboard.tsx
│   │   ├── CenterPanel.tsx
│   │   ├── ComplianceVerificationBadge.tsx
│   │   ├── HistoryPanel.tsx
│   │   ├── LeftPanel.tsx
│   │   ├── QuickStartGuide.tsx
│   │   ├── RightPanel.tsx
│   │   └── VisionPanel.tsx
│   ├── constants/
│   │   └── compliance.ts
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── tsconfig.json
└── vite.config.ts

## Add your API key

AI features need a Gemini API key (free at https://aistudio.google.com/apikey). Two ways:

1. **In the app (recommended):** click the **Enter your API key** button (bottom-right). The key field is masked (Show/Hide toggle) and has a **Remove key** button.
2. **Server env var:** set `GEMINI_API_KEY` in `.env.local` / your host's secrets (see `.env.example`).

**Privacy:** a key entered in the app is stored only in your own browser (localStorage). It is never committed to git and never logged. It is attached only to requests to this app's own server, held in memory for that request, and forwarded straight to Google's Gemini API. Click **Remove key** to delete it at any time.
