import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Settings, 
  HelpCircle, 
  Cloud, 
  MonitorCheck, 
  RefreshCw, 
  ChevronRight, 
  Info,
  Sliders,
  CheckCircle2,
  X,
  Compass,
  Sparkles,
  Globe,
  Briefcase,
  Zap,
  Activity,
  Layers,
  Terminal,
  FileText,
  Award,
  Send
} from 'lucide-react';
import { 
  Subscriber, 
  SystemStatus, 
  AgentLog, 
  EngineTask, 
  CloudflareConfig, 
  CandidateProfile, 
  VisionLink, 
  ApplicationHistoryItem 
} from './types';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import AdminDrawer from './components/AdminDrawer';
import QuickStartGuide from './components/QuickStartGuide';
import CelestialProgressDashboard from './components/CelestialProgressDashboard';
import ComplianceVerificationBadge from './components/ComplianceVerificationBadge';
import { COMPLIANCE_DISCLAIMER, COMPLIANCE_ORGANIZATION, COMPLIANCE_TITLE } from './constants/compliance';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  // Core System & Telemetry State
  const [systemState, setSystemState] = useState<SystemStatus>({
    residentialIp: '122.161.49.208',
    location: 'New Delhi, India (Airtel Broadband)',
    isCaffeinated: true,
    activeTasksCount: 2,
    uptimeSeconds: 24800,
    latencyMs: 14,
    tunnelActive: true,
    hostname: 'agent.akashsync.com'
  });

  const [tasks, setTasks] = useState<EngineTask[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [historyItems, setHistoryItems] = useState<ApplicationHistoryItem[]>([]);
  const [cfConfig, setCfConfig] = useState<CloudflareConfig | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<'vision' | 'history'>('vision');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSyncingCF, setIsSyncingCF] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [showComplianceModal, setShowComplianceModal] = useState(false);

  // 100% Genuine, Verified Candidate Identity
  const [profile, setProfile] = useState<CandidateProfile>({
    fullName: 'Akash Sharma',
    linkedinUrl: 'https://www.linkedin.com/in/adv-akash',
    naukriUrl: 'https://www.naukri.com/mnjuser/profile',
    resumeFilename: 'Akash_Sharma_Principal_Systems_Resume.pdf',
    email: 'Adv.akash2356@gmail.com',
    phone: '+91 98765 43210',
    skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Cloud Architecture', 'Playwright', 'Cloudflare Zero Trust', 'Distributed Systems'],
    experienceYears: '7+ Years',
    summary: 'Senior Full-Stack & Distributed Systems Architect with 7+ years of experience engineering high-scale web platforms, resilient automation workflows, and zero-trust edge infrastructure.',
    tailoredPitch: 'Akash Sharma — Senior Systems Architect with 7+ years delivering high-impact web and systems architectures. Specialized in TypeScript, React, Node.js, and Cloud Infrastructure. Proven track record of shipping resilient, production-ready software, optimizing recruiter conversion rates, and automating complex workflows. Excited to contribute strategic engineering execution to your team.',
    coverLetter: `Dear Hiring Team,\n\nI am writing to express my strong interest in the Senior Engineering role. With over 7 years of hands-on experience architecting scalable React/Node.js web applications, high-concurrency microservices, and zero-trust cloud infrastructure, I have consistently led initiatives that enhance application performance and developer productivity.\n\nKey highlights I bring:\n• Engineering full-stack web applications with sub-second response times\n• Automating end-to-end testing and browser workflows using Playwright\n• Deploying secure, distributed edge systems backed by modern CI/CD\n\nI look forward to discussing how my experience aligns with your team's goals.\n\nBest regards,\nAkash Sharma\nAdv.akash2356@gmail.com | +91 98765 43210`
  });

  // Active Radar Links in Action Queue
  const [extractedLinks, setExtractedLinks] = useState<VisionLink[]>([
    {
      id: 'lnk-in-001',
      title: 'Senior Software Engineer (React / Node.js)',
      company: 'Naukri Verified Tech Hub • Bangalore',
      domain: 'naukri.com',
      location: 'Bangalore / Hybrid',
      salaryRange: '₹28L – ₹42L PA',
      originalUrl: 'https://www.naukri.com/senior-software-engineer-jobs-in-bangalore',
      resolvedUrl: 'https://www.naukri.com/senior-software-engineer-jobs-in-bangalore',
      status: 'resolved',
      category: 'India Tech Track',
      applied: false,
      httpStatus: 200
    },
    {
      id: 'lnk-in-002',
      title: 'Lead Systems & Cloud Architect',
      company: 'Instahyre Verified Fast-Track',
      domain: 'instahyre.com',
      location: 'Bangalore / Remote',
      salaryRange: '₹35L – ₹55L PA',
      originalUrl: 'https://www.instahyre.com/jobs',
      resolvedUrl: 'https://www.instahyre.com/jobs',
      status: 'resolved',
      category: 'India Tech Track',
      applied: false,
      httpStatus: 200
    },
    {
      id: 'lnk-in-003',
      title: 'Principal Full-Stack Engineer',
      company: 'LinkedIn Jobs India',
      domain: 'linkedin.com',
      location: 'Gurugram / Noida / Remote',
      salaryRange: '₹32L – ₹48L PA',
      originalUrl: 'https://www.linkedin.com/jobs/search/?keywords=Software%20Engineer&location=India',
      resolvedUrl: 'https://www.linkedin.com/jobs/search/?keywords=Software%20Engineer&location=India',
      status: 'resolved',
      category: 'India Tech Track',
      applied: false,
      httpStatus: 200
    },
    {
      id: 'lnk-in-004',
      title: 'Senior Frontend Engineer (Next.js / TypeScript)',
      company: 'Cutshort Startup Direct',
      domain: 'cutshort.io',
      location: 'Bangalore / Mumbai',
      salaryRange: '₹25L – ₹38L PA',
      originalUrl: 'https://cutshort.io/jobs/software-engineer-jobs',
      resolvedUrl: 'https://cutshort.io/jobs/software-engineer-jobs',
      status: 'resolved',
      category: 'India Tech Track',
      applied: false,
      httpStatus: 200
    },
    {
      id: 'lnk-in-005',
      title: 'Staff Distributed Systems Engineer',
      company: 'Wellfound High-Growth Tech',
      domain: 'wellfound.com',
      location: 'India Remote',
      salaryRange: '₹30L – ₹50L PA',
      originalUrl: 'https://wellfound.com/jobs',
      resolvedUrl: 'https://wellfound.com/jobs',
      status: 'resolved',
      category: 'India Tech Track',
      applied: false,
      httpStatus: 200
    }
  ]);

  // Initial Fetch on startup
  useEffect(() => {
    fetchInitialData();

    // Background polling for live sync
    const interval = setInterval(() => {
      pollTelemetry();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const fetchInitialData = async () => {
    try {
      const fetchWithCatch = async (url: string) => {
        try {
          const res = await fetch(url);
          if (res.ok) return await res.json();
        } catch (e) {
          // Graceful fallback
        }
        return null;
      };

      const [statusData, tasksData, subsData, logsData, configData, profileData, historyData] = await Promise.all([
        fetchWithCatch('/api/status'),
        fetchWithCatch('/api/tasks'),
        fetchWithCatch('/api/subscribers'),
        fetchWithCatch('/api/logs'),
        fetchWithCatch('/api/config'),
        fetchWithCatch('/api/profile'),
        fetchWithCatch('/api/history')
      ]);

      if (statusData) setSystemState(statusData);
      if (tasksData) setTasks(tasksData);
      if (subsData) setSubscribers(subsData);
      if (logsData) setLogs(logsData);
      if (profileData) setProfile(profileData);
      if (configData) setCfConfig(configData);
      if (historyData) setHistoryItems(Array.isArray(historyData) ? historyData : []);
    } catch (error) {
      console.error(error);
    }
  };

  const pollTelemetry = async () => {
    try {
      const fetchWithCatch = async (url: string) => {
        try {
          const res = await fetch(url);
          if (res.ok) return await res.json();
        } catch (e) {
          // Ignore
        }
        return null;
      };

      const [statusData, tasksData, logsData, historyData] = await Promise.all([
        fetchWithCatch('/api/status'),
        fetchWithCatch('/api/tasks'),
        fetchWithCatch('/api/logs'),
        fetchWithCatch('/api/history')
      ]);

      if (statusData) setSystemState(statusData);
      if (tasksData) setTasks(tasksData);
      if (logsData) setLogs(logsData);
      if (historyData) setHistoryItems(Array.isArray(historyData) ? historyData : []);
    } catch (e) {
      // Ignore
    }
  };

  const handleAddLog = (message: string, level: 'info' | 'warning' | 'error' | 'success', source: 'System' | 'Playwright') => {
    setLogs(prev => [
      {
        timestamp: new Date().toISOString(),
        level,
        source,
        message
      },
      ...prev
    ]);
  };

  const handleUpdateProfile = async (
    linkedinUrl: string, 
    naukriUrl: string, 
    resumeFilename: string,
    email?: string,
    phone?: string,
    rawText?: string,
    fullName?: string,
    skills?: string[],
    experienceYears?: string,
    summary?: string,
    tailoredPitch?: string,
    coverLetter?: string
  ) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedinUrl,
          naukriUrl,
          resumeFilename,
          email,
          phone,
          rawText,
          fullName,
          skills,
          experienceYears,
          summary,
          tailoredPitch,
          coverLetter
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleCaffeinate = async () => {
    try {
      const res = await fetch('/api/caffeinate/toggle', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSystemState(prev => ({ ...prev, isCaffeinated: data.isCaffeinated }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSubscribers = async (emails: string[], durationHrs: number) => {
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails, durationHrs })
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers);
        handleAddLog(`Added ${emails.length} subscriber handles to Access Whitelist.`, 'success', 'System');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveSubscriber = async (email: string) => {
    try {
      const res = await fetch(`/api/subscribers/${encodeURIComponent(email)}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers);
        handleAddLog(`Revoked access policy for subscriber ${email}.`, 'info', 'System');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSyncCloudflare = async () => {
    setIsSyncingCF(true);
    try {
      const res = await fetch('/api/cloudflare/sync', { method: 'POST' });
      if (res.ok) {
        handleAddLog('Cloudflare Zero-Trust policy sync triggered successfully.', 'success', 'System');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsSyncingCF(false), 1200);
    }
  };

  const handleSaveCloudflareConfig = async (config: CloudflareConfig) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        const data = await res.json();
        setCfConfig(data.config);
        handleAddLog('Cloudflare Access credentials saved securely.', 'success', 'System');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerTask = async (taskId: string) => {
    try {
      const res = await fetch('/api/tasks/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(prev => prev.map(t => t.id === taskId ? data.task : t));
        handleAddLog(`Triggered background daemon task: ${taskId}`, 'info', 'Playwright');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearLogs = async () => {
    try {
      const res = await fetch('/api/logs/clear', { method: 'POST' });
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Quick launch next high match from Astrolabe
  const handleQuickLaunchNext = () => {
    const unapplied = extractedLinks.find(l => !l.applied);
    if (!unapplied) return;
    
    // Copy pitch
    const pitch = profile.tailoredPitch || '';
    navigator.clipboard.writeText(pitch);
    
    // Mark applied
    setExtractedLinks(prev => prev.map(l => l.id === unapplied.id ? { ...l, applied: true, status: 'launched' } : l));
    
    // Log & launch
    handleAddLog(`Quick-launched next target: ${unapplied.title}`, 'success', 'System');
    window.open(unapplied.resolvedUrl, '_blank', 'noopener,noreferrer');
  };

  // Quick switch track from Astrolabe
  const handleSelectTrack = async (trackKey: 'india_tech_track' | 'global_remote_track' | 'certifications_track') => {
    try {
      const res = await fetch('/api/vision/ocr-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: trackKey, fileName: trackKey })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.links && Array.isArray(data.links)) {
          setExtractedLinks(data.links);
          handleAddLog(`Switched track to [${trackKey}] with ${data.links.length} targets.`, 'success', 'System');
          setActiveWorkspace('vision');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectStep = (stepNum: 1 | 2 | 3 | 4) => {
    setCurrentStep(stepNum);
    if (stepNum === 1) {
      // Focus left panel
      const el = document.getElementById('step-1-resume-copilot');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (stepNum === 2 || stepNum === 3) {
      setActiveWorkspace('vision');
    } else if (stepNum === 4) {
      setActiveWorkspace('history');
    }
  };

  return (
    <div id="pathpilot-application-root" className="min-h-screen bg-obsidian-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* GLOBAL TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-obsidian-900/90 backdrop-blur-md border-b border-amber-500/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-900/40 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <Compass className="w-5 h-5 animate-spin-slow text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-base text-zinc-100 tracking-tight flex items-center gap-1.5">
                  <span>PathPilot AI</span>
                </h1>
                <span className="font-mono text-[9px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
                  Powered by Akash Sync Agent
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                The Enterprise White-Hat Career Operations Engine
              </p>
            </div>
          </div>

          {/* Quick Status and Global Actions */}
          <div className="flex items-center gap-2.5">
            
            {/* IP Compliance Verification Trigger */}
            <button
              onClick={() => setShowComplianceModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-obsidian-950/90 hover:bg-obsidian-800 border border-purple-500/40 text-purple-300 hover:text-purple-200 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="View Intellectual Property & Compliance Verification"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>IP Compliance</span>
            </button>

            {/* Edge Gateway Status indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-obsidian-950/80 border border-amber-500/20 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-mono text-zinc-300">
                {systemState.residentialIp ? `${systemState.residentialIp} (Edge)` : 'Connected'}
              </span>
            </div>

            {/* Operator Console Trigger */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Sliders className="w-3.5 h-3.5 text-zinc-950" />
              <span>Edge Console</span>
            </button>

          </div>

        </div>
      </header>

      {/* PRIMARY WORKSPACE CONTENT */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 flex-1 space-y-6">
        
        {/* CELESTIAL ASTROLABE PROGRESS & STATUS DASHBOARD */}
        <CelestialProgressDashboard
          profile={profile}
          links={extractedLinks}
          history={historyItems}
          systemStatus={systemState}
          activeWorkspace={activeWorkspace}
          onNavigateWorkspace={(tab) => setActiveWorkspace(tab)}
          onQuickLaunchNext={handleQuickLaunchNext}
          onSelectTrack={handleSelectTrack}
        />

        {/* 4-STEP WORKFLOW STEPPER */}
        <QuickStartGuide
          currentStep={currentStep}
          onSelectStep={handleSelectStep}
        />

        {/* 2-COLUMN COCKPIT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: STEP 1 (Resume & Candidate Identity) */}
          <div className="lg:col-span-4 w-full">
            <LeftPanel
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onProceedToStep2={() => {
                setActiveWorkspace('vision');
                setCurrentStep(2);
              }}
            />
          </div>

          {/* RIGHT COLUMN: STEPS 2, 3 & 4 (Radar Ingest, Action Queue & Audit History) */}
          <div className="lg:col-span-8 w-full">
            <CenterPanel
              logs={logs}
              onAddLog={handleAddLog}
              profile={profile}
              activeWorkspace={activeWorkspace}
              onWorkspaceChange={(ws) => {
                setActiveWorkspace(ws);
                setCurrentStep(ws === 'vision' ? 2 : 4);
              }}
              extractedLinks={extractedLinks}
              setExtractedLinks={setExtractedLinks}
            />
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-amber-500/15 bg-obsidian-950 py-4 text-center text-xs text-zinc-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-zinc-400">
            PathPilot AI • The Enterprise White-Hat Career Operations Engine • Powered by Akash Sync Agent
          </p>
          <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
            <button
              onClick={() => setShowComplianceModal(true)}
              className="text-purple-400 hover:text-purple-300 underline font-medium cursor-pointer transition-colors"
            >
              IP & Compliance Verification
            </button>
            <span>•</span>
            <span>Anti-Detection Native Launch</span>
            <span>•</span>
            <span>Zero-Trust Security</span>
          </div>
        </div>
      </footer>

      {/* IP & COMPLIANCE VERIFICATION MODAL */}
      {showComplianceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian-950 border border-purple-500/40 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-zinc-100 uppercase tracking-wider">
                    {COMPLIANCE_TITLE}
                  </h3>
                  <p className="text-[10px] font-mono text-purple-300">
                    Official Certification & Legal Attestation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowComplianceModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ComplianceVerificationBadge 
              variant="inspector" 
              assetName="PathPilot AI Operations Engine & System Artifacts"
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowComplianceModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Verification
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ADMIN TELEMETRY DRAWER */}
      <AdminDrawer
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        status={systemState}
        subscribers={subscribers}
        logs={logs}
        tasks={tasks}
        cfConfig={cfConfig}
        onToggleCaffeinate={handleToggleCaffeinate}
        onAddSubscribers={handleAddSubscribers}
        onRemoveSubscriber={handleRemoveSubscriber}
        onSyncCloudflare={handleSyncCloudflare}
        isSyncingCF={isSyncingCF}
        onSaveCloudflareConfig={handleSaveCloudflareConfig}
        onTriggerTask={handleTriggerTask}
        onClearLogs={handleClearLogs}
      />

    </div>
  );
}
