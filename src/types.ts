export interface Subscriber {
  email: string;
  addedAt: string;
  durationHrs: number;
  status: 'Active' | 'Expired';
}

export interface SystemStatus {
  uptimeSeconds: number;
  isCaffeinated: boolean;
  residentialIp: string;
  location: string;
  latencyMs: number;
  tunnelActive: boolean;
  hostname: string;
}

export interface AgentLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  source: 'System' | 'Playwright' | 'Cloudflare' | 'Scheduler';
}

export interface EngineTask {
  id: string;
  name: string;
  platform: 'Naukri' | 'LinkedIn';
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  currentAction: string;
  startedAt?: string;
  completedAt?: string;
  scheduleActive?: boolean;
  scheduleType?: 'interval' | 'cron';
  intervalMinutes?: number;
  cronString?: string;
  nextScheduledAt?: string;
  lastTriggeredAt?: string;
}

export interface CloudflareConfig {
  apiToken: string;
  accountId: string;
  policyId: string;
  appId: string;
  hostname: string;
}

export interface CandidateProfile {
  linkedinUrl: string;
  naukriUrl: string;
  resumeFilename: string;
  email?: string;
  phone?: string;
  rawText?: string;
}

