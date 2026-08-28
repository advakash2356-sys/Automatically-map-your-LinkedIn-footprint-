import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  HelpCircle, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Zap, 
  History,
  ShieldCheck,
  Award
} from 'lucide-react';

interface QuickStartGuideProps {
  currentStep?: 1 | 2 | 3 | 4;
  onSelectStep?: (step: 1 | 2 | 3 | 4) => void;
}

export default function QuickStartGuide({ currentStep = 1, onSelectStep }: QuickStartGuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    {
      num: 1,
      name: 'Identity Calibration',
      tag: 'Step 1: Master Resume',
      desc: 'Drop candidate PDF resume to extract parameters, skills, and generate tailored pitch.',
      icon: FileText,
      color: 'amber'
    },
    {
      num: 2,
      name: 'Multimodal Ingestion',
      tag: 'Step 2: Radar Feeds',
      desc: 'Load curated high-match feeds for Indian & Global remote markets or drop screenshots.',
      icon: ImageIcon,
      color: 'blue'
    },
    {
      num: 3,
      name: 'Safe-Launch Copilot',
      tag: 'Step 3: Action Queue',
      desc: '1-Click Launch copies tailored pitch directly into native clipboard & opens target portal.',
      icon: Zap,
      color: 'amber'
    },
    {
      num: 4,
      name: 'Audit Journal & Export',
      tag: 'Step 4: Audit Center',
      desc: 'Review timestamped launch receipts, filter results, and export CSV/JSON records.',
      icon: History,
      color: 'purple'
    }
  ];

  return (
    <>
      {/* COMPACT WORKFLOW STEPPER BANNER */}
      <div className="celestial-card rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xs text-zinc-100 uppercase tracking-wider">
                  4-Step Navigational Workflow
                </span>
                <span className="font-mono text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                  Guided
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Safe, human-in-the-loop executive career copilot flow.
              </p>
            </div>
          </div>

          {/* Stepper Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-2xl">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = currentStep === s.num;
              
              return (
                <button
                  key={s.num}
                  onClick={() => onSelectStep && onSelectStep(s.num as any)}
                  className={`p-2 rounded-xl text-left transition-all cursor-pointer border flex items-center gap-2 ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                      : 'bg-obsidian-900/60 border-zinc-700/60 text-zinc-400 hover:text-zinc-200 hover:bg-obsidian-900'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono ${
                    isActive ? 'bg-amber-500 text-zinc-950 font-extrabold' : 'bg-obsidian-950 text-zinc-400 border border-zinc-700'
                  }`}>
                    {s.num}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold truncate">{s.name}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Guide Modal Trigger */}
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 bg-obsidian-900 hover:bg-obsidian-800 border border-zinc-700 rounded-xl text-zinc-400 hover:text-amber-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start md:self-center"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Workflow Guide</span>
          </button>

        </div>
      </div>

      {/* FULL DETAILED MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-obsidian-900 border border-amber-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-zinc-100 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-zinc-100">
                    PathPilot AI • Navigational Astrolabe Manual
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Enterprise White-Hat Career Operations Protocol
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-obsidian-800 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Steps Grid */}
            <div className="space-y-3">
              {steps.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.num} className="p-3.5 bg-obsidian-950/80 border border-zinc-800 rounded-xl flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {s.num}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-display">
                        {s.tag} — {s.name}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Close action */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Close & Return to Cockpit
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
