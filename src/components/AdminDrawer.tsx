import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Terminal, 
  Users, 
  Sliders, 
  RefreshCw, 
  Cloud, 
  Activity, 
  Cpu, 
  Globe, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Key,
  Server,
  Sparkles,
  Compass
} from 'lucide-react';
import { Subscriber, SystemStatus, AgentLog, EngineTask, CloudflareConfig } from '../types';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  status: SystemStatus;
  subscribers: Subscriber[];
  logs: AgentLog[];
  tasks: EngineTask[];
  cfConfig: CloudflareConfig | null;
  onToggleCaffeinate: () => void;
  onAddSubscribers: (emails: string[], durationHrs: number) => void;
  onRemoveSubscriber: (email: string) => void;
  onSyncCloudflare: () => void;
  isSyncingCF: boolean;
  onSaveCloudflareConfig: (config: CloudflareConfig) => void;
  onTriggerTask: (taskId: string) => void;
  onClearLogs: () => void;
}

export default function AdminDrawer({
  isOpen,
  onClose,
  status,
  subscribers,
  logs,
  tasks,
  cfConfig,
  onToggleCaffeinate,
  onAddSubscribers,
  onRemoveSubscriber,
  onSyncCloudflare,
  isSyncingCF,
  onSaveCloudflareConfig,
  onTriggerTask,
  onClearLogs
}: AdminDrawerProps) {
  const [activeTab, setActiveTab] = useState<'network' | 'subscribers' | 'tasks' | 'logs'>('network');
  const [pastedEmails, setPastedEmails] = useState('');
  const [subscriberDuration, setSubscriberDuration] = useState(720);
  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'success' | 'Playwright' | 'Cloudflare' | 'Copilot'>('all');

  const [editCf, setEditCf] = useState<CloudflareConfig>(cfConfig || {
    apiToken: '',
    accountId: '',
    policyId: '',
    appId: '',
    hostname: 'agent.akashsync.com'
  });

  if (!isOpen) return null;

  const handleAddSubscribers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedEmails.trim()) return;

    const emails = pastedEmails
      .split(/[\n,;]+/)
      .map(item => item.trim())
      .filter(item => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item));

    if (emails.length === 0) {
      alert('Could not parse valid email addresses.');
      return;
    }

    onAddSubscribers(emails, subscriberDuration);
    setPastedEmails('');
  };

  const handleSaveCf = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCloudflareConfig(editCf);
  };

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'all') return true;
    if (logFilter === 'error') return log.level === 'error';
    if (logFilter === 'success') return log.level === 'success';
    return log.source === logFilter;
  });

  return (
    <div id="admin-gateway-drawer-overlay" className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end animate-fade-in">
      <div 
        id="admin-gateway-drawer"
        className="w-full max-w-2xl bg-obsidian-900 h-full shadow-2xl flex flex-col border-l border-amber-500/30 animate-slide-in-right overflow-hidden text-zinc-100"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-amber-500/20 bg-obsidian-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-sm text-zinc-100 tracking-tight uppercase">
                  Akash Sync Agent • Edge Gateway Console
                </h2>
                <span className="font-mono text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                  v3.5 Enterprise
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Low-level daemon threads, Cloudflare Access token policies, residential IPs, and system logs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-obsidian-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-obsidian-950 px-5 gap-1 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('network')}
            className={`py-3 px-3.5 border-b-2 font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'network'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Network & Edge Config</span>
          </button>

          <button
            onClick={() => setActiveTab('subscribers')}
            className={`py-3 px-3.5 border-b-2 font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'subscribers'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Subscriber Whitelist ({subscribers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-3.5 border-b-2 font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'tasks'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Daemons & Automation ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-3.5 border-b-2 font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'logs'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Raw System Logs ({logs.length})</span>
          </button>
        </div>

        {/* Drawer Body Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-obsidian-900">
          
          {/* TAB 1: NETWORK & EDGE CONFIG */}
          {activeTab === 'network' && (
            <div className="space-y-4">
              
              {/* Telemetry diagnostics cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-obsidian-950 border border-zinc-800 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 text-[10px] uppercase font-mono font-bold">
                    <Globe className="w-3 h-3" />
                    <span>Residential IP</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-zinc-100">
                    {status.residentialIp || '122.161.49.208'}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">{status.location}</div>
                </div>

                <div className="p-3 bg-obsidian-950 border border-zinc-800 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] uppercase font-mono font-bold">
                    <Activity className="w-3 h-3" />
                    <span>Latency Ping</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-zinc-100">
                    {status.latencyMs} ms
                  </div>
                  <div className="text-[10px] text-emerald-400/80 font-medium">Optimal Edge Ping</div>
                </div>

                <div className="p-3 bg-obsidian-950 border border-zinc-800 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 text-[10px] uppercase font-mono font-bold">
                    <Clock className="w-3 h-3" />
                    <span>Engine Uptime</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-zinc-100">
                    {Math.floor(status.uptimeSeconds / 3600)}h {Math.floor((status.uptimeSeconds % 3600) / 60)}m
                  </div>
                  <div className="text-[10px] text-zinc-400">Local Daemon Session</div>
                </div>
              </div>

              {/* MacOS Caffeinate Toggle */}
              <div className="p-4 bg-obsidian-950 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-xs text-zinc-200">macOS Caffeinate Wrapper</span>
                  </div>
                  <button
                    onClick={onToggleCaffeinate}
                    className={`px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                      status.isCaffeinated
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {status.isCaffeinated ? 'Active (Sleep Blocked)' : 'Disabled'}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Prevents local Apple Silicon macOS host from dropping deep-sleep idle state during automated background queues.
                </p>
              </div>

              {/* Cloudflare Zero-Trust Form */}
              <div className="p-4 bg-obsidian-950 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-xs text-zinc-200">Cloudflare Access Policy Sync</span>
                  </div>
                  <button
                    onClick={onSyncCloudflare}
                    disabled={isSyncingCF}
                    className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncingCF ? 'animate-spin' : ''}`} />
                    <span>Sync Edge Tokens</span>
                  </button>
                </div>

                <form onSubmit={handleSaveCf} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold text-amber-400 mb-1">
                      Cloudflare API Bearer Token
                    </label>
                    <input
                      type="password"
                      value={editCf.apiToken}
                      onChange={(e) => setEditCf({ ...editCf, apiToken: e.target.value })}
                      placeholder="CF_TO_01_A9K8x..."
                      className="w-full bg-obsidian-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-bold text-amber-400 mb-1">
                        Account ID
                      </label>
                      <input
                        type="text"
                        value={editCf.accountId}
                        onChange={(e) => setEditCf({ ...editCf, accountId: e.target.value })}
                        placeholder="9a8d7e6c5b4a..."
                        className="w-full bg-obsidian-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-bold text-amber-400 mb-1">
                        Policy UUID
                      </label>
                      <input
                        type="text"
                        value={editCf.policyId}
                        onChange={(e) => setEditCf({ ...editCf, policyId: e.target.value })}
                        placeholder="ee44d8c2-39b1..."
                        className="w-full bg-obsidian-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold text-amber-400 mb-1">
                      Gateway Hostname
                    </label>
                    <input
                      type="text"
                      value={editCf.hostname}
                      onChange={(e) => setEditCf({ ...editCf, hostname: e.target.value })}
                      placeholder="agent.akashsync.com"
                      className="w-full bg-obsidian-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-lg text-xs cursor-pointer transition-colors shadow-md"
                    >
                      Save Edge Credentials
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: SUBSCRIBERS WHITELIST */}
          {activeTab === 'subscribers' && (
            <div className="space-y-4">
              <div className="p-4 bg-obsidian-950 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-xs text-zinc-200">Add Access Whitelist Handles</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">Direct / Whitelist Dump</span>
                </div>

                <form onSubmit={handleAddSubscribers} className="space-y-3">
                  <textarea
                    value={pastedEmails}
                    onChange={(e) => setPastedEmails(e.target.value)}
                    placeholder="Enter email addresses (one per line or comma-separated):&#10;Adv.akash2356@gmail.com&#10;akash.techlead@gmail.com"
                    rows={3}
                    className="w-full bg-obsidian-900 border border-zinc-700 rounded-lg p-2.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 font-medium">Duration:</span>
                      <select
                        value={subscriberDuration}
                        onChange={(e) => setSubscriberDuration(Number(e.target.value))}
                        className="bg-obsidian-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200"
                      >
                        <option value={24}>24 Hours</option>
                        <option value={72}>72 Hours</option>
                        <option value={168}>7 Days</option>
                        <option value={720}>Permanent (30 Days)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={!pastedEmails.trim()}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Authorize Email</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Subscribers List Table */}
              <div className="p-4 bg-obsidian-950 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                  <span>Active Permitted Subscribers ({subscribers.length})</span>
                  <button
                    onClick={onSyncCloudflare}
                    className="text-amber-400 hover:underline text-[11px] cursor-pointer"
                  >
                    Force Cloudflare Edge Sync
                  </button>
                </div>

                <div className="divide-y divide-zinc-800 max-h-64 overflow-y-auto">
                  {subscribers.map((sub, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono font-medium text-zinc-200">{sub.email}</div>
                        <div className="text-[10px] text-zinc-400">
                          Added: {new Date(sub.addedAt).toLocaleDateString()} • {sub.durationHrs}h policy
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          sub.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {sub.status}
                        </span>
                        <button
                          onClick={() => onRemoveSubscriber(sub.email)}
                          className="p-1 text-zinc-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors cursor-pointer"
                          title="Revoke Permission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAEMONS & TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="p-4 bg-obsidian-950 border border-zinc-800 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-zinc-100">{task.name}</h4>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Platform: {task.platform} • Cron: {task.cronString || 'Manual'}
                      </span>
                    </div>
                    <button
                      onClick={() => onTriggerTask(task.id)}
                      disabled={task.status === 'running'}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
                    >
                      <Play className="w-3 h-3" />
                      <span>{task.status === 'running' ? 'Running...' : 'Run Daemon'}</span>
                    </button>
                  </div>

                  {task.status === 'running' && (
                    <div className="space-y-1">
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-400 h-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-amber-300">{task.currentAction}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: RAW SYSTEM LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-400 font-medium">Filter:</span>
                  {(['all', 'success', 'error', 'Playwright', 'Cloudflare', 'Copilot'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setLogFilter(f)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold capitalize cursor-pointer transition-colors ${
                        logFilter === f
                          ? 'bg-amber-500 text-zinc-950 font-bold'
                          : 'bg-obsidian-950 text-zinc-400 hover:bg-zinc-800 border border-zinc-700'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <button
                  onClick={onClearLogs}
                  className="text-[11px] text-zinc-400 hover:text-red-400 cursor-pointer"
                >
                  Clear Buffer
                </button>
              </div>

              <div className="bg-obsidian-950 rounded-xl p-4 font-mono text-[11px] text-zinc-300 max-h-96 overflow-y-auto space-y-2 border border-zinc-800 shadow-inner">
                {filteredLogs.length === 0 ? (
                  <div className="text-zinc-500 text-center py-6">No matching logs found in active buffer.</div>
                ) : (
                  filteredLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-zinc-500 shrink-0 select-none">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${
                        log.level === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        log.level === 'error' ? 'bg-red-950 text-red-400 border border-red-800' :
                        log.level === 'warning' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-zinc-800 text-zinc-300'
                      }`}>
                        {log.source}
                      </span>
                      <span className="text-zinc-300 break-words flex-1">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-amber-500/20 bg-obsidian-950 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Local Edge System Gateway Connected</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-zinc-200 font-semibold cursor-pointer transition-colors border border-zinc-700"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}
