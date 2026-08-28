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
  X
} from 'lucide-react';
import { Subscriber, SystemStatus, AgentLog, EngineTask, CloudflareConfig, CandidateProfile } from './types';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';

export default function App() {
  // Application State
  const [systemState, setSystemState] = useState<SystemStatus | null>(null);
  const [tasks, setTasks] = useState<EngineTask[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [cfConfig, setCfConfig] = useState<CloudflareConfig | null>(null);
  const [profile, setProfile] = useState<CandidateProfile>({
    linkedinUrl: 'https://linkedin.com/in/adv-akash',
    naukriUrl: 'https://naukri.com/mnjuser/profile',
    resumeFilename: 'Akash_Resume_Lead_Systems.pdf'
  });

  // UI state
  const [isCfConfigOpen, setIsCfConfigOpen] = useState(false);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [isRefreshingTasks, setIsRefreshingTasks] = useState(false);
  const [isLoadingCaffeinate, setIsLoadingCaffeinate] = useState(false);
  const [isAddingSubscribers, setIsAddingSubscribers] = useState(false);
  const [isSyncingCF, setIsSyncingCF] = useState(false);

  // Form State for CF modal
  const [cfApiToken, setCfApiToken] = useState('');
  const [cfAccountId, setCfAccountId] = useState('');
  const [cfPolicyId, setCfPolicyId] = useState('');
  const [cfAppId, setCfAppId] = useState('');
  const [cfHostname, setCfHostname] = useState('');

  // Initial Fetch on startup
  useEffect(() => {
    fetchInitialData();

    // Setup polling every 4 seconds to simulate live telemetry updating
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
          if (res.ok) {
            return await res.json();
          }
        } catch (e) {
          // Gracefully ignore transient failures on initial launch
        }
        return null;
      };

      const [statusData, tasksData, subsData, logsData, configData, profileData] = await Promise.all([
        fetchWithCatch('/api/status'),
        fetchWithCatch('/api/tasks'),
        fetchWithCatch('/api/subscribers'),
        fetchWithCatch('/api/logs'),
        fetchWithCatch('/api/config'),
        fetchWithCatch('/api/profile')
      ]);

      if (statusData) setSystemState(statusData);
      if (tasksData) setTasks(tasksData);
      if (subsData) setSubscribers(subsData);
      if (logsData) setLogs(logsData);
      if (profileData) setProfile(profileData);
      
      if (configData) {
        setCfConfig(configData);
        setCfApiToken(configData.apiToken || '');
        setCfAccountId(configData.accountId || '');
        setCfPolicyId(configData.policyId || '');
        setCfAppId(configData.appId || '');
        setCfHostname(configData.hostname || '');
      }
    } catch (error) {
      // Ignored
    }
  };

  const pollTelemetry = async () => {
    try {
      const fetchWithCatch = async (url: string) => {
        try {
          const res = await fetch(url);
          if (res.ok) {
            return await res.json();
          }
        } catch (e) {
          // Gracefully ignore transient failures during polling
        }
        return null;
      };

      const [statusData, tasksData, logsData] = await Promise.all([
        fetchWithCatch('/api/status'),
        fetchWithCatch('/api/tasks'),
        fetchWithCatch('/api/logs')
      ]);

      if (statusData) setSystemState(statusData);
      if (tasksData) setTasks(tasksData);
      if (logsData) setLogs(logsData);
    } catch (e) {
      // Ignored
    }
  };

  const handleRefreshStats = async () => {
    setIsRefreshingStats(true);
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        setSystemState(await res.json());
      }
      const resLogs = await fetch('/api/logs');
      if (resLogs.ok) {
        setLogs(await resLogs.json());
      }
    } catch (e) {
      // Catch silently on transient offline state
    } finally {
      setTimeout(() => setIsRefreshingStats(false), 800);
    }
  };

  const handleRefreshTasks = async () => {
    setIsRefreshingTasks(true);
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        setTasks(await res.json());
      }
    } catch (e) {
      // Catch silently on transient offline state
    } finally {
      setTimeout(() => setIsRefreshingTasks(false), 800);
    }
  };

  const handleToggleCaffeinate = async () => {
    setIsLoadingCaffeinate(true);
    try {
      const res = await fetch('/api/caffeinate/toggle', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (systemState) {
          setSystemState({ ...systemState, isCaffeinated: data.isCaffeinated });
        }
      }
      const resLogs = await fetch('/api/logs');
      if (resLogs.ok) setLogs(await resLogs.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingCaffeinate(false);
    }
  };

  const handleTriggerTask = async (taskId: string) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'running', progress: 5 } : t));
      
      const res = await fetch('/api/tasks/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(prev => prev.map(t => t.id === taskId ? data.task : t));
      }
    } catch (e) {
      console.error('Failed to trigger task runner daemon', e);
    }
  };

  const handleUpdateTaskSchedule = async (
    taskId: string,
    scheduleActive: boolean,
    scheduleType: 'interval' | 'cron',
    intervalMinutes: number,
    cronString: string
  ) => {
    try {
      const res = await fetch('/api/tasks/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          scheduleActive,
          scheduleType,
          intervalMinutes,
          cronString
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(prev => prev.map(t => t.id === taskId ? data.task : t));
        const resLogs = await fetch('/api/logs');
        if (resLogs.ok) setLogs(await resLogs.json());
      }
    } catch (e) {
      console.error('Failed to configure scheduled routine', e);
    }
  };

  const handleClearLogs = async () => {
    try {
      const res = await fetch('/api/logs/clear', { method: 'POST' });
      if (res.ok) setLogs(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = async (
    linkedinUrl: string, 
    naukriUrl: string, 
    resumeFilename: string,
    email?: string,
    phone?: string,
    rawText?: string
  ) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl, naukriUrl, resumeFilename, email, phone, rawText })
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        
        // Refresh whitelisted subscribers since extraction auto-registers they too!
        const resSubs = await fetch('/api/subscribers');
        if (resSubs.ok) setSubscribers(await resSubs.json());

        const resLogs = await fetch('/api/logs');
        if (resLogs.ok) setLogs(await resLogs.json());
      }
    } catch (err) {
      console.error('Failed to update candidate profile', err);
    }
  };

  const handleAddSubscribers = async (emails: string[], durationHrs: number) => {
    setIsAddingSubscribers(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails, durationHrs })
      });
      if (res.ok) {
        setSubscribers(await res.json());
        // Fetch fresh logs to show newly added candidates
        const resLogs = await fetch('/api/logs');
        if (resLogs.ok) setLogs(await resLogs.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAddingSubscribers(false);
    }
  };

  const handleRemoveSubscriber = async (email: string) => {
    try {
      const res = await fetch('/api/subscribers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers);
        // Fetch update log sequence
        const resLogs = await fetch('/api/logs');
        if (resLogs.ok) setLogs(await resLogs.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCfConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiToken: cfApiToken,
          accountId: cfAccountId,
          policyId: cfPolicyId,
          appId: cfAppId,
          hostname: cfHostname
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCfConfig(data.cloudflareConfig);
          setIsCfConfigOpen(false);
          const resLogs = await fetch('/api/logs');
          if (resLogs.ok) setLogs(await resLogs.json());
        }
      }
    } catch (err) {
      console.error('Failed to save config parameters', err);
    }
  };

  const handleSyncCloudflare = async () => {
    setIsSyncingCF(true);
    try {
      const res = await fetch('/api/cloudflare/sync', { method: 'POST' });
      if (res.ok) {
        // Simple artificial delay to let user see edge execution sequence
        setTimeout(async () => {
          setIsSyncingCF(false);
          const resLogs = await fetch('/api/logs');
          if (resLogs.ok) setLogs(await resLogs.json());
        }, 1200);
      } else {
        setIsSyncingCF(false);
      }
    } catch (e) {
      console.error(e);
      setIsSyncingCF(false);
    }
  };

  return (
    <div id="akash-sync-workspace" className="min-h-screen bg-[#F4F4F5] text-zinc-900 flex flex-col selection:bg-blue-150 selection:text-blue-800">
      
      {/* 1. Global Head Command HUD - Crisp Stark White Header */}
      <header id="akash-sync-hud" className="border-b border-[#E4E4E7] bg-white/95 backdrop-blur sticky top-0 z-40 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo Title Group */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 p-0.5 flex items-center justify-center shadow-sm">
              <Sliders className="w-4.5 h-4.5 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-lg tracking-tight text-zinc-850 uppercase">
                  Akash Sync Agent
                </h1>
                <span className="font-mono text-[8.5px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 rounded font-bold">
                  v2.8-think
                </span>
              </div>
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">
                Productivity Sync Operating Workspace
              </span>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex flex-wrap items-center gap-3 md:gap-5">
            
            {/* Tunnel Status Flag */}
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg shadow-inner">
              <Cloud className="w-3.5 h-3.5 text-blue-600" />
              <div className="flex flex-col">
                <span className="font-mono text-[8px] text-zinc-400 uppercase">CF Tunnel Core</span>
                <span className="font-sans text-[10.5px] font-bold text-zinc-700">ACTIVE Edge Secure</span>
              </div>
            </div>

            {/* Compliance State Flag */}
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg shadow-inner">
              <MonitorCheck className="w-3.5 h-3.5 text-emerald-750" />
              <div className="flex flex-col">
                <span className="font-mono text-[8px] text-zinc-400 uppercase">Human Emulation</span>
                <span className="font-sans text-[10.5px] font-bold text-emerald-700">STEALTH ACTIVE</span>
              </div>
            </div>

            {/* Cloudflare Zone Parameters Trigger */}
            <button
              onClick={() => setIsCfConfigOpen(true)}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 hover:border-zinc-350 text-zinc-600 hover:text-zinc-900 font-mono text-[10.5px] font-bold transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>CF ZONE CONFIG</span>
            </button>
          </div>

         </div>
      </header>

      {/* 2. Main Three-Panel Operating Deck */}
      <main id="command-grid-deck" className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel 1: Identity & Network (LEFT) */}
        <LeftPanel 
          status={systemState}
          onToggleCaffeinate={handleToggleCaffeinate}
          isLoadingCaffeinate={isLoadingCaffeinate}
          onRefreshStats={handleRefreshStats}
          isRefreshing={isRefreshingStats}
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
        />

        {/* Panel 2: Telemetry Execution Deck (CENTER) */}
        <CenterPanel 
          tasks={tasks}
          logs={logs}
          onTriggerTask={handleTriggerTask}
          onUpdateTaskSchedule={handleUpdateTaskSchedule}
          onClearLogs={handleClearLogs}
          isTriggering={tasks.reduce((acc, t) => ({ ...acc, [t.id]: t.status === 'running' }), {})}
          onRefreshTasks={handleRefreshTasks}
          isRefreshingTasks={isRefreshingTasks}
          onRefreshLogs={pollTelemetry}
          profile={profile}
        />

        {/* Panel 3: Access control Whitelists (RIGHT) */}
        <RightPanel 
          subscribers={subscribers}
          onAddSubscribers={handleAddSubscribers}
          onRemoveSubscriber={handleRemoveSubscriber}
          onSyncCloudflare={handleSyncCloudflare}
          isSyncingCF={isSyncingCF}
          isAddingSubscribers={isAddingSubscribers}
        />

      </main>

      {/* 3. Cloudflare Configuration Overlay (Secrets parameters drawer modal) */}
      {isCfConfigOpen && (
        <div id="cloudflare-config-overlay" className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-zinc-200 rounded-xl max-w-md w-full p-6 relative flex flex-col gap-4 shadow-xl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600" />
                <h3 className="font-display font-bold text-sm text-zinc-800 uppercase tracking-wider">
                  Cloudflare Zero Trust Setup
                </h3>
              </div>
              <button 
                onClick={() => setIsCfConfigOpen(false)}
                className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Disclaimer */}
            <div className="bg-zinc-50 p-3 border border-zinc-200 rounded-lg">
              <p className="font-sans text-[11px] text-zinc-500 leading-relaxed">
                Provide credentials for the Cloudflare API integration. When subscribers are updated or manual Edge Sync is triggered, Akash Sync Agent communicates securely over native Edge rules.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCfConfig} className="flex flex-col gap-3.5">
              
              <div className="flex flex-col gap-1">
                <label className="font-sans text-[10px] text-zinc-500 uppercase font-bold" htmlFor="cf-token-field">
                  CF API Zero Trust Token
                </label>
                <input
                  id="cf-token-field"
                  type="password"
                  value={cfApiToken}
                  onChange={(e) => setCfApiToken(e.target.value)}
                  placeholder="Bearer YOUR_CLOUDFLARE_API_TOKEN"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-1.5 text-xs font-mono text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-405"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-sans text-[10px] text-zinc-500 uppercase font-bold" htmlFor="cf-account-field">
                  Cloudflare Account Identifier
                </label>
                <input
                  id="cf-account-field"
                  type="text"
                  value={cfAccountId}
                  onChange={(e) => setCfAccountId(e.target.value)}
                  placeholder="YOUR_CLOUDFLARE_ACCOUNT_ID"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-1.5 text-xs font-mono text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-405"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-sans text-[10px] text-zinc-500 uppercase font-bold" htmlFor="cf-policy-field">
                    Access Policy UUID
                  </label>
                  <input
                    id="cf-policy-field"
                    type="text"
                    value={cfPolicyId}
                    onChange={(e) => setCfPolicyId(e.target.value)}
                    placeholder="POLICY_UUID"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-1.5 text-xs font-mono text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-405"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-sans text-[10px] text-zinc-500 uppercase font-bold" htmlFor="cf-app-field">
                    Application ID
                  </label>
                  <input
                    id="cf-app-field"
                    type="text"
                    value={cfAppId}
                    onChange={(e) => setCfAppId(e.target.value)}
                    placeholder="APPLICATION_UUID"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-1.5 text-xs font-mono text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-405"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-sans text-[10px] text-zinc-500 uppercase font-bold" htmlFor="cf-host-field">
                  Domain Mapping URL
                </label>
                <input
                  id="cf-host-field"
                  type="text"
                  value={cfHostname}
                  onChange={(e) => setCfHostname(e.target.value)}
                  placeholder="agent.akashsync.com"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-1.5 text-xs font-mono text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-405"
                />
              </div>

              {/* Action Sheet */}
              <div className="border-t border-zinc-100 pt-3.5 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsCfConfigOpen(false)}
                  className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-500 rounded cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 px-5 py-2 font-bold rounded flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>COMMIT CHANGES</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 4. Global System Footer Info */}
      <footer id="akash-sync-footer" className="mt-auto border-t border-zinc-200 bg-white py-4.5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-sans">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Local deployment operates secure loop cycles entirely inside safe containers.</span>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-450">
            <span>Local Port: <strong className="text-zinc-700">3000 (Proxy Target)</strong></span>
            <span>Sleep Override: <strong className="text-emerald-750">100% Caffeinated</strong></span>
            <span>Gateway ID: <strong className="text-zinc-700">India Zone Core</strong></span>
          </div>

        </div>
      </footer>

    </div>
  );
}
