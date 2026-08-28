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
  activeTasksCount?: number;
}

export interface AgentLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  source: 'System' | 'Playwright' | 'Cloudflare' | 'Scheduler' | 'Copilot';
}

export interface EngineTask {
  id: string;
  name: string;
  platform: 'Naukri' | 'LinkedIn' | 'Instahyre' | 'Remotive';
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

export interface ApplicationHistoryItem {
  id: string;
  targetId: string;
  jobTitle?: string;
  portalName?: string;
  company?: string;
  originalUrl: string;
  resolvedUrl: string;
  category: string;
  status: 'Success' | 'Failed' | 'Launched';
  timestamp: string;
  httpStatus?: number;
  notes?: string;
}

export type TargetPayloadType = 'pitch' | 'email' | 'linkedin' | 'phone' | 'cover_letter' | 'custom';

export interface VisionLink {
  id: string;
  title: string;
  company: string;
  domain: string;
  location?: string;
  salaryRange?: string;
  originalUrl: string;
  resolvedUrl: string;
  status: 'pending' | 'resolving' | 'resolved' | 'launched' | 'completed' | 'enrolled' | 'dead_link' | 'failed';
  category: 'India Tech Track' | 'Global Remote Track' | 'Google Course' | 'Coursera Hub' | 'General';
  applied: boolean;
  httpStatus?: number;
  lastValidatedAt?: string;
  selectedPayload?: TargetPayloadType;
  customSnippet?: string;
}

export interface CandidateProfile {
  fullName: string;
  linkedinUrl: string;
  naukriUrl: string;
  resumeFilename: string;
  email: string;
  phone: string;
  skills: string[];
  experienceYears: string;
  summary: string;
  tailoredPitch: string;
  coverLetter?: string;
  rawText?: string;
}

export interface PipelineProgressStats {
  percentage: number;
  stageName: string;
  completedItems: string[];
  inProgressItems: string[];
  pendingItems: string[];
  totalTargets: number;
  launchedTargets: number;
  verifiedActive: number;
  estimatedHoursSaved: number;
}
