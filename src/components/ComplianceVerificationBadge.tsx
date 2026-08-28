import React, { useState } from 'react';
import { ShieldCheck, Check, Copy, Sparkles, Scale, Info, FileCheck, Lock } from 'lucide-react';
import { COMPLIANCE_DISCLAIMER, COMPLIANCE_ORGANIZATION, COMPLIANCE_TITLE } from '../constants/compliance';

interface ComplianceVerificationBadgeProps {
  variant?: 'compact' | 'card' | 'footer' | 'inspector' | 'banner';
  assetName?: string;
  className?: string;
  showCopy?: boolean;
}

export default function ComplianceVerificationBadge({
  variant = 'compact',
  assetName,
  className = '',
  showCopy = true
}: ComplianceVerificationBadgeProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(COMPLIANCE_DISCLAIMER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy compliance disclaimer', err);
    }
  };

  if (variant === 'compact') {
    return (
      <div 
        onClick={() => setExpanded(!expanded)}
        className={`inline-flex flex-col gap-1 text-[10px] bg-obsidian-950/80 border border-amber-500/25 rounded-lg p-2 transition-all cursor-pointer hover:border-amber-500/50 ${className}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold font-mono uppercase text-[9px] tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>IP & Compliance Verified</span>
          </div>
          {showCopy && (
            <button
              onClick={handleCopy}
              className="text-zinc-400 hover:text-amber-300 p-0.5 rounded transition-colors"
              title="Copy Compliance Disclaimer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
        {expanded ? (
          <p className="text-[10px] text-zinc-400 leading-relaxed pt-1 border-t border-zinc-800">
            {COMPLIANCE_DISCLAIMER}
          </p>
        ) : (
          <p className="text-[9px] text-zinc-500 truncate max-w-xs">
            {COMPLIANCE_ORGANIZATION} • Human-directed AI orchestration
          </p>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`p-3 bg-obsidian-950/90 border border-amber-500/25 rounded-xl text-xs space-y-1.5 shadow-md ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-300 font-bold font-display text-[11px] uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{COMPLIANCE_TITLE}</span>
            {assetName && <span className="text-zinc-400 font-normal font-sans">({assetName})</span>}
          </div>
          {showCopy && (
            <button
              onClick={handleCopy}
              className="text-[10px] font-mono text-zinc-400 hover:text-amber-300 inline-flex items-center gap-1 bg-obsidian-900 border border-zinc-700/80 px-2 py-0.5 rounded cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Disclaimer</span>
                </>
              )}
            </button>
          )}
        </div>
        <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
          {COMPLIANCE_DISCLAIMER}
        </p>
      </div>
    );
  }

  if (variant === 'inspector') {
    return (
      <div className={`p-4 bg-obsidian-950 border border-amber-500/30 rounded-xl space-y-2.5 ${className}`}>
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-zinc-100 uppercase tracking-wider">
                {COMPLIANCE_TITLE}
              </h4>
              <p className="text-[10px] font-mono text-amber-400/80">
                Official Certification • {COMPLIANCE_ORGANIZATION}
              </p>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-obsidian-900 hover:bg-obsidian-800 border border-zinc-700 text-zinc-200 rounded-lg text-[10px] font-mono font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Disclaimer Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-amber-400" />
                <span>Copy Legal Notice</span>
              </>
            )}
          </button>
        </div>

        <div className="p-2.5 bg-obsidian-900/90 rounded-lg border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed italic">
          "{COMPLIANCE_DISCLAIMER}"
        </div>

        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-1">
          <span>Cryptographic Vector Signature: SHA256-AS-PROD-2026</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" /> Authenticated Human Directorship
          </span>
        </div>
      </div>
    );
  }

  // Card or Footer variant
  return (
    <div className={`p-3 bg-obsidian-950/80 border border-amber-500/20 rounded-xl space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            {COMPLIANCE_TITLE}
          </span>
        </div>
        {showCopy && (
          <button
            onClick={handleCopy}
            className="text-[10px] font-mono text-zinc-400 hover:text-amber-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>
      <p className="text-[10px] text-zinc-400 leading-relaxed">
        {COMPLIANCE_DISCLAIMER}
      </p>
    </div>
  );
}
