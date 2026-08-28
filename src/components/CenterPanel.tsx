import React, { useState } from 'react';
import { 
  Eye, 
  History, 
  FileText, 
  Layers, 
  Zap, 
  Sparkles, 
  Download, 
  RefreshCw 
} from 'lucide-react';
import { CandidateProfile, AgentLog, VisionLink } from '../types';
import VisionPanel from './VisionPanel';
import HistoryPanel from './HistoryPanel';

interface CenterPanelProps {
  logs: AgentLog[];
  onAddLog: (message: string, level: 'info' | 'warning' | 'error' | 'success', source: 'System' | 'Playwright') => void;
  profile: CandidateProfile;
  activeWorkspace?: 'vision' | 'history';
  onWorkspaceChange?: (workspace: 'vision' | 'history') => void;
  extractedLinks: VisionLink[];
  setExtractedLinks: React.Dispatch<React.SetStateAction<VisionLink[]>>;
}

export default function CenterPanel({
  logs,
  onAddLog,
  profile,
  activeWorkspace: controlledWorkspace,
  onWorkspaceChange,
  extractedLinks,
  setExtractedLinks
}: CenterPanelProps) {
  const [internalWorkspace, setInternalWorkspace] = useState<'vision' | 'history'>('vision');
  const activeWorkspace = controlledWorkspace !== undefined ? controlledWorkspace : internalWorkspace;

  const setActiveWorkspace = (ws: 'vision' | 'history') => {
    setInternalWorkspace(ws);
    if (onWorkspaceChange) onWorkspaceChange(ws);
  };

  return (
    <div id="center-operation-panel" className="flex flex-col gap-4">
      
      {/* WORKSPACE TAB STRIP */}
      <div className="celestial-card rounded-2xl p-1.5 shadow-lg grid grid-cols-2 gap-1.5">
        <button
          onClick={() => setActiveWorkspace('vision')}
          className={`flex items-center justify-center gap-2 py-2.5 font-display text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all duration-150 ${
            activeWorkspace === 'vision'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold shadow-md'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-obsidian-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="truncate">Steps 2 & 3: Ingest & Action Queue</span>
        </button>

        <button
          onClick={() => setActiveWorkspace('history')}
          className={`flex items-center justify-center gap-2 py-2.5 font-display text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all duration-150 ${
            activeWorkspace === 'history'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold shadow-md'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-obsidian-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span className="truncate">Step 4: Audit History & Export</span>
        </button>
      </div>

      {/* ACTIVE WORKSPACE CONTENT */}
      {activeWorkspace === 'vision' ? (
        <VisionPanel 
          onAddLog={onAddLog} 
          profile={profile} 
          onNavigateToHistory={() => setActiveWorkspace('history')}
          extractedLinks={extractedLinks}
          setExtractedLinks={setExtractedLinks}
        />
      ) : (
        <HistoryPanel 
          onAddLog={onAddLog} 
          profile={profile} 
        />
      )}

    </div>
  );
}
