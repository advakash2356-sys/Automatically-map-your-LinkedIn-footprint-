import React, { useState } from 'react';
import { Users, Mail, Clock, ShieldCheck, UserX, CloudLightning, RefreshCw, Send, Plus } from 'lucide-react';
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
  const [duration, setDuration] = useState(24);

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
      alert('Could not parse any valid Gmail formats from entered text.');
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
      
      {/* MODULE: GATEWAY SUBSCRIBER MANAGEMENT (WHATSAPP DECK) */}
      <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-sm space-y-4">
        
        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-zinc-800" />
            <h2 className="font-display font-bold text-[13px] tracking-wider text-zinc-800 uppercase">
              3. System Subscriber Gateways
            </h2>
          </div>
          <span className="text-[10px] bg-zinc-100 text-zinc-500 font-mono font-semibold px-2 py-0.5 rounded-full">
            Edge Gate
          </span>
        </div>

        {/* WhatsApp Clipboard Paste form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label htmlFor="whitelist-clipboard" className="block text-xs font-semibold text-zinc-500">
              Subscriber Email Handles (WhatsApp dump)
            </label>
            <textarea
              id="whitelist-clipboard"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste handles here (comma or line separated):&#10;client.one@gmail.com&#10;candidate.ref@gmail.com"
              rows={3}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 font-mono text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Traction:</span>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="bg-zinc-50 border border-zinc-200 text-zinc-700 rounded px-2 py-1 text-xs focus:outline-none font-medium focus:border-zinc-450"
              >
                <option value={24}>24 Hrs (Basic)</option>
                <option value={72}>72 Hrs (Weekly Sync)</option>
                <option value={168}>7 Days (Gold Sync)</option>
                <option value={720}>Permanent Authorize</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isAddingSubscribers || !pastedText.trim()}
              className="px-4.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors duration-150 inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Authorize Subscriber</span>
            </button>
          </div>
        </form>
      </div>

      {/* MODULE: ACTIVE PERMIT DATA DECK */}
      <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-sm space-y-4 flex-1 flex flex-col min-h-[220px]">
        
        <div className="flex justify-between items-center text-[11px] text-zinc-400 border-b border-zinc-100 pb-2">
          <span className="font-semibold uppercase tracking-wider">Active Subscriber Pool ({subscribers.length})</span>
          <span className="font-mono text-[9px] bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">Verified Cloudflare Sync ready</span>
        </div>

        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 flex-1">
          {subscribers.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs italic font-sans">
              No active subscribers registered in pool.
            </div>
          ) : (
            subscribers.map((sub) => {
              const remaining = calculateHoursLeft(sub.addedAt, sub.durationHrs);
              const isExpired = remaining <= 0 || sub.status === 'Expired';
              
              return (
                <div 
                  key={sub.email} 
                  className="bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 rounded-lg p-2.5 flex items-center justify-between transition-colors duration-150"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-mono text-[11px] font-bold text-zinc-850 truncate flex items-center gap-1">
                      <Mail className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      {sub.email}
                    </span>
                    <span className="text-[9.5px] text-zinc-400 flex items-center gap-1 font-sans">
                      <Clock className="w-2.5 h-2.5" />
                      {isExpired ? 'Permanent subscriber token' : `Remaining sync: ${remaining} hrs`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-1.5 py-0.5 rounded font-mono text-[8.5px] font-bold uppercase border ${
                      isExpired
                        ? 'bg-red-50 border-red-200 text-red-650'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                      {isExpired ? 'EXPIRED' : 'ACTIVE'}
                    </span>
                    <button
                      onClick={() => onRemoveSubscriber(sub.email)}
                      className="p-1 rounded hover:bg-zinc-200 text-zinc-450 hover:text-red-600 cursor-pointer transition-colors"
                      title="Deauthorize Subscriber account"
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
        <div className="border-t border-zinc-100 pt-4 mt-auto">
          <button
            onClick={onSyncCloudflare}
            disabled={isSyncingCF}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wider transition-colors duration-150 inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            {isSyncingCF ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>PROPAGATING ACCESS RULES...</span>
              </>
            ) : (
              <>
                <CloudLightning className="w-3.5 h-3.5" />
                <span>PROPAGATE TO CLOUDFLARE EDGE</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
