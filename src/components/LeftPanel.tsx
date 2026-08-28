import React, { useState, useRef } from 'react';
import { 
  Shield, 
  Network, 
  Globe, 
  Cpu, 
  RefreshCw, 
  Upload, 
  Sparkles, 
  FileText, 
  CheckCircle, 
  Link, 
  Mail, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  FileDigit,
  Loader2
} from 'lucide-react';
import { SystemStatus, CandidateProfile } from '../types';

interface LeftPanelProps {
  status: SystemStatus | null;
  onToggleCaffeinate: () => void;
  isLoadingCaffeinate: boolean;
  onRefreshStats: () => void;
  isRefreshing: boolean;
  profile: CandidateProfile;
  onUpdateProfile: (
    linkedinUrl: string, 
    naukriUrl: string, 
    resumeFilename: string,
    email?: string,
    phone?: string,
    rawText?: string
  ) => Promise<void>;
}

export default function LeftPanel({
  status,
  onToggleCaffeinate,
  isLoadingCaffeinate,
  onRefreshStats,
  isRefreshing,
  profile,
  onUpdateProfile
}: LeftPanelProps) {
  // Drag and drop states
  const [isDragActive, setIsDragActive] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Local state for extracted vectors to allow fine-tuning manual overrides
  const [localEmail, setLocalEmail] = useState(profile.email || '');
  const [localLinkedin, setLocalLinkedin] = useState(profile.linkedinUrl || '');
  const [localPhone, setLocalPhone] = useState(profile.phone || '');
  const [localText, setLocalText] = useState(profile.rawText || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showTextBuffer, setShowTextBuffer] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if profile changes from parent
  React.useEffect(() => {
    setLocalEmail(profile.email || '');
    setLocalLinkedin(profile.linkedinUrl || '');
    setLocalPhone(profile.phone || '');
    setLocalText(profile.rawText || '');
  }, [profile]);

  const formatUptime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Convert File to Base64 and send to parser API
  const processFile = async (file: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setExtractionStatus('error');
      setErrorMessage('Security framework requires high-integrity PDF resumes.');
      return;
    }

    setIsExtracting(true);
    setExtractionStatus('idle');
    setErrorMessage('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result?.toString().split(',')[1];
        if (!base64Data) {
          setExtractionStatus('error');
          setErrorMessage('Failed to read file byte stream.');
          setIsExtracting(false);
          return;
        }

        try {
          const res = await fetch('/api/profile/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              base64Data
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.profile) {
              setExtractionStatus('success');
              // Automatically sync parent state
              await onUpdateProfile(
                data.profile.linkedinUrl || '',
                data.profile.naukriUrl || '',
                data.profile.resumeFilename || '',
                data.profile.email || '',
                data.profile.phone || '',
                data.profile.rawText || ''
              );
            } else {
              setExtractionStatus('error');
              setErrorMessage(data.error || 'Identity matching extracted no records.');
            }
          } else {
            setExtractionStatus('error');
            setErrorMessage('Parsing socket timed out or declined stream.');
          }
        } catch (err: any) {
          setExtractionStatus('error');
          setErrorMessage(err.message || 'Parser pipeline offline.');
        } finally {
          setIsExtracting(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setExtractionStatus('error');
      setErrorMessage(err.message || 'File stream closed prematurely.');
      setIsExtracting(false);
    }
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile(
        localLinkedin,
        profile.naukriUrl || '',
        profile.resumeFilename || 'Uploaded_Resume.pdf',
        localEmail,
        localPhone,
        localText
      );
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    } catch (e) {
      // Ignored
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="left-operation-panel" className="flex flex-col gap-5">
      
      {/* MODULE 1: SMART SINGLE-DROP PROFILE AGGREGATOR */}
      <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-sm space-y-4">
        
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
          <Shield className="w-4.5 h-4.5 text-blue-600" />
          <h2 className="font-display font-bold text-[13px] tracking-wider text-zinc-800 uppercase">
            1. Master Resume Drop
          </h2>
        </div>

        <p className="text-xs text-zinc-500 leading-normal">
          Upload your PDF. The system will automatically map your LinkedIn footprint, contact details, and career history.
        </p>

        {/* Drag and Drop Zone */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50/40' 
              : isExtracting
              ? 'border-zinc-300 bg-zinc-50/50 cursor-wait'
              : 'border-zinc-300 bg-zinc-50 hover:bg-zinc-100/60 hover:border-zinc-400'
          }`}
        >
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".pdf"
            className="hidden"
          />

          {isExtracting ? (
            <div className="space-y-2 py-2">
              <Loader2 className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
              <div className="text-xs font-bold text-zinc-700">Ripping PDF Core Layers...</div>
              <div className="text-[10px] text-zinc-400 font-mono">Running Regex matching profiles</div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className={`w-8 h-8 mx-auto transition-colors ${isDragActive ? 'text-blue-500' : 'text-zinc-400'}`} />
              <div>
                <span className="text-xs font-bold text-zinc-700">Click or Drag PDF here</span>
              </div>
              <div className="text-[10px] text-zinc-400">
                Supports standard text-based PDF resumes
              </div>
            </div>
          )}
        </div>

        {/* Extraction status badges */}
        {extractionStatus === 'success' && (
          <div className="flex items-center gap-1.5 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded-lg">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">Parsed file: {profile.resumeFilename}</span>
          </div>
        )}

        {extractionStatus === 'error' && (
          <div className="flex items-center gap-1.5 p-2.5 bg-red-50 border border-red-200 text-red-800 text-[11px] rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Extracted results review block */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-mono text-zinc-400 uppercase font-bold">Extracted Identity Parameters</span>
            <span className="text-[9px] bg-blue-50 border border-blue-200 text-blue-800 py-0.5 px-2 rounded-full font-bold">Safe Model Verified</span>
          </div>

          <form onSubmit={handleManualSave} className="space-y-2.5">
            <div>
              <label className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold mb-1 uppercase">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>Mapped Email Address</span>
              </label>
              <input
                type="email"
                value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)}
                placeholder="No email extracted"
                className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1 text-xs text-zinc-800 font-mono focus:outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold mb-1 uppercase">
                <Link className="w-3.5 h-3.5 text-zinc-400" />
                <span>Mapped LinkedIn footprint</span>
              </label>
              <input
                type="text"
                value={localLinkedin}
                onChange={(e) => setLocalLinkedin(e.target.value)}
                placeholder="No LinkedIn url extracted"
                className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1 text-xs text-zinc-800 font-mono focus:outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold mb-1 uppercase">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>Mapped Phone Contact</span>
              </label>
              <input
                type="text"
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value)}
                placeholder="No phone number extracted"
                className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1 text-xs text-zinc-800 font-mono focus:outline-none focus:border-zinc-400"
              />
            </div>

            <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-200/60">
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full text-center bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold py-2 rounded transition-all uppercase tracking-wider cursor-pointer font-mono"
              >
                {isSaving ? 'Updating Registry...' : 'Save Override Vectors'}
              </button>
              {showStatus && (
                <div className="flex items-center gap-1 justify-center py-0.5 text-[10px] text-emerald-700 font-semibold uppercase animate-fade-in font-mono">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>Config Sync Committed</span>
                </div>
              )}
            </div>
          </form>

          {/* Extracted raw text dump slider */}
          {localText && (
            <div className="pt-2 border-t border-zinc-200/60 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setShowTextBuffer(!showTextBuffer)}
                className="flex justify-between items-center text-[10.5px] font-bold text-zinc-650 hover:text-zinc-900 cursor-pointer text-left w-full focus:outline-none"
              >
                <div className="flex items-center gap-1">
                  <FileDigit className="w-3.5 h-3.5 text-blue-600" />
                  <span>Inspect extracted resume text buffer</span>
                </div>
                {showTextBuffer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showTextBuffer && (
                <div className="mt-1.5 p-3 rounded bg-zinc-100 border border-zinc-200 text-[10px] text-zinc-600 font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                  {localText}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* MODULE 2: ROUTING GATEWAYS */}
      <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-sm space-y-4">
        
        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <Network className="w-4.5 h-4.5 text-zinc-650" />
            <h2 className="font-display font-bold text-[13px] tracking-wider text-zinc-800 uppercase">
              Routing Gateways
            </h2>
          </div>
          <button 
            onClick={onRefreshStats} 
            disabled={isRefreshing}
            className="p-1 rounded bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 cursor-pointer disabled:opacity-50 transition-colors"
            title="Refresh network heartbeat"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Dynamic routing metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-lg flex flex-col">
            <span className="font-mono text-[9px] text-zinc-400 uppercase">Residential IP</span>
            <span className="font-mono text-xs text-zinc-850 font-bold mt-1">
              {status ? status.residentialIp : '122.161.49.208'}
            </span>
            <span className="text-[9px] text-zinc-450 mt-0.5 leading-snug">Airtel Residential IN</span>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-lg flex flex-col">
            <span className="font-mono text-[9px] text-zinc-400 uppercase">DNS Bridge</span>
            <span className="font-sans text-[11px] text-zinc-800 font-bold mt-1 inline-flex items-center gap-1 truncate font-mono">
              <Globe className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              {status ? status.hostname : 'agent.akashsync.com'}
            </span>
            <span className="text-[9px] text-zinc-450 mt-0.5 leading-snug font-sans">Zero Trust Access Tunnel</span>
          </div>
        </div>

        {/* macOS Aware system assurance module */}
        <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-lg space-y-2.5">
          
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <h4 className="font-display font-bold text-xs text-zinc-850 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                macOS Awake Wrapper
              </h4>
              <span className="text-[10px] text-zinc-400 font-sans mt-0.5 leading-tight">By-pass power-saving state transitions</span>
            </div>
            <button
              onClick={onToggleCaffeinate}
              disabled={isLoadingCaffeinate}
              className={`cursor-pointer px-2.5 py-1.5 rounded text-[9px] font-mono tracking-wider transition-colors uppercase font-bold ${
                status?.isCaffeinated 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 font-black' 
                  : 'bg-zinc-100 border border-zinc-200 text-zinc-500 font-medium'
              }`}
            >
              {status?.isCaffeinated ? '● FORCE PULSE' : '○ EXPIRED'}
            </button>
          </div>

          <div className="border-t border-zinc-200/80 pt-2 flex flex-col gap-1 text-[10px]">
            <div className="flex justify-between align-baseline">
              <span className="text-zinc-500">Daemon Thread:</span>
              <span className="text-zinc-650 font-mono font-medium">caffeinate -dms</span>
            </div>
            <div className="flex justify-between align-baseline">
              <span className="text-zinc-500">Platform Uptime:</span>
              <span className="text-emerald-700 font-mono font-bold">
                {status ? formatUptime(status.uptimeSeconds) : '04:17:00'}
              </span>
            </div>
          </div>

        </div>

        {/* Compliance Footer */}
        <div className="pt-1.5 border-t border-zinc-150 text-[9px] text-zinc-400 leading-relaxed font-sans mt-1">
          🛡️ <span className="font-semibold text-zinc-500">Preparer Shield Compliance:</span> Playwright overrides set dynamic coordinates and micro-delays to block web-crawler bans when scanning application destinations during setup.
        </div>

      </div>

    </div>
  );
}
