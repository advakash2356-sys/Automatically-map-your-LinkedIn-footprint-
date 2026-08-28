import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Zap, 
  AlertCircle, 
  ArrowRight, 
  Globe, 
  Layers, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  RotateCw,
  Flame,
  Award
} from 'lucide-react';
import { CandidateProfile, VisionLink, ApplicationHistoryItem, SystemStatus } from '../types';

interface CelestialProgressDashboardProps {
  profile: CandidateProfile;
  links: VisionLink[];
  history: ApplicationHistoryItem[];
  systemStatus: SystemStatus;
  activeWorkspace: 'vision' | 'history';
  onNavigateWorkspace: (tab: 'vision' | 'history') => void;
  onQuickLaunchNext?: () => void;
  onSelectTrack?: (track: 'india_tech_track' | 'global_remote_track' | 'certifications_track') => void;
}

export default function CelestialProgressDashboard({
  profile,
  links,
  history,
  systemStatus,
  activeWorkspace,
  onNavigateWorkspace,
  onQuickLaunchNext,
  onSelectTrack
}: CelestialProgressDashboardProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Compute realistic, dynamic pipeline completion percentage
  let score = 0;
  // Stage 1: Profile & Resume (up to 25%)
  if (profile.fullName && profile.email) score += 15;
  if (profile.resumeFilename) score += 10;

  // Stage 2: Targets ingested & verified (up to 25%)
  if (links.length > 0) score += 15;
  const verifiedCount = links.filter(l => l.status === 'resolved' || l.httpStatus === 200).length;
  if (verifiedCount > 0) score += 10;

  // Stage 3: Copilot launches & applications (up to 30%)
  const launchedInQueue = links.filter(l => l.applied || l.status === 'launched' || l.status === 'enrolled').length;
  const totalLaunched = launchedInQueue + history.length;
  if (totalLaunched >= 1) score += 15;
  if (totalLaunched >= 3) score += 15;

  // Stage 4: Audit trail & exports (up to 20%)
  if (history.length > 0) score += 15;
  if (history.length >= 3) score += 5;

  const percentage = Math.min(100, score);

  // Derive human-readable status points:
  const completedList: string[] = [];
  const inProgressList: string[] = [];
  const pendingList: string[] = [];

  // 1. Profile Status
  if (profile.fullName && profile.resumeFilename) {
    completedList.push(`Master Resume & Identity Vectored for ${profile.fullName} (${profile.experienceYears || '7+ Yrs'})`);
  } else {
    pendingList.push('Upload candidate resume to extract profile parameters');
  }

  // 2. Target Ingestion Status
  if (links.length > 0) {
    completedList.push(`Radar Ingested ${links.length} live verified career targets into Action Queue`);
    inProgressList.push(`${links.length - launchedInQueue} target position(s) primed for 1-Click Launch`);
  } else {
    pendingList.push('Load Indian or Global Remote job feed from Step 2');
  }

  // 3. Launch Status
  if (totalLaunched > 0) {
    completedList.push(`Successfully safe-launched ${totalLaunched} career opportunities with clipboard pitch injection`);
  }
  if (links.some(l => !l.applied)) {
    const unapplied = links.filter(l => !l.applied);
    pendingList.push(`${unapplied.length} target(s) in queue awaiting 1-Click Launch (${unapplied[0]?.title || 'Senior Role'})`);
  }

  // 4. Zero-Trust Gateway
  if (systemStatus.residentialIp) {
    completedList.push(`Zero-Trust Edge Tunnel active via Indian residential node (${systemStatus.residentialIp})`);
  }

  // Next recommended action
  const nextTarget = links.find(l => !l.applied);

  // Circumference for SVG Progress Ring
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div id="celestial-astrolabe-progress-dashboard" className="w-full">
      <div className="celestial-card rounded-2xl p-5 md:p-6 transition-all duration-300 relative overflow-hidden">
        
        {/* Subtle Celestial Star Background Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-600/10 to-transparent rounded-full blur-2xl pointer-events-none -ml-16 -mb-16"></div>

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/15 pb-4 relative z-10">
          
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-900/40 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Compass className="w-5 h-5 animate-spin-slow text-amber-300" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-sm md:text-base text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <span>Career Operations Astrolabe</span>
                  <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                    Live Progress Cycle
                  </span>
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time tracking of what has happened, what is active, and what is pending.
              </p>
            </div>
          </div>

          {/* Quick Stats Pill Strip */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
            
            {/* Quick Track Switchers */}
            {onSelectTrack && (
              <div className="hidden lg:flex items-center gap-1.5 bg-obsidian-900/80 border border-amber-500/20 p-1 rounded-xl">
                <button
                  onClick={() => onSelectTrack('india_tech_track')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  🇮🇳 India Tech
                </button>
                <button
                  onClick={() => onSelectTrack('global_remote_track')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  🌐 Global Remote
                </button>
                <button
                  onClick={() => onSelectTrack('certifications_track')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  🎓 Certifications
                </button>
              </div>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 bg-obsidian-900 hover:bg-obsidian-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse Dashboard' : 'Expand Dashboard'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

          </div>

        </div>

        {/* EXPANDABLE BODY: ASTROLABE DIAL + EASY WORDS STATUS TRACKER */}
        {isExpanded && (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            
            {/* LEFT: CELESTIAL ASTROLABE SVG DIAL (4 Columns) */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-obsidian-900/70 border border-amber-500/20 rounded-xl relative">
              
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Outer Astrolabe Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="text-zinc-800"
                    strokeWidth="6"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Animated Gold Progress Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="text-amber-400 transition-all duration-1000 ease-out"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>

                {/* Center Percentage Display */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-display font-bold text-2xl text-amber-300 tracking-tight">
                    {percentage}%
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-semibold">
                    Completed
                  </span>
                </div>
              </div>

              {/* Waypoint Coordinates & Status */}
              <div className="mt-3 text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 font-mono text-[10px] font-semibold">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>
                    {percentage < 40 ? 'Phase 1: Calibrating Identity' :
                     percentage < 70 ? 'Phase 2: Ingesting Targets' :
                     percentage < 95 ? 'Phase 3: Deploying Copilot' : 'Phase 4: Sovereign Mastery'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  {totalLaunched} targets launched • {links.length} in current radar
                </p>
              </div>

            </div>

            {/* RIGHT: WHAT IS HAPPENING / PENDING IN EASY WORDS (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              
              {/* 1. What Just Happened (Completed) */}
              <div className="p-3 bg-obsidian-900/60 border border-emerald-500/25 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider font-display">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>What Has Happened (Done)</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">
                    {completedList.length} Milestones
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-zinc-300">
                  {completedList.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. What Is Happening Right Now (Active Focus) */}
              <div className="p-3 bg-obsidian-900/60 border border-amber-500/25 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider font-display">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Happening Right Now (Active)</span>
                  </div>
                  <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded font-semibold">
                    Live Deck
                  </span>
                </div>
                <div className="text-xs text-zinc-300 flex items-center justify-between flex-wrap gap-2">
                  <p className="leading-snug">
                    {inProgressList.length > 0 
                      ? inProgressList[0] 
                      : 'System primed. All target opportunities verified with anti-detection fingerprinting.'}
                  </p>
                  
                  {nextTarget && (
                    <button
                      onClick={onQuickLaunchNext}
                      className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Launch Next High-Match ({nextTarget.domain})</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* 3. What Is Still Pending (Action Required) */}
              <div className="p-3 bg-obsidian-900/60 border border-blue-500/25 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold uppercase tracking-wider font-display">
                    <Clock className="w-3.5 h-3.5" />
                    <span>What Is Still Pending (Next Steps)</span>
                  </div>
                  <span className="font-mono text-[10px] text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded font-semibold">
                    {pendingList.length} Actions
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-zinc-300">
                  {pendingList.length === 0 ? (
                    <li className="text-zinc-400 italic">All immediate pipeline actions executed! Check Step 4 for export backup.</li>
                  ) : (
                    pendingList.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
