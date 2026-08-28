import React, { useState } from 'react';
import { Play, Loader2, Sparkles, Terminal, Trash2, CheckCircle2, ChevronRight, RefreshCw, Eye, Cpu, Clock, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { EngineTask, AgentLog, CandidateProfile } from '../types';
import VisionPanel from './VisionPanel';

interface CenterPanelProps {
  tasks: EngineTask[];
  logs: AgentLog[];
  onTriggerTask: (taskId: string) => void;
  onUpdateTaskSchedule: (
    taskId: string,
    scheduleActive: boolean,
    scheduleType: 'interval' | 'cron',
    intervalMinutes: number,
    cronString: string
  ) => Promise<void>;
  onClearLogs: () => void;
  isTriggering: Record<string, boolean>;
  onRefreshTasks: () => void;
  isRefreshingTasks: boolean;
  onRefreshLogs: () => void;
  profile: CandidateProfile;
}

export default function CenterPanel({
  tasks,
  logs,
  onTriggerTask,
  onUpdateTaskSchedule,
  onClearLogs,
  isTriggering,
  onRefreshTasks,
  isRefreshingTasks,
  onRefreshLogs,
  profile
}: CenterPanelProps) {
  const [activeWorkspace, setActiveWorkspace] = useState<'tasks' | 'vision'>('tasks');
  const [showLogs, setShowLogs] = useState(false); // DEFAULT TO HIDDEN AS REQUESTED!

  // Local schedule editing state variables
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [schedActive, setSchedActive] = useState<boolean>(false);
  const [schedType, setSchedType] = useState<'interval' | 'cron'>('interval');
  const [schedMins, setSchedMins] = useState<number>(30);
  const [schedCron, setSchedCron] = useState<string>('0 */4 * * *');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const startEditing = (task: EngineTask) => {
    setEditingTaskId(task.id);
    setSchedActive(task.scheduleActive ?? false);
    setSchedType(task.scheduleType ?? 'interval');
    setSchedMins(task.intervalMinutes ?? 30);
    setSchedCron(task.cronString ?? '0 */4 * * *');
  };

  const handleSaveSchedule = async (taskId: string) => {
    setIsSaving(true);
    try {
      await onUpdateTaskSchedule(taskId, schedActive, schedType, schedMins, schedCron);
      setEditingTaskId(null);
    } catch (e) {
      // Ignored
    } finally {
      setIsSaving(false);
    }
  };

  const CRON_PRESETS = [
    { label: 'Recruiter Peak Hours (08:00 & 14:00)', value: '0 8,14 * * *' },
    { label: 'Every 4 Hours (Standard Round)', value: '0 */4 * * *' },
    { label: 'Daily at 08:00 AM (Fresh Morning Sync)', value: '0 8 * * *' },
    { label: 'Weekday Morning (Mon-Fri at 09:00 AM)', value: '0 9 * * 1-5' }
  ];

  const INTERVAL_PRESETS = [15, 30, 60, 120, 240, 720];

  const getLevelColor = (level: AgentLog['level']) => {
    switch (level) {
      case 'success': return 'text-emerald-700 font-semibold';
      case 'warning': return 'text-amber-700 font-semibold';
      case 'error': return 'text-red-700 font-bold';
      default: return 'text-zinc-700';
    }
  };

  const getSourceIcon = (source: AgentLog['source']) => {
    switch (source) {
      case 'Playwright': return '🤖 Playwright';
      case 'Cloudflare': return '🌥️ Edge Secure';
      case 'Scheduler': return '⏱️ Cron Daemon';
      default: return '⚙️ Kernel';
    }
  };

  return (
    <div id="center-operation-panel" className="flex flex-col gap-5">
      
      {/* MODULE: TAB COMMAND STRIP */}
      <div className="bg-white border border-[#E4E4E7] rounded-xl p-1.5 shadow-sm grid grid-cols-2 gap-1.5">
        <button
          onClick={() => setActiveWorkspace('tasks')}
          className={`flex items-center justify-center gap-2 py-2.5 font-sans text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all duration-150 ${
            activeWorkspace === 'tasks'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/60'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Automation Engine</span>
        </button>
        <button
          onClick={() => setActiveWorkspace('vision')}
          className={`flex items-center justify-center gap-2 py-2.5 font-sans text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all duration-150 ${
            activeWorkspace === 'vision'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/60'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>OCR Image Ingest</span>
        </button>
      </div>

      {activeWorkspace === 'tasks' ? (
        /* Automation Engine View */
        <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-sm space-y-5">
          
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-blue-600" />
              <h2 className="font-display font-bold text-[13px] tracking-wider text-zinc-800 uppercase">
                2. Execution Operations Console
              </h2>
            </div>
            <button 
              onClick={onRefreshTasks} 
              disabled={isRefreshingTasks}
              className="p-1 rounded bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 cursor-pointer disabled:opacity-50 transition-colors"
              title="Refresh engine tasks status"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-zinc-650 ${isRefreshingTasks ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={`border rounded-lg p-4 transition-all ${
                  task.status === 'running' 
                    ? 'bg-blue-50/20 border-blue-400/80 shadow-inner' 
                    : 'bg-zinc-50/40 border-zinc-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded font-mono text-[8px] font-bold uppercase border ${
                        task.platform === 'Naukri' 
                          ? 'bg-sky-50 text-sky-700 border-sky-200' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {task.platform}
                      </span>
                      <h4 className="font-sans font-bold text-[13px] text-zinc-800">
                        {task.name}
                      </h4>
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      Phase: <strong className="text-zinc-700 font-mono text-[10.5px]">{task.currentAction}</strong>
                    </span>
                  </div>

                  {/* Run trigger */}
                  <div>
                    {task.status === 'running' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 border border-blue-200 text-blue-800 font-mono text-[10.5px] rounded-md animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin text-blue-700" />
                        <span>EXECUTING</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onTriggerTask(task.id)}
                        disabled={isTriggering[task.id]}
                        className="cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-zinc-900 text-white hover:bg-zinc-800 font-mono text-[10.5px] font-bold tracking-wider uppercase transition-colors"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Force Run</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {task.status === 'running' && (
                  <div className="mt-3.5 border-t border-zinc-150 pt-2.5">
                    <div className="flex justify-between items-center mb-1 text-[9.5px] font-mono text-zinc-400">
                      <span>Live Micro-Execution Steps</span>
                      <span className="text-blue-700 font-bold">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Success Indicator Badge */}
                {task.status === 'completed' && (
                  <div className="mt-3 flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded w-fit">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Run completed successfully at {new Date(task.completedAt || '').toLocaleTimeString()}</span>
                  </div>
                )}

                {/* Automation trigger timing controls */}
                <div className="mt-3.5 border-t border-zinc-200/80 pt-2.5 space-y-3">
                  <div className="flex flex-wrap gap-2 items-center justify-between text-[11px] text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-sans font-medium text-zinc-600">Schedule:</span>
                      <span className={`font-mono px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        task.scheduleActive 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                          : 'bg-zinc-150/50 border-zinc-250 text-zinc-450'
                      }`}>
                        {task.scheduleActive ? 'Automated Cycle' : 'Manual Pick'}
                      </span>
                      {task.scheduleActive && (
                        <span className="text-zinc-500 text-[10px]">
                          {task.scheduleType === 'interval' 
                            ? `(Every ${task.intervalMinutes}m)` 
                            : `(${task.cronString})`}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (editingTaskId === task.id) {
                          setEditingTaskId(null);
                        } else {
                          startEditing(task);
                        }
                      }}
                      className="cursor-pointer px-2 py-0.5 rounded border border-zinc-200 hover:border-zinc-350 bg-white text-[10px] font-mono tracking-wide text-zinc-650"
                    >
                      {editingTaskId === task.id ? 'Cancel' : 'Change timing'}
                    </button>
                  </div>

                  {task.scheduleActive && task.nextScheduledAt && (
                    <div className="bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded text-[10px] text-zinc-500 inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Next automated activation scheduled for:</span>
                      <span className="text-zinc-800 font-mono font-semibold">
                        {new Date(task.nextScheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  )}

                  {/* TIMING CONFIGURATION PANEL */}
                  {editingTaskId === task.id && (
                    <div className="mt-1 p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3 shadow-inner">
                      
                      <div className="flex justify-between items-center bg-white p-2.5 rounded border border-zinc-200">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-800">Timing Switch Trigger</span>
                          <span className="text-[10px] text-zinc-400">Trigger background loop periodically</span>
                        </div>
                        <button
                          onClick={() => setSchedActive(!schedActive)}
                          className={`cursor-pointer px-2 py-1 rounded text-[9px] font-mono transition-all font-bold ${
                            schedActive 
                              ? 'bg-zinc-900 border border-zinc-900 text-white' 
                              : 'bg-zinc-150 border border-zinc-250 text-zinc-400'
                          }`}
                        >
                          {schedActive ? '✅ AUTOMATION ENGAGED' : '❌ PAUSED'}
                        </button>
                      </div>

                      {schedActive && (
                        <div className="space-y-3 animate-fade-in text-xs">
                          
                          {/* Segment trigger logic type */}
                          <div className="grid grid-cols-2 p-1 bg-white rounded border border-zinc-200">
                            <button
                              type="button"
                              onClick={() => setSchedType('interval')}
                              className={`py-1 rounded text-[9.5px] font-mono uppercase font-bold tracking-wider transition-colors ${
                                schedType === 'interval'
                                  ? 'bg-zinc-100 text-zinc-850 font-black'
                                  : 'text-zinc-400 hover:text-zinc-700'
                              }`}
                            >
                              Interval (Minutes)
                            </button>
                            <button
                              type="button"
                              onClick={() => setSchedType('cron')}
                              className={`py-1 rounded text-[9.5px] font-mono uppercase font-bold tracking-wider transition-colors ${
                                schedType === 'cron'
                                  ? 'bg-zinc-100 text-zinc-850 font-black'
                                  : 'text-zinc-400 hover:text-zinc-700'
                              }`}
                            >
                              Peak Preset Cycles
                            </button>
                          </div>

                          {/* Interval picker */}
                          {schedType === 'interval' ? (
                            <div className="flex flex-col gap-2 bg-white p-2.5 border border-zinc-150 rounded">
                              <span className="text-zinc-500 text-[10.5px]">Configure minute repeat interval:</span>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="5"
                                  max="1440"
                                  value={schedMins}
                                  onChange={(e) => setSchedMins(Math.max(5, Number(e.target.value) || 5))}
                                  className="w-16 px-1.5 py-0.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-800 font-mono text-xs focus:border-zinc-450 focus:outline-none"
                                />
                                <span className="text-zinc-400 font-sans">minutes</span>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 mt-1">
                                {INTERVAL_PRESETS.map((val) => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setSchedMins(val)}
                                    className={`cursor-pointer px-1.5 py-0.5 rounded font-mono text-[9px] border transition-colors ${
                                      schedMins === val
                                        ? 'bg-zinc-900 border-zinc-900 text-white font-extrabold'
                                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                                    }`}
                                  >
                                    {val >= 60 ? `${val / 60}h` : `${val}m`}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            /* Cron Presets picker */
                            <div className="flex flex-col gap-2 bg-white p-2.5 border border-zinc-150 rounded space-y-1">
                              <span className="text-zinc-500 text-[10.5px]">Choose peak hour automation:</span>
                              <div className="flex flex-col gap-1.5">
                                {CRON_PRESETS.map((preset) => (
                                  <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => setSchedCron(preset.value)}
                                    className={`cursor-pointer flex justify-between items-center px-2 py-1 rounded text-left transition-colors border text-[10.5px] gap-2 ${
                                      schedCron === preset.value
                                        ? 'bg-blue-50/50 border-blue-400 text-zinc-900 font-semibold'
                                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                                    }`}
                                  >
                                    <span className="truncate">{preset.label}</span>
                                    <span className="font-mono text-[8.5px] bg-white border border-zinc-150 px-1 py-0.5 rounded text-zinc-450 shrink-0">
                                      {preset.value}
                                    </span>
                                  </button>
                                ))}
                              </div>

                              <div className="pt-2 border-t border-zinc-150 flex flex-col gap-1">
                                <span className="text-[9px] text-zinc-450 font-mono uppercase font-black">Or Customize Native Cron:</span>
                                <input
                                  type="text"
                                  value={schedCron}
                                  onChange={(e) => setSchedCron(e.target.value)}
                                  className="w-full px-2 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-800 font-mono text-[10.5px] focus:outline-none focus:border-zinc-400"
                                  placeholder="* * * * *"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Config confirming CTAs */}
                      <div className="flex justify-end gap-1.5 pt-2 border-t border-zinc-200">
                        <button
                          type="button"
                          onClick={() => setEditingTaskId(null)}
                          className="px-2.5 py-1 rounded text-[10px] font-mono border border-zinc-205 text-zinc-500 hover:text-zinc-800 cursor-pointer"
                        >
                          Keep current
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveSchedule(task.id)}
                          disabled={isSaving}
                          className="cursor-pointer bg-zinc-900 text-white font-bold text-[10px] px-3.5 py-1 rounded hover:bg-zinc-850 inline-flex items-center gap-1"
                        >
                          {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                          <span>Confirm Sync</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      ) : (
        /* OCR Workspace - passed to VisionPanel */
        <VisionPanel profile={profile} onAddLog={(msg, lvl, src) => onRefreshLogs()} />
      )}

      {/* MODULE: HIDDEN TECHNICAL LOGS TOGGLE PANEL */}
      <div className="bg-white border border-[#E4E4E7] rounded-xl p-4 shadow-sm flex flex-col gap-2">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="flex justify-between items-center text-xs font-bold text-zinc-700 hover:text-zinc-900 cursor-pointer w-full text-left focus:outline-none"
        >
          <div className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-blue-600" />
            <span>Show System Diagnostics Debugger Dashboard Logs</span>
          </div>
          {showLogs ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showLogs && (
          <div className="pt-2 border-t border-zinc-100 flex flex-col gap-3 animate-fade-in">
            
            <div className="flex justify-between items-center bg-zinc-900 text-white rounded px-4 py-2 font-mono text-[10.5px]">
              <span>Console logs trace buffer: static.log</span>
              <button
                onClick={onClearLogs}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-red-400 cursor-pointer transition-colors"
                title="Flush console log buffer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded p-3.5 max-h-[220px] overflow-y-auto font-mono text-[11px] space-y-2 select-none">
              {logs.length === 0 ? (
                <div className="text-zinc-400 text-center py-6 italic font-sans text-xs">
                  Console telemetry cache buffer is completely empty.
                </div>
              ) : (
                logs.map((log, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-1.5 hover:bg-zinc-100 py-0.5 rounded px-1 transition-colors"
                  >
                    <div className="text-zinc-400 text-[10px]">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </div>
                    <div className="text-zinc-500 text-[9px] font-bold uppercase border border-zinc-200 rounded px-1 shrink-0 bg-white">
                      {getSourceIcon(log.source)}
                    </div>
                    <span className={`leading-relaxed break-all ${getLevelColor(log.level)}`}>
                      {log.message}
                    </span>
                    {log.level === 'success' && <ChevronRight className="w-3 h-3 text-emerald-600 shrink-0 ml-auto self-center" />}
                  </div>
                ))
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
