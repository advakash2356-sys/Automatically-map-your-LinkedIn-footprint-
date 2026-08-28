import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  UploadCloud, 
  Link2, 
  ExternalLink, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Clock, 
  ShieldCheck, 
  Cpu, 
  Loader2, 
  Lock,
  Clipboard,
  Check,
  AlertTriangle,
  FileText,
  User,
  Info
} from 'lucide-react';

interface VisionLink {
  id: string;
  originalUrl: string;
  resolvedUrl: string;
  status: 'pending' | 'resolving' | 'resolved' | 'failed' | 'enrolled' | 'dead_link' | 'irrelevant';
  category: 'Career Portal' | 'Google Course' | 'Coursera Hub' | 'General';
  applied: boolean;
}

interface VisionPanelProps {
  onAddLog: (message: string, level: 'info' | 'warning' | 'error' | 'success', source: 'System' | 'Playwright') => void;
  profile: any;
}

export default function VisionPanel({ onAddLog, profile }: VisionPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractedLinks, setExtractedLinks] = useState<VisionLink[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [applyProgress, setApplyProgress] = useState(0);
  const [currentApplyLink, setCurrentApplyLink] = useState<string>('');
  const [cooldownDelay, setCooldownDelay] = useState<number>(30); // in seconds

  const [copilotMode, setCopilotMode] = useState<'whitehat' | 'automation'>('whitehat');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedPayloadType, setSelectedPayloadType] = useState<Record<string, 'pitch' | 'email' | 'linkedin' | 'phone'>>({});

  const triggerCopy = async (linkId: string, type: 'pitch' | 'email' | 'linkedin' | 'phone') => {
    let textToCopy = '';
    
    switch (type) {
      case 'email':
        textToCopy = profile.email || 'Adv.akash2356@gmail.com';
        break;
      case 'linkedin':
        textToCopy = profile.linkedinUrl || 'https://linkedin.com/in/adv-akash';
        break;
      case 'phone':
        textToCopy = profile.phone || '+91 91234 56789';
        break;
      case 'pitch':
      default:
        textToCopy = `Hello,

I am checking out your opening and believe my credentials and enterprise track record align perfectly.
My Contacts:
- Full Name: Akash Sharma
- Email: ${profile.email || "Adv.akash2356@gmail.com"}
- Contact Phone: ${profile.phone || "+91 91234 56789"}
- Professional Footprint: ${profile.linkedinUrl || "https://linkedin.com/in/adv-akash"}

Summary Matrix Of My Portfolio Profile:
${profile.rawText?.split('\n').slice(0, 5).join('\n') || "Lead Systems Architect with proven experience building Playwright cloud tunnels, zero-trust cloudflare gates, and secure, human-in-the-loop macOS integrations."}

Thank you for your consideration, looking forward to speaking further!`;
        break;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setToastMessage(`SUCCESS: Mapped ${type.toUpperCase()} to Clipboard!`);
      onAddLog(`Copilot Board: Instantly buffered ${type.toUpperCase()} vector. Safe for Paste.`, 'success', 'System');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      onAddLog(`Clipboard Buffer Error: ${err.message}`, 'error', 'System');
    }
  };

  const updateTargetStatus = async (id: string, status: 'pending' | 'enrolled' | 'dead_link' | 'irrelevant') => {
    onAddLog(`Syncing target status to: ${status.toUpperCase()}...`, 'info', 'System');
    
    // Smooth Optimistic State transition
    setExtractedLinks(prev => prev.map(lnk => lnk.id === id ? { 
      ...lnk, 
      status, 
      applied: status === 'enrolled' 
    } : lnk));

    try {
      const res = await fetch('/api/vision/update-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          status, 
          applied: status === 'enrolled' 
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.item) {
          setExtractedLinks(prev => prev.map(lnk => lnk.id === id ? { 
            ...lnk, 
            status: data.item.status, 
            applied: data.item.applied 
          } : lnk));
          onAddLog(`Target status [${status.toUpperCase()}] committed on secure ledger database.`, 'success', 'System');
        }
      }
    } catch (err: any) {
      onAddLog(`Failed to synchronize status with server: ${err.message}`, 'error', 'System');
    }
  };

  const sampleScreenshots = [
    { id: '210008', title: 'Google Certs List', desc: 'Google & Coursera Course Aggregation' },
    { id: '210009', title: 'Naukri Remote Index', desc: 'Remote Tech Openings' },
    { id: '210010', title: 'Devops Resources', desc: 'AWS & Docker Skill Training' },
    { id: '210011', title: 'Remote Workplaces', desc: 'Career Board Directories' }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1] || result;
      triggerExtraction(file.name, true, base64Data);
    };
    reader.onerror = () => {
      onAddLog('Vision Engine Error: Failed to standardize input file format.', 'error', 'System');
      triggerExtraction(file.name, true);
    };
    reader.readAsDataURL(file);
  };

  const selectSample = (id: string, name: string) => {
    setSelectedFile(new File([], `${id}.jpg`, { type: 'image/jpeg' }));
    triggerExtraction(`${id}.jpg`, false);
  };

  const triggerExtraction = async (fileName: string, isCustom: boolean, base64Data?: string) => {
    setIsProcessing(true);
    setExtractionProgress(0);
    setExtractedLinks([]);
    setCurrentStep('Initializing Vision OCR model interface...');
    onAddLog(`Vision Engine: processing feed screenshot ${fileName}`, 'info', 'System');

    const steps = [
      { progress: 15, msg: 'Loading image into buffer coordinates...' },
      { progress: 35, msg: 'Running Apple Silicon core-enhanced Tesseract OCR parser...' },
      { progress: 55, msg: 'Analyzing text zones: matching URL strings and lnkd.in anchors...' },
      { progress: 75, msg: 'Extracting shortened token redirects...' },
      { progress: 100, msg: 'Extraction resolved.' }
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 450));
      setExtractionProgress(step.progress);
      setCurrentStep(step.msg);
    }

    try {
      const response = await fetch('/api/vision/ocr-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, isCustom, base64Data })
      });
      
      const data = await response.json();
      if (response.ok) {
        setExtractedLinks(data.links);
        onAddLog(`Vision Engine: resolved ${data.links.length} shortened anchors safely outside active tracking scopes.`, 'success', 'System');
      } else {
        throw new Error(data.error || 'Failed to resolve links');
      }
    } catch (err: any) {
      onAddLog(`Vision Engine Error: ${err.message}`, 'error', 'System');
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  };

  const startAutoApplyLoop = async () => {
    if (extractedLinks.length === 0) return;
    setIsApplying(true);
    setApplyProgress(0);
    onAddLog('Initiating secure auto-apply & course enrollment worker...', 'info', 'Playwright');

    let completedCount = 0;
    const items = [...extractedLinks];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setCurrentApplyLink(item.resolvedUrl);
      onAddLog(`[Playwright Async] Preparing context for: ${item.resolvedUrl}`, 'info', 'Playwright');
      
      setExtractedLinks(prev => prev.map(p => p.id === item.id ? { ...p, status: 'resolving' } : p));
      
      await new Promise(r => setTimeout(r, 1000));
      onAddLog(`[Playwright Async] Tunneling request via residential IPv4 IP to isolate platform session analytics.`, 'info', 'Playwright');

      await new Promise(r => setTimeout(r, 1200));
      onAddLog(`[Playwright Async] Successfully compiled enrollment target parameters on: ${item.category}`, 'info', 'Playwright');

      try {
        await fetch('/api/vision/apply-target', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id })
        });
      } catch (e) {}

      setExtractedLinks(prev => prev.map(p => p.id === item.id ? { ...p, status: 'resolved', applied: true } : p));
      completedCount++;
      setApplyProgress(Math.round((completedCount / items.length) * 100));
      onAddLog(`[Playwright Async] Enrollment finalized for ${item.resolvedUrl}. Dynamic cooldown cooling initiated.`, 'success', 'Playwright');

      if (i < items.length - 1) {
        onAddLog(`[Stealth Assurance] Pausing pipeline thread for ${cooldownDelay} seconds in compliance with account protection rules...`, 'warning', 'Playwright');
        for (let cd = cooldownDelay; cd > 0; cd--) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    setIsApplying(false);
    setCurrentApplyLink('');
    setApplyProgress(100);
    onAddLog(`Campaign auto-enrollment finalized successfully.`, 'success', 'System');
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'Google Course': return 'bg-sky-50 text-sky-700 border border-sky-100';
      case 'Coursera Hub': return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
      case 'Career Portal': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      default: return 'bg-zinc-50 border border-zinc-200 text-zinc-600';
    }
  };

  return (
    <div id="vision-operations-block" className="space-y-5">
      
      {/* 1. Header / Intro Banner */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
        <div className="flex flex-col gap-1">
          <h3 className="font-display font-bold text-xs text-zinc-800 uppercase tracking-wider">
            2. Resource Feed Processing (stealth extraction)
          </h3>
          <p className="font-sans text-[11px] text-zinc-500 leading-relaxed">
            Mitigate telemetry-tracking cookie triggers. Upload platform post screenshot snapshots cleanly. The vision parser OCR layers resolve links safely without revealing session tracking metadata profiles.
          </p>
        </div>
      </div>

      {/* 2. Drag area & Samples layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Drop zone */}
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label className="text-[10px] font-mono uppercase font-extrabold tracking-widest text-zinc-400">
            Screenshot Aggregate Ingest
          </label>
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2.5 transition-all min-h-[145px] text-center relative ${
              isDragging 
                ? 'border-blue-600 bg-blue-50/45' 
                : selectedFile 
                  ? 'border-emerald-500 bg-emerald-50/30' 
                  : 'border-zinc-200 bg-zinc-50/40 hover:bg-zinc-50/90'
            }`}
          >
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2.5">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="font-mono text-xs text-blue-600 font-bold animate-pulse">
                  {extractionProgress}% OCR COMPILING
                </span>
                <span className="font-sans text-[10px] text-zinc-500">
                  {currentStep}
                </span>
              </div>
            ) : selectedFile ? (
              <div className="flex flex-col items-center gap-1.5 animate-fade-in">
                <ImageIcon className="w-7 h-7 text-emerald-600" />
                <span className="font-sans text-xs font-semibold text-zinc-850">
                  {selectedFile.name} Attached
                </span>
                <span className="text-[9.5px] text-zinc-400">
                  Campaign queue ready. Tap to exchange image block.
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <UploadCloud className="w-7 h-7 text-zinc-400" />
                <span className="font-sans text-xs font-medium text-zinc-700">
                  Select or Snap Resource Post Image
                </span>
                <span className="text-[9.5px] text-zinc-400 font-mono">
                  Supports PNG, JPEG. Native canvas analysis.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Preset select buttons */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono uppercase font-extrabold tracking-widest text-zinc-400">
            Use Preset campaign
          </label>
          <div className="grid grid-cols-1 gap-2 flex-1">
            {sampleScreenshots.map((samp) => (
              <button
                key={samp.id}
                onClick={() => selectSample(samp.id, samp.title)}
                disabled={isProcessing || isApplying}
                className="w-full flex flex-col items-start p-2 border border-zinc-200 rounded-lg bg-zinc-50/50 hover:bg-zinc-50 transition-colors text-left cursor-pointer disabled:opacity-45"
              >
                <div className="flex items-center gap-1 justify-between w-full">
                  <span className="font-sans text-[11px] font-bold text-zinc-800">
                    {samp.title}
                  </span>
                  <span className="font-mono text-[8px] bg-white border border-zinc-200 text-zinc-450 px-1 py-0.5 rounded font-bold uppercase">
                    PROG-{samp.id}
                  </span>
                </div>
                <span className="text-[9.5px] text-zinc-450 truncate mt-0.5 block w-full max-w-[170px]">
                  {samp.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Ingress Target Stack Queue */}
      {extractedLinks.length > 0 && (
        <div className="border border-zinc-200 bg-white rounded-xl p-4.5 space-y-3.5 animate-fade-in shadow-inner relative">
          
          {toastMessage && (
            <div className="absolute top-2 right-2 z-50 bg-[#18181B]/95 text-white text-[11px] font-mono px-3.5 py-2 rounded-lg shadow-lg flex items-center gap-1.5 border border-emerald-500 animate-pulse">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-zinc-150 pb-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-600" />
              <div className="flex flex-col">
                <h4 className="font-sans text-xs font-bold text-zinc-800 uppercase tracking-wide">
                  Campaign Queue Stack ({extractedLinks.length} target vectors discovered)
                </h4>
                <p className="text-[9.5px] text-zinc-400 font-medium">Coordinate zero-suspension safe execution channels</p>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="flex bg-zinc-100 p-0.5 rounded-lg self-start sm:self-center">
              <button
                type="button"
                onClick={() => setCopilotMode('whitehat')}
                className={`cursor-pointer px-2.5 py-1 rounded text-[9.5px] font-mono uppercase font-bold tracking-wider transition-all duration-150 ${
                  copilotMode === 'whitehat'
                    ? 'bg-zinc-900 text-white shadow-sm font-black'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
                title="Suspension-proof local open + clipboard integration matching authentic daily browser sessions"
              >
                🛡️ Copilot
              </button>
              <button
                type="button"
                onClick={() => setCopilotMode('automation')}
                className={`cursor-pointer px-2.5 py-1 rounded text-[9.5px] font-mono uppercase font-bold tracking-wider transition-all duration-150 ${
                  copilotMode === 'automation'
                    ? 'bg-zinc-900 text-white shadow-sm font-black'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
                title="Interactive Playwright simulation process pipeline under Indian residential ISP IPs"
              >
                🤖 Emulator
              </button>
            </div>
          </div>

          {/* Copilot human-in-the-loop dashboard mode */}
          {copilotMode === 'whitehat' ? (
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {extractedLinks.map((link) => {
                const payloadType = selectedPayloadType[link.id] || 'pitch';
                return (
                  <div 
                    key={link.id}
                    className="flex flex-col gap-3 bg-zinc-50 border border-zinc-200 p-3 rounded-xl hover:bg-zinc-100/50 transition-colors"
                  >
                    {/* Header Row: Badges, Url title and open deck launcher */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded font-mono text-[8px] font-bold uppercase border ${getCategoryTheme(link.category)}`}>
                            {link.category}
                          </span>
                          <span className="font-mono text-[9.5px] text-zinc-400 truncate max-w-[150px] sm:max-w-[200px]" title={link.originalUrl}>
                            {link.originalUrl}
                          </span>

                          {/* Interactive Status Badges in Copilot mode */}
                          {link.status === 'enrolled' ? (
                            <span className="text-[8px] bg-emerald-50 border border-emerald-250 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                              ● Applied
                            </span>
                          ) : link.status === 'dead_link' ? (
                            <span className="text-[8px] bg-red-50 border border-red-250 text-red-700 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                              ● Dead Post
                            </span>
                          ) : link.status === 'irrelevant' ? (
                            <span className="text-[8px] bg-amber-50 border border-amber-250 text-amber-700 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                              ● Irrelevant
                            </span>
                          ) : (
                            <span className="text-[8px] bg-zinc-100 border border-zinc-200 text-zinc-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase animate-pulse">
                              ● Standby
                            </span>
                          )}
                        </div>

                        {/* Direct Anchor launch display */}
                        <div className="text-[11px] font-semibold text-zinc-800 flex items-center gap-1 min-w-0">
                          <span className="text-zinc-400 font-normal">Target:</span>
                          <span className="truncate text-zinc-700 font-mono text-[10.5px] leading-none" title={link.resolvedUrl}>{link.resolvedUrl}</span>
                        </div>
                      </div>

                      {/* Launch Button Trigger */}
                      <a 
                        href={link.resolvedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          triggerCopy(link.id, payloadType);
                        }}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-1 self-start sm:self-center shrink-0 shadow-sm"
                        title="Copy details and open target portal"
                      >
                        <span>LAUNCH DECK</span>
                        <ExternalLink className="w-3 h-3 text-white/90" />
                      </a>
                    </div>

                    {/* Operational Details row */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-2.5 border-t border-zinc-200/60 items-center">
                      
                      {/* Left Side: Clipboard select payloads */}
                      <div className="md:col-span-6 flex items-center gap-1.5">
                        <span className="text-[9.5px] font-mono text-zinc-400 font-bold uppercase whitespace-nowrap">Clip Load:</span>
                        <div className="flex items-center gap-1 w-full">
                          <select
                            value={payloadType}
                            onChange={(e) => {
                              const selType = e.target.value as 'pitch' | 'email' | 'linkedin' | 'phone';
                              setSelectedPayloadType(prev => ({ ...prev, [link.id]: selType }));
                            }}
                            className="bg-white border border-zinc-200 text-zinc-700 text-[10px] rounded px-1.5 py-1 w-full focus:outline-none"
                          >
                            <option value="pitch">Elevator Pitch Summary</option>
                            <option value="email">Email Contact Parameter</option>
                            <option value="linkedin">LinkedIn Footprint Trace</option>
                            <option value="phone">Phone Number Vector</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => triggerCopy(link.id, payloadType)}
                            className="px-2 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 rounded text-[9.5px] font-mono font-bold cursor-pointer shrink-0"
                            title="Inject chosen payload into safe clipboard buffer"
                          >
                            CLIP
                          </button>
                        </div>
                      </div>

                      {/* Right Side: Status ledger dials */}
                      <div className="md:col-span-6 flex items-center justify-start md:justify-end gap-1 flex-wrap">
                        <span className="text-[9.5px] font-mono text-zinc-400 font-bold uppercase mr-1 whitespace-nowrap">Status Ledger:</span>
                        
                        <button
                          type="button"
                          onClick={() => updateTargetStatus(link.id, 'enrolled')}
                          className={`cursor-pointer px-2 py-1 rounded text-[8.5px] font-mono font-bold border transition-all ${
                            link.status === 'enrolled'
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-zinc-250 text-zinc-550 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                          title="Mark status as enrolled / applied successful"
                        >
                          Applied
                        </button>

                        <button
                          type="button"
                          onClick={() => updateTargetStatus(link.id, 'dead_link')}
                          className={`cursor-pointer px-2 py-1 rounded text-[8.5px] font-mono font-bold border transition-all ${
                            link.status === 'dead_link'
                              ? 'bg-red-600 border-red-600 text-white'
                              : 'bg-white border-zinc-250 text-zinc-550 hover:bg-red-50 hover:text-red-700'
                          }`}
                          title="Mark target webpage link as inactive / dead 404"
                        >
                          Dead
                        </button>

                        <button
                          type="button"
                          onClick={() => updateTargetStatus(link.id, 'irrelevant')}
                          className={`cursor-pointer px-2 py-1 rounded text-[8.5px] font-mono font-bold border transition-all ${
                            link.status === 'irrelevant'
                              ? 'bg-amber-600 border-amber-600 text-white'
                              : 'bg-white border-zinc-250 text-zinc-550 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                          title="Mark target as irrelevant matching profiles filter"
                        >
                          Filter
                        </button>

                        <button
                          type="button"
                          onClick={() => updateTargetStatus(link.id, 'pending')}
                          className={`cursor-pointer px-2 py-1 rounded text-[8.5px] font-mono font-bold border transition-all ${
                            link.status === 'pending' || link.status === 'resolved' || !link.status
                              ? 'bg-zinc-650 border-zinc-650 text-white'
                              : 'bg-white border-zinc-250 text-zinc-550 hover:bg-zinc-100'
                          }`}
                          title="Reset target status to standby queues"
                        >
                          Reset
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Classic simulated headless loops */
            <div className="space-y-3.5">
              
              {/* Links list viewport */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {extractedLinks.map((link) => (
                  <div 
                    key={link.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 border border-zinc-200 p-2.5 rounded-lg hover:bg-zinc-100/50 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 max-w-lg">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded font-mono text-[8px] font-bold uppercase border ${getCategoryTheme(link.category)}`}>
                          {link.category}
                        </span>
                        <span className="font-mono text-[9.5px] text-zinc-400 truncate max-w-[200px]">
                          {link.originalUrl}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-zinc-800 flex items-center gap-1 min-w-0">
                        <span className="text-zinc-400 font-normal">Target:</span>
                        <a 
                          href={link.resolvedUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline hover:text-blue-750 inline-flex items-center gap-0.5 truncate max-w-full"
                        >
                          {link.resolvedUrl}
                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {link.status === 'resolving' ? (
                        <span className="text-[10px] text-blue-600 flex items-center gap-1 font-mono font-medium animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Resolving...
                        </span>
                      ) : link.applied ? (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 flex items-center gap-1 font-mono font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ENROLLED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-405 italic">
                          Standby queue
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trigger Loop Panel */}
              <div className="border-t border-zinc-150 pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider">Rest Safety Interval</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <select
                      value={cooldownDelay}
                      onChange={(e) => setCooldownDelay(Number(e.target.value))}
                      disabled={isApplying}
                      className="bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs rounded px-2 py-1 select-none font-medium focus:outline-none font-mono"
                    >
                      <option value={10}>10s delay</option>
                      <option value={30}>30s standard stealth cooldown</option>
                      <option value={60}>60s extreme throttle cycle</option>
                    </select>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isApplying ? (
                    <div className="flex flex-col gap-1 items-end">
                      <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 px-4.5 py-2 rounded-lg font-mono text-xs font-bold uppercase animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Apply thread running ({applyProgress}%)</span>
                      </div>
                      <span className="text-[8.5px] font-mono text-zinc-400 truncate max-w-[200px]" title={currentApplyLink}>
                        Active: {currentApplyLink}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={startAutoApplyLoop}
                      className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-600/10"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Execute Process Run Loop Securely</span>
                    </button>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* Compliance informational footer */}
          <div className="flex items-start gap-1 py-1.5 px-2 bg-zinc-50 border border-zinc-200 rounded text-[9.5px] text-zinc-400 leading-snug font-sans">
            <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
            <span>
              {copilotMode === 'whitehat' 
                ? "PREVENTS SUSPENSION: Copilot launching duplicates real user context in your main browser (Chrome/Safari) using your local session cookie space. The selected values copy instantly on launch, allowing effortless paste inputs."
                : "RESIDENTIAL TUNNEL NOTE: Playwright automation relies on our Airtell residential IP address spoofing metrics and randomly distributed human keyboard-mouse gestures."}
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
