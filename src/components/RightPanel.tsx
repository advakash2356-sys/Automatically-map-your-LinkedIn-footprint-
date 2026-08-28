import React, { useState } from 'react';
import { 
  Users, 
  Mail, 
  Clock, 
  ShieldCheck, 
  UserX, 
  CloudLightning, 
  RefreshCw, 
  Send, 
  Plus,
  Compass,
  Sparkles,
  Lock
} from 'lucide-react';
import { Subscriber } from '../types';

interface RightPanelProps {
  subscribers: Subscriber[];
  onAddSubscribers: (emails: string[], durationHrs: number) => void;
  onRemoveSubscriber: (email: string) => void;
  onSyncCloudflare: () => void;
  isSyncingCF: boolean;
  isAddingSubscribers: boolean;
}

export default function RightPanel({
  subscribers,
  onAddSubscribers,
  onRemoveSubscriber,
  onSyncCloudflare,
  isSyncingCF,
  isAddingSubscribers
}: RightPanelProps) {
  
  const [pastedText, setPastedText] = useState('');
  const [duration, setDuration] = useState(720);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;

    const emails = pastedText
      .split(/[\n,;]+/)
      .map(item => item.trim())
      .filter(item => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item);
      });

    if (emails.length === 0) {
      alert('Could not parse any valid email formats from entered text.');
      return;
    }

    onAddSubscribers(emails, duration);
    setPastedText('');
  };

  const calculateHoursLeft = (addedAt: string, durationHrs: number) => {
    const elapsedMs = Date.now() - new Date(addedAt).getTime();
    const remainingHrs = durationHrs - (elapsedMs / (1000 * 3600));
    return Math.max(0, Math.round(remainingHrs * 10) / 10);
  };

  return (
    <div id="right-operation-panel" className="flex flex-col gap-5">
      
      {/* MODULE: ZERO TRUST SUBSCRIBER GATEWAYS */}
      <div className="celestial-card rounded-2xl p-5 shadow-lg space-y-4">
        
        <div className="flex justify-between items-center border-b border-amber-500/15 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <h2 className="font-display font-bold text-xs tracking-wider text-zinc-100 uppercase">
              Zero-Trust Edge Access Gate
            </h2>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-semibold px-2 py-0.5 rounded-full">
            Cloudflare Access
          </span>
        </div>

        {/* Email Whitelist form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label htmlFor="whitelist-clipboard" className="block text-[10px] font-mono uppercase font-bold text-amber-400">
              Candidate & Operator Email Handles
            </label>
            <textarea
              id="whitelist-clipboard"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste email handles here (comma or line separated):&#10;Adv.akash2356@gmail.com&#10;akash.techlead@gmail.com"
              rows={3}
              className="w-full bg-obsidian-900 border border-zinc-700 rounded-lg p-2.5 font-mono text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Traction:</span>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="bg-obsidian-900 border border-zinc-700 text-zinc-200 rounded px-2 py-1 text-xs focus:outline-none font-medium focus:border-amber-400"
              >
                <option value={24}>24 Hrs (Quick Demo)</option>
                <option value={72}>72 Hrs (Weekly Sync)</option>
                <option value={168}>7 Days (Sprint Sync)</option>
                <option value={720}>Permanent Authorize (30 Days)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isAddingSubscribers || !pastedText.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Authorize Access</span>
            </button>
          </div>
        </form>
      </div>

      {/* MODULE: ACTIVE AUTHORIZED SUBSCRIBERS */}
      <div className="celestial-card rounded-2xl p-5 shadow-lg space-y-4 flex-1 flex flex-col min-h-[220px]">
        
        <div className="flex justify-between items-center text-[11px] text-zinc-400 border-b border-amber-500/15 pb-2">
          <span className="font-semibold uppercase tracking-wider text-zinc-300">
            Authorized Subscribers ({subscribers.length})
          </span>
          <span className="font-mono text-[9px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
            Edge Synced
          </span>
        </div>

        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 flex-1">
          {subscribers.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs italic">
              No authorized subscribers in security pool.
            </div>
          ) : (
            subscribers.map((sub) => {
              const remaining = calculateHoursLeft(sub.addedAt, sub.durationHrs);
              const isExpired = remaining <= 0 || sub.status === 'Expired';
              
              return (
                <div 
                  key={sub.email} 
                  className="bg-obsidian-900/80 hover:bg-obsidian-900 border border-zinc-700/80 rounded-xl p-2.5 flex items-center justify-between transition-colors"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-mono text-[11px] font-bold text-zinc-200 truncate flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      {sub.email}
                    </span>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {isExpired ? 'Session expired' : `Active • Remaining: ${remaining} hrs`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase border ${
                      isExpired
                        ? 'bg-red-500/20 border-red-500/40 text-red-300'
                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    }`}>
                      {isExpired ? 'EXPIRED' : 'ACTIVE'}
                    </span>
                    <button
                      onClick={() => onRemoveSubscriber(sub.email)}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-red-400 cursor-pointer transition-colors"
                      title="Deauthorize Subscriber"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cloudflare Edge sync Action Button */}
        <div className="border-t border-amber-500/15 pt-4 mt-auto">
          <button
            onClick={onSyncCloudflare}
            disabled={isSyncingCF}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs tracking-wider transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-md"
          >
            {isSyncingCF ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>PROPAGATING TO CLOUDFLARE EDGE...</span>
              </>
            ) : (
              <>
                <CloudLightning className="w-3.5 h-3.5" />
                <span>SYNC TO CLOUDFLARE ACCESS GATE</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
