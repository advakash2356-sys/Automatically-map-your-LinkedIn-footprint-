# Automatically-map-your-LinkedIn-footprint-

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
