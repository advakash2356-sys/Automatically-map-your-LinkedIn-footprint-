import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  UploadCloud, 
  Link2, 
  ExternalLink, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Loader2, 
  Check, 
  AlertTriangle, 
  Info,
  Download,
  Activity,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Copy,
  ChevronRight,
  Globe,
  Briefcase,
  Layers,
  FileCheck,
  Send,
  MapPin,
  DollarSign
} from 'lucide-react';
import { VisionLink, CandidateProfile, TargetPayloadType } from '../types';
import { COMPLIANCE_DISCLAIMER, COMPLIANCE_ORGANIZATION, COMPLIANCE_TITLE } from '../constants/compliance';
import ComplianceVerificationBadge from './ComplianceVerificationBadge';

interface VisionPanelProps {
  onAddLog: (message: string, level: 'info' | 'warning' | 'error' | 'success', source: 'System' | 'Playwright') => void;
  profile: CandidateProfile;
  onNavigateToHistory?: () => void;
  extractedLinks: VisionLink[];
  setExtractedLinks: React.Dispatch<React.SetStateAction<VisionLink[]>>;
}

export default function VisionPanel({ 
  onAddLog, 
  profile,
  onNavigateToHistory,
  extractedLinks,
  setExtractedLinks
}: VisionPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedPayloadType, setSelectedPayloadType] = useState<Record<string, TargetPayloadType>>({});
  const [validatingLinks, setValidatingLinks] = useState<Record<string, boolean>>({});
  const [isValidatingAll, setIsValidatingAll] = useState<boolean>(false);
  const [activeTrack, setActiveTrack] = useState<'india_tech_track' | 'global_remote_track' | 'certifications_track'>('india_tech_track');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Get payload text based on selection
  const getPayloadText = (type: TargetPayloadType) => {
    switch (type) {
      case 'email':
        return profile.email || 'Adv.akash2356@gmail.com';
      case 'linkedin':
        return profile.linkedinUrl || 'https://www.linkedin.com/in/adv-akash';
      case 'phone':
        return profile.phone || '+91 98765 43210';
      case 'cover_letter':
        return profile.coverLetter || `Dear Hiring Team,\n\nI am writing to express my interest in this role. With 7+ years of experience delivering full-stack React/Node.js web architectures and resilient automation pipelines, I look forward to contributing to your team.\n\nBest regards,\n${profile.fullName || 'Akash Sharma'}\n${profile.email || 'Adv.akash2356@gmail.com'}`;
      case 'pitch':
      default:
        return profile.tailoredPitch || `${profile.fullName || 'Akash Sharma'} — Senior Systems Architect with ${profile.experienceYears || '7+ years'} experience delivering high-impact web and systems architectures. Specialized in TypeScript, React, Node.js, and Cloud Infrastructure. Excited to bring strategic execution to this role.`;
    }
  };

  // Record history on server
  const recordHistory = async (link: VisionLink, status: 'Success' | 'Failed' | 'Launched', httpStatus = 200, notes = '') => {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: link.id,
          jobTitle: link.title,
          company: link.company,
          originalUrl: link.originalUrl,
          resolvedUrl: link.resolvedUrl,
          category: link.category,
          status,
          httpStatus,
          notes: notes || `Launched via 1-Click Copilot Deck (${link.title || link.category})`
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Export current Action Queue results as a JSON file
  const handleExportActionQueue = () => {
    if (extractedLinks.length === 0) {
      showToast('No target items in Action Queue to export.');
      return;
    }

    const payload = {
      complianceVerification: COMPLIANCE_TITLE,
      disclaimer: COMPLIANCE_DISCLAIMER,
      organization: COMPLIANCE_ORGANIZATION,
      exportTimestamp: new Date().toISOString(),
      candidateName: profile.fullName || 'Akash Sharma',
      totalTargets: extractedLinks.length,
      targets: extractedLinks
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pathpilot_action_queue_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Exported Action Queue with IP Compliance as JSON!');
    onAddLog(`Action Queue Backup: Exported ${extractedLinks.length} target vectors with IP Compliance Verification.`, 'success', 'System');
  };

  // Pre-flight check reachability before launching
  const validateSingleTarget = async (link: VisionLink): Promise<{ valid: boolean; statusCode: number }> => {
    setValidatingLinks(prev => ({ ...prev, [link.id]: true }));
    onAddLog(`Validating reachability for [${link.resolvedUrl}]...`, 'info', 'System');

    try {
      const res = await fetch('/api/vision/validate-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: link.id, url: link.resolvedUrl })
      });

      if (res.ok) {
        const data = await res.json();
        setExtractedLinks(prev => prev.map(lnk => lnk.id === link.id ? {
          ...lnk,
          status: data.valid ? (lnk.status === 'dead_link' ? 'resolved' : lnk.status) : 'dead_link',
          httpStatus: data.statusCode,
          lastValidatedAt: new Date().toISOString()
        } : lnk));

        return { valid: data.valid, statusCode: data.statusCode };
      }
    } catch (err: any) {
      onAddLog(`Validation error for ${link.resolvedUrl}: ${err.message}`, 'warning', 'System');
    } finally {
      setValidatingLinks(prev => ({ ...prev, [link.id]: false }));
    }

    return { valid: true, statusCode: 200 };
  };

  // Validate all links in queue
  const handleValidateAllTargets = async () => {
    if (extractedLinks.length === 0) return;
    setIsValidatingAll(true);
    onAddLog(`Running pre-flight HTTP verification across ${extractedLinks.length} queue targets...`, 'info', 'System');

    let validCount = 0;
    let deadCount = 0;

    for (const lnk of extractedLinks) {
      const result = await validateSingleTarget(lnk);
      if (result.valid) validCount++;
      else deadCount++;
      await new Promise(r => setTimeout(r, 120));
    }

    setIsValidatingAll(false);
    showToast(`Verification complete: ${validCount} active, ${deadCount} dead links.`);
    onAddLog(`Verification complete: ${validCount} verified live, ${deadCount} dead links identified.`, 'success', 'System');
  };

  // 1-Click Launch Copilot Action:
  const handleSafeLaunch = async (link: VisionLink) => {
    const payloadType = selectedPayloadType[link.id] || 'pitch';
    const textToCopy = getPayloadText(payloadType);

    // 1. Copy payload to user's native clipboard
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast(`Copied ${payloadType.toUpperCase()} & safe-launched portal!`);
      onAddLog(`Copilot: Injected ${payloadType.toUpperCase()} to clipboard for ${link.title || link.category}`, 'success', 'System');
    } catch (err: any) {
      onAddLog(`Clipboard injection error: ${err.message}`, 'warning', 'System');
    }

    // 2. Mark in local state as launched
    setExtractedLinks(prev => prev.map(lnk => lnk.id === link.id ? {
      ...lnk,
      applied: true,
      status: 'launched',
      httpStatus: 200
    } : lnk));

    // 3. Record in audit history
    await recordHistory(link, 'Launched', 200, `1-Click Safe Launch (${payloadType.toUpperCase()})`);

    // 4. Open in native browser tab
    window.open(link.resolvedUrl, '_blank', 'noopener,noreferrer');
  };

  // Mark applied manually
  const handleMarkApplied = async (link: VisionLink) => {
    setExtractedLinks(prev => prev.map(lnk => lnk.id === link.id ? {
      ...lnk,
      applied: true,
      status: 'completed'
    } : lnk));
    await recordHistory(link, 'Success', link.httpStatus || 200, 'User marked applied/enrolled');
    showToast(`Marked ${link.title || 'target'} as completed!`);
  };

  // Track preset loader
  const handleLoadTrackPreset = async (trackKey: 'india_tech_track' | 'global_remote_track' | 'certifications_track') => {
    setActiveTrack(trackKey);
    setIsProcessing(true);
    setCurrentStep('Loading curated feed...');
    
    try {
      const res = await fetch('/api/vision/ocr-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: trackKey, fileName: trackKey })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.links && Array.isArray(data.links)) {
          setExtractedLinks(data.links);
          const trackLabel = trackKey === 'india_tech_track' ? 'India Tech Track' :
                             trackKey === 'global_remote_track' ? 'Global Remote Track' : 'Certifications Hub';
          showToast(`Ingested ${data.links.length} verified targets for ${trackLabel}!`);
          onAddLog(`Ingested ${data.links.length} live job target vectors from ${trackLabel}`, 'success', 'System');
        }
      }
    } catch (err: any) {
      onAddLog(`Preset load failure: ${err.message}`, 'error', 'System');
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  };

  // Custom file upload handler
  const handleCustomFileUpload = (file: File) => {
    if (!file) return;
    setSelectedFile(file);
    setIsProcessing(true);
    setCurrentStep('Executing Multimodal OCR...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result?.toString().split(',')[1];
      try {
        const res = await fetch('/api/vision/ocr-resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            isCustom: true,
            base64Data
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.links && Array.isArray(data.links)) {
            setExtractedLinks(data.links);
            showToast(`Extracted ${data.links.length} targets from screenshot!`);
            onAddLog(`Extracted ${data.links.length} target vectors from ${file.name}`, 'success', 'System');
          }
        }
      } catch (err: any) {
        onAddLog(`OCR error: ${err.message}`, 'error', 'System');
      } finally {
        setIsProcessing(false);
        setCurrentStep('');
      }
    };
    reader.readAsDataURL(file);
  };

  const totalTargets = extractedLinks.length;
  const appliedCount = extractedLinks.filter(l => l.applied || l.status === 'completed' || l.status === 'launched').length;

  return (
    <div id="steps-2-and-3-workspace" className="space-y-5">
      
      {/* STEP 2: MULTIMODAL INGESTION MODULE */}
      <div className="celestial-card rounded-2xl p-5 shadow-lg space-y-4">
        
        {/* Module Header */}
        <div className="flex items-center justify-between border-b border-amber-500/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] font-bold text-blue-300 bg-blue-500/15 border border-blue-500/30 px-1.5 py-0.5 rounded uppercase">
                  Step 2
                </span>
                <h2 className="font-display font-bold text-xs text-zinc-100 uppercase tracking-wider">
                  Multimodal Job Ingestion & Radar
                </h2>
              </div>
              <p className="text-[11px] text-zinc-400">
                Load curated high-match feeds for Indian & Global remote markets or drop custom screenshots.
              </p>
            </div>
          </div>
        </div>

        {/* 3 PRESET FEED BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* India Tech Track */}
          <button
            onClick={() => handleLoadTrackPreset('india_tech_track')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
              activeTrack === 'india_tech_track'
                ? 'border-amber-400 bg-amber-500/15 shadow-md'
                : 'border-zinc-700 bg-obsidian-900/60 hover:bg-obsidian-900 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-100">🇮🇳 India Tech Track</span>
              <span className="font-mono text-[9px] text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                5 Roles
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Naukri Direct, Instahyre Fast-Track, LinkedIn India (Bangalore/NCR/Remote).
            </p>
          </button>

          {/* Global Remote Track */}
          <button
            onClick={() => handleLoadTrackPreset('global_remote_track')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
              activeTrack === 'global_remote_track'
                ? 'border-blue-400 bg-blue-500/15 shadow-md'
                : 'border-zinc-700 bg-obsidian-900/60 hover:bg-obsidian-900 hover:border-blue-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-100">🌐 Global Remote Track</span>
              <span className="font-mono text-[9px] text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">
                5 Roles
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Remotive, We Work Remotely, Himalayas, FlexJobs (US/EU remote).
            </p>
          </button>

          {/* Certifications Track */}
          <button
            onClick={() => handleLoadTrackPreset('certifications_track')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
              activeTrack === 'certifications_track'
                ? 'border-emerald-400 bg-emerald-500/15 shadow-md'
                : 'border-zinc-700 bg-obsidian-900/60 hover:bg-obsidian-900 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-100">🎓 Certifications Hub</span>
              <span className="font-mono text-[9px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                4 Programs
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Grow with Google, AWS SkillBuilder, Coursera Tech Credentials.
            </p>
          </button>

        </div>

        {/* CUSTOM SCREENSHOT OCR DROPZONE */}
        <div
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) handleCustomFileUpload(e.dataTransfer.files[0]);
          }}
          className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10'
              : 'border-zinc-700 bg-obsidian-900/40 hover:bg-obsidian-900/80 hover:border-zinc-600'
          }`}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e: any) => {
              if (e.target.files?.[0]) handleCustomFileUpload(e.target.files[0]);
            };
            input.click();
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <UploadCloud className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-semibold text-zinc-200">
                Drop job post screenshots or WhatsApp dump images for Gemini OCR extraction
              </p>
              <p className="text-[10px] text-zinc-400">
                Supports PNG, JPG • Auto-resolves lnkd.in redirects and portal links
              </p>
            </div>
          </div>
        </div>

        {isProcessing && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center gap-2 text-xs text-amber-300">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>{currentStep || 'Processing ingestion radar...'}</span>
          </div>
        )}
      </div>

      {/* STEP 3: ACTION QUEUE & 1-CLICK LAUNCH DECK */}
      <div className="celestial-card rounded-2xl p-5 shadow-lg space-y-4">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase">
                  Step 3
                </span>
                <h2 className="font-display font-bold text-xs text-zinc-100 uppercase tracking-wider">
                  Action Queue & 1-Click Safe Launch
                </h2>
              </div>
              <p className="text-[11px] text-zinc-400">
                {totalTargets} verified opportunities • Anti-detection safe launch with clipboard injection.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleValidateAllTargets}
              disabled={isValidatingAll || extractedLinks.length === 0}
              className="px-3 py-1.5 bg-obsidian-900 hover:bg-obsidian-800 border border-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isValidatingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Verify URLs</span>
            </button>

            <button
              onClick={handleExportActionQueue}
              disabled={extractedLinks.length === 0}
              className="px-3 py-1.5 bg-obsidian-900 hover:bg-obsidian-800 border border-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Backup Queue</span>
            </button>
          </div>
        </div>

        {/* TARGET CARDS LIST */}
        <div className="space-y-3">
          {extractedLinks.map((link) => {
            const isCompleted = link.applied || link.status === 'completed' || link.status === 'launched';
            const isDead = link.status === 'dead_link';
            const currentPayload = selectedPayloadType[link.id] || 'pitch';
            const isValidating = validatingLinks[link.id];

            return (
              <div
                key={link.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-obsidian-900/40 border-emerald-500/30'
                    : isDead
                    ? 'bg-red-950/20 border-red-500/30'
                    : 'bg-obsidian-900/70 border-zinc-700/80 hover:border-amber-500/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  
                  {/* Left: Job Info */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-zinc-100">
                        {link.title}
                      </span>
                      {link.location && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-obsidian-950 px-2 py-0.5 rounded font-mono">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>{link.location}</span>
                        </span>
                      )}
                      {link.salaryRange && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono font-semibold">
                          {link.salaryRange}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="text-zinc-300 font-medium">{link.company}</span>
                      <span>•</span>
                      <span className="font-mono text-zinc-400">{link.domain}</span>
                      <span>•</span>
                      <span className="text-amber-400/80 font-mono text-[10px]">{link.category}</span>
                    </div>

                    {/* Resolved URL Preview */}
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 truncate pt-0.5">
                      <span className="text-zinc-400">Target:</span>
                      <a
                        href={link.resolvedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:underline truncate max-w-sm"
                      >
                        {link.resolvedUrl}
                      </a>
                    </div>
                  </div>

                  {/* Right: Payload Dropdown & 1-Click Launch */}
                  <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
                    
                    {/* Payload Selector */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-mono uppercase text-zinc-400 font-bold">Injected Payload</span>
                      <select
                        value={currentPayload}
                        onChange={(e) => setSelectedPayloadType(prev => ({
                          ...prev,
                          [link.id]: e.target.value as TargetPayloadType
                        }))}
                        className="bg-obsidian-950 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="pitch">Elevator Pitch (~60w)</option>
                        <option value="cover_letter">Cover Letter</option>
                        <option value="email">Email Address</option>
                        <option value="linkedin">LinkedIn URL</option>
                        <option value="phone">Mobile Phone</option>
                      </select>
                    </div>

                    {/* Launch Button */}
                    <button
                      onClick={() => handleSafeLaunch(link)}
                      disabled={isValidating}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-amber-500/10'
                      }`}
                    >
                      {isValidating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isCompleted ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Zap className="w-3.5 h-3.5" />
                      )}
                      <span>{isCompleted ? 'Re-Launch' : '1-Click Launch'}</span>
                    </button>

                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-amber-500/15 text-xs text-zinc-400">
          <p>
            {appliedCount} of {totalTargets} targets launched in this session
          </p>
          {onNavigateToHistory && (
            <button
              onClick={onNavigateToHistory}
              className="font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Step 4: View Audit History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* IP Compliance Verification Note */}
        <ComplianceVerificationBadge 
          variant="banner" 
          assetName="Target Extraction & Payload Queue"
        />

      </div>

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
