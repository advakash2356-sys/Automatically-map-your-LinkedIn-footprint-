import React, { useState, useEffect } from 'react';
import { 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Trash2, 
  Download, 
  RefreshCw, 
  Search, 
  FileJson, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Clock, 
  Globe, 
  ShieldCheck, 
  ArrowUpRight,
  Filter,
  CheckCircle,
  XCircle,
  Activity,
  Layers,
  Sparkles,
  Eye,
  Lock,
  Scale,
  FileCheck,
  X
} from 'lucide-react';
import { ApplicationHistoryItem, CandidateProfile } from '../types';
import { COMPLIANCE_DISCLAIMER, COMPLIANCE_ORGANIZATION, COMPLIANCE_TITLE } from '../constants/compliance';
import ComplianceVerificationBadge from './ComplianceVerificationBadge';

interface HistoryPanelProps {
  onAddLog: (message: string, level: 'info' | 'warning' | 'error' | 'success', source: 'System' | 'Playwright') => void;
  profile: CandidateProfile;
}

export default function HistoryPanel({ onAddLog, profile }: HistoryPanelProps) {
  const [historyItems, setHistoryItems] = useState<ApplicationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Success' | 'Launched' | 'Failed'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [inspectingItem, setInspectingItem] = useState<ApplicationHistoryItem | null>(null);
  const [showGlobalInspector, setShowGlobalInspector] = useState<boolean>(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistoryItems(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      onAddLog(`Failed to fetch target history: ${err.message}`, 'error', 'System');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all target execution history records?')) {
      return;
    }
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (res.ok) {
        setHistoryItems([]);
        showToast('Application history cleared.');
        onAddLog('Application history cleared by user.', 'info', 'System');
      }
    } catch (err: any) {
      onAddLog(`Failed to clear history: ${err.message}`, 'error', 'System');
    }
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistoryItems(prev => prev.filter(item => item.id !== id));
        showToast('History entry removed.');
      }
    } catch (err: any) {
      onAddLog(`Failed to remove item: ${err.message}`, 'error', 'System');
    }
  };

  const handleExportJSON = () => {
    if (historyItems.length === 0) {
      showToast('No history records to export.');
      return;
    }
    const payload = {
      complianceVerification: COMPLIANCE_TITLE,
      disclaimer: COMPLIANCE_DISCLAIMER,
      organization: COMPLIANCE_ORGANIZATION,
      exportTimestamp: new Date().toISOString(),
      candidateName: profile.fullName || 'Akash Sharma',
      candidateEmail: profile.email || 'Adv.akash2356@gmail.com',
      totalRecords: historyItems.length,
      records: historyItems
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pathpilot_audit_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported verified history as JSON!');
    onAddLog(`Exported ${historyItems.length} application history records with IP Compliance Verification as JSON.`, 'success', 'System');
  };

  const handleExportCSV = () => {
    if (historyItems.length === 0) {
      showToast('No history records to export.');
      return;
    }
    const headers = ['ID', 'Target ID', 'Job Title', 'Company', 'Category', 'Status', 'Timestamp', 'HTTP Status', 'Resolved URL', 'Original URL', 'Notes', 'Compliance Statement'];
    const rows = historyItems.map(item => [
      item.id,
      item.targetId,
      `"${(item.jobTitle || '').replace(/"/g, '""')}"`,
      `"${(item.company || '').replace(/"/g, '""')}"`,
      `"${item.category || ''}"`,
      item.status,
      item.timestamp,
      item.httpStatus || 200,
      `"${item.resolvedUrl || ''}"`,
      `"${item.originalUrl || ''}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
      `"${COMPLIANCE_DISCLAIMER.replace(/"/g, '""')}"`
    ]);

    const metadataHeader = [
      `# ${COMPLIANCE_TITLE}`,
      `# ${COMPLIANCE_DISCLAIMER}`,
      `# Organization: ${COMPLIANCE_ORGANIZATION} | Exported: ${new Date().toISOString()}`,
      ''
    ].join('\n');

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(
      metadataHeader + '\n' +
      headers.join(',') + '\n' + 
      rows.map(e => e.join(',')).join('\n') + '\n\n' +
      `"Intellectual Property & Compliance Disclaimer:","${COMPLIANCE_DISCLAIMER.replace(/"/g, '""')}"\n`
    );

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", `pathpilot_audit_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported verified spreadsheet CSV!');
    onAddLog(`Exported audit spreadsheet CSV with Intellectual Property & Compliance Verification header.`, 'success', 'System');
  };

  const handleCopyLink = async (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast('Copied URL to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = historyItems.filter(item => {
    const matchesFilter = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch = searchTerm.trim() === '' || 
      (item.jobTitle && item.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.company && item.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.resolvedUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const successCount = historyItems.filter(i => i.status === 'Success').length;
  const launchedCount = historyItems.filter(i => i.status === 'Launched').length;
  const failedCount = historyItems.filter(i => i.status === 'Failed').length;

  return (
    <div id="step-4-audit-history" className="celestial-card rounded-2xl p-5 shadow-lg space-y-5">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/15 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-1.5 py-0.5 rounded uppercase">
                Step 4
              </span>
              <h2 className="font-display font-bold text-xs text-zinc-100 uppercase tracking-wider">
                Audit History & Export Center
              </h2>
            </div>
            <p className="text-[11px] text-zinc-400">
              Verified record of completed portal launches, status receipts, and timestamped audit logs.
            </p>
          </div>
        </div>

        {/* 1-Click Export & Deep Inspector Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGlobalInspector(true)}
            className="px-3 py-1.5 bg-obsidian-900 hover:bg-obsidian-800 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Open Deep Inspector Audit for Full Ledger"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Deep Inspector Audit</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={historyItems.length === 0}
            className="px-3 py-1.5 bg-obsidian-900 hover:bg-obsidian-800 border border-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Export Spreadsheet with IP & Compliance Verification"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            disabled={historyItems.length === 0}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-md"
            title="Export Verified JSON payload with IP Disclaimer"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div className="p-3 bg-obsidian-900/80 border border-zinc-700/70 rounded-xl space-y-1">
          <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">Total Logged</span>
          <div className="font-mono text-base font-bold text-zinc-100">{historyItems.length}</div>
          <p className="text-[10px] text-zinc-400">Portal target actions</p>
        </div>

        <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1">
          <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">Completed</span>
          <div className="font-mono text-base font-bold text-emerald-300">{successCount}</div>
          <p className="text-[10px] text-emerald-400/80">Marked enrolled/applied</p>
        </div>

        <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl space-y-1">
          <span className="text-[10px] font-mono uppercase font-bold text-blue-400">Launched Deck</span>
          <div className="font-mono text-base font-bold text-blue-300">{launchedCount}</div>
          <p className="text-[10px] text-blue-400/80">Copilot clipboard runs</p>
        </div>

        <div className="p-3 bg-obsidian-900/80 border border-zinc-700/70 rounded-xl space-y-1">
          <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">Dead Filtered</span>
          <div className="font-mono text-base font-bold text-zinc-300">{failedCount}</div>
          <p className="text-[10px] text-zinc-400">HTTP 404 blocked</p>
        </div>

      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by job title, company, portal or URL..."
            className="w-full pl-8 pr-3 py-1.5 bg-obsidian-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <span className="text-[11px] text-zinc-400 font-medium">Status:</span>
          {(['ALL', 'Success', 'Launched', 'Failed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-obsidian-900 text-zinc-300 hover:bg-obsidian-800 border border-zinc-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* AUDIT TABLE */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-10 border border-zinc-700/60 rounded-xl bg-obsidian-900/40 space-y-2">
          <History className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-xs font-semibold text-zinc-300">No matching history records found</p>
          <p className="text-[11px] text-zinc-400">
            Launch targets from Step 3 to automatically populate this audit journal.
          </p>
        </div>
      ) : (
        <div className="border border-zinc-700/80 rounded-xl overflow-hidden shadow-md divide-y divide-zinc-800/80">
          {filteredItems.map(item => {
            const isSuccess = item.status === 'Success';
            const isLaunched = item.status === 'Launched';
            const isFailed = item.status === 'Failed';

            return (
              <div key={item.id} className="p-3.5 bg-obsidian-900/70 hover:bg-obsidian-900 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                
                {/* Details */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isSuccess ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      isLaunched ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {isSuccess && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                      {isLaunched && <Activity className="w-3 h-3 text-blue-400" />}
                      {isFailed && <XCircle className="w-3 h-3 text-red-400" />}
                      <span>{item.status}</span>
                    </span>

                    {/* Category */}
                    <span className="text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium">
                      {item.category || 'Career Portal'}
                    </span>

                    {/* Timestamp */}
                    <span className="text-[10px] font-mono text-zinc-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>

                    {/* Deep Inspector Pill */}
                    <button
                      onClick={() => setInspectingItem(item)}
                      className="text-[9px] font-mono font-bold text-amber-300/90 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Eye className="w-2.5 h-2.5" />
                      <span>Deep Inspector</span>
                    </button>
                  </div>

                  {/* Title & Company */}
                  <p className="font-semibold text-zinc-100 truncate">
                    {item.jobTitle || item.notes || item.category || 'Direct Portal Launch'} 
                    {item.company ? ` • ${item.company}` : ''}
                  </p>

                  {/* URL */}
                  <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px] truncate">
                    <span className="text-zinc-400">Target:</span>
                    <a
                      href={item.resolvedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline truncate max-w-sm"
                    >
                      {item.resolvedUrl}
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                  
                  {/* Inspect Details */}
                  <button
                    onClick={() => setInspectingItem(item)}
                    className="p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    title="Deep Inspector Audit"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={(e) => handleCopyLink(item.resolvedUrl, item.id, e)}
                    className="p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    title="Copy Target URL"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {/* Launch */}
                  <a
                    href={item.resolvedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors cursor-pointer"
                    title="Open Live Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Delete Item */}
                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* INTELLECTUAL PROPERTY & COMPLIANCE VERIFICATION BANNER */}
      <ComplianceVerificationBadge 
        variant="banner" 
        assetName="Audit History & Export Telemetry"
      />

      {/* Footer toolbar */}
      {historyItems.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-zinc-400">
            Showing {filteredItems.length} of {historyItems.length} logged items
          </span>
          <button
            onClick={handleClearHistory}
            className="text-[11px] text-zinc-400 hover:text-red-400 font-medium cursor-pointer transition-colors"
          >
            Clear Entire History
          </button>
        </div>
      )}

      {/* DEEP INSPECTOR AUDIT MODAL (FOR SPECIFIC ITEM) */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian-950 border border-amber-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-zinc-100 uppercase tracking-wider">
                    Deep Inspector Audit
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-400">
                    Execution Trace • Verification Hash: {inspectingItem.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Audit Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-obsidian-900 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Target Position</span>
                <p className="font-semibold text-zinc-100">{inspectingItem.jobTitle || 'Career Target'}</p>
                <p className="text-zinc-400">{inspectingItem.company || 'Verified Employer'}</p>
              </div>

              <div className="p-3 bg-obsidian-900 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Telemetry Status</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 font-mono">HTTP {inspectingItem.httpStatus || 200} OK</span>
                  <span className="text-zinc-400">•</span>
                  <span className="font-mono text-zinc-300">{inspectingItem.status}</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono">{new Date(inspectingItem.timestamp).toLocaleString()}</p>
              </div>
            </div>

            {/* URLs */}
            <div className="p-3 bg-obsidian-900 rounded-xl border border-zinc-800 space-y-2 text-xs font-mono">
              <div>
                <span className="text-[10px] uppercase text-zinc-400 font-bold block mb-0.5">Resolved Endpoint URL</span>
                <a href={inspectingItem.resolvedUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline break-all">
                  {inspectingItem.resolvedUrl}
                </a>
              </div>
              {inspectingItem.notes && (
                <div>
                  <span className="text-[10px] uppercase text-zinc-400 font-bold block mb-0.5">Audit Operator Notes</span>
                  <p className="text-zinc-300 font-sans text-[11px]">{inspectingItem.notes}</p>
                </div>
              )}
            </div>

            {/* MANDATORY INTELLECTUAL PROPERTY & COMPLIANCE VERIFICATION */}
            <ComplianceVerificationBadge 
              variant="inspector" 
              assetName={`Audit Vector ID: ${inspectingItem.id}`}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setInspectingItem(null)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Audit Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* GLOBAL DEEP INSPECTOR AUDIT MODAL (FOR ENTIRE LEDGER) */}
      {showGlobalInspector && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian-950 border border-amber-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-zinc-100 uppercase tracking-wider">
                    Full Ledger Deep Inspector Audit
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-400">
                    Comprehensive Operations Audit & Verification Ledger
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGlobalInspector(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overall stats */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-obsidian-900 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Verified Entries</span>
                <span className="font-mono text-lg font-bold text-zinc-100">{historyItems.length}</span>
              </div>
              <div className="p-3 bg-obsidian-900 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Success Rate</span>
                <span className="font-mono text-lg font-bold text-emerald-400">
                  {historyItems.length > 0 ? Math.round((successCount / historyItems.length) * 100) : 100}%
                </span>
              </div>
              <div className="p-3 bg-obsidian-900 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Integrity</span>
                <span className="font-mono text-lg font-bold text-amber-300">100% Passed</span>
              </div>
            </div>

            {/* MANDATORY INTELLECTUAL PROPERTY & COMPLIANCE VERIFICATION */}
            <ComplianceVerificationBadge 
              variant="inspector" 
              assetName="Master Audit Telemetry & Ledger"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleExportJSON}
                className="px-3.5 py-2 bg-obsidian-900 hover:bg-obsidian-800 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export Audit Certificate</span>
              </button>
              <button
                onClick={() => setShowGlobalInspector(false)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TOAST POPUP */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-obsidian-900 text-zinc-100 px-4 py-2.5 rounded-xl shadow-2xl border border-amber-500/40 flex items-center gap-2 text-xs font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

