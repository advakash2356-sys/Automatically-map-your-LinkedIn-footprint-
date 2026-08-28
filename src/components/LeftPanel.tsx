import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Copy, 
  Check, 
  Mail, 
  Phone, 
  Link as LinkIcon, 
  User, 
  Briefcase, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Edit3,
  Save,
  FileDigit,
  ShieldCheck,
  Zap,
  Award,
  Send,
  Compass
} from 'lucide-react';
import { CandidateProfile } from '../types';
import ComplianceVerificationBadge from './ComplianceVerificationBadge';

interface LeftPanelProps {
  profile: CandidateProfile;
  onUpdateProfile: (
    linkedinUrl: string, 
    naukriUrl: string, 
    resumeFilename: string,
    email?: string,
    phone?: string,
    rawText?: string,
    fullName?: string,
    skills?: string[],
    experienceYears?: string,
    summary?: string,
    tailoredPitch?: string,
    coverLetter?: string
  ) => Promise<void>;
  onProceedToStep2?: () => void;
}

export default function LeftPanel({
  profile,
  onUpdateProfile,
  onProceedToStep2
}: LeftPanelProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Direct text paste modal/toggle
  const [showTextPaste, setShowTextPaste] = useState(false);
  const [pastedText, setPastedText] = useState('');

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pitch' | 'cover_letter' | 'recruiter_dm'>('pitch');
  const [localName, setLocalName] = useState(profile.fullName || 'Akash Sharma');
  const [localEmail, setLocalEmail] = useState(profile.email || 'Adv.akash2356@gmail.com');
  const [localPhone, setLocalPhone] = useState(profile.phone || '');
  const [localLinkedin, setLocalLinkedin] = useState(profile.linkedinUrl || '');
  const [localNaukri, setLocalNaukri] = useState(profile.naukriUrl || '');
  const [localExp, setLocalExp] = useState(profile.experienceYears || '7+ Years');
  const [localPitch, setLocalPitch] = useState(profile.tailoredPitch || '');
  const [localCoverLetter, setLocalCoverLetter] = useState(profile.coverLetter || '');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setLocalName(profile.fullName || 'Akash Sharma');
    setLocalEmail(profile.email || 'Adv.akash2356@gmail.com');
    setLocalPhone(profile.phone || '');
    setLocalLinkedin(profile.linkedinUrl || '');
    setLocalNaukri(profile.naukriUrl || '');
    setLocalExp(profile.experienceYears || '7+ Years');
    setLocalPitch(profile.tailoredPitch || defaultPitch(profile.fullName, profile.skills, profile.experienceYears));
    setLocalCoverLetter(profile.coverLetter || defaultCoverLetter(profile.fullName, profile.experienceYears, profile.skills, profile.email, profile.phone));
  }, [profile]);

  function defaultPitch(name?: string, skills?: string[], exp?: string) {
    const s = (skills && skills.length > 0) ? skills.slice(0, 4).join(', ') : 'Full-Stack Engineering & Cloud Platforms';
    return `${name || 'Akash Sharma'} — Senior Engineer with ${exp || '7+ years'} experience delivering high-impact web and systems architectures. Specialized in ${s}. Proven record of shipping resilient, production-ready software, optimizing recruiter conversion rates, and automating complex workflows. Excited to bring strategic execution to this role.`;
  }

  function defaultCoverLetter(name?: string, exp?: string, skills?: string[], email?: string, phone?: string) {
    const s = (skills && skills.length > 0) ? skills.slice(0, 4).join(', ') : 'TypeScript, React, Node.js, and Cloud Architecture';
    const contactLine = [email || 'Adv.akash2356@gmail.com', phone].filter(Boolean).join(' | ');
    return `Dear Hiring Team,\n\nI am writing to express my enthusiastic interest in the Engineering role. With over ${exp || '7+ years'} of hands-on experience architecting scalable web applications, microservices, and zero-trust cloud infrastructure, I have consistently led initiatives that elevate system performance and developer velocity.\n\nKey highlights I bring:\n• Engineering production-ready systems specialized in ${s}\n• Automating end-to-end browser workflows, tests, and distributed pipelines\n• Deploying secure, resilient edge architectures with modern CI/CD\n\nI look forward to discussing how my technical background and problem-solving mindset can contribute to your team's engineering roadmap.\n\nBest regards,\n${name || 'Candidate'}\n${contactLine}`;
  }

  function generateRecruiterDM(name?: string, exp?: string, skills?: string[], email?: string, phone?: string) {
    const s = (skills && skills.length > 0) ? skills.slice(0, 3).join(', ') : 'Full-Stack, Cloud & Systems';
    const contact = [email || 'Adv.akash2356@gmail.com', phone].filter(Boolean).join(' | ');
    return `Hi [Hiring Lead / Recruiter],\n\nI came across the engineering opening at your team and would love to connect. I bring ${exp || '7+ years'} specializing in ${s}, with a proven track record of shipping scalable, resilient production systems. Would love to share my portfolio and explore if there's a strong mutual fit.\n\nBest regards,\n${name || 'Candidate'}\n${contact}`;
  }

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;
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
              await onUpdateProfile(
                data.profile.linkedinUrl || '',
                data.profile.naukriUrl || '',
                data.profile.resumeFilename || file.name,
                data.profile.email || '',
                data.profile.phone || '',
                data.profile.rawText || '',
                data.profile.fullName || '',
                data.profile.skills || [],
                data.profile.experienceYears || '',
                data.profile.summary || '',
                data.profile.tailoredPitch || '',
                data.profile.coverLetter || ''
              );
            } else {
              setExtractionStatus('error');
              setErrorMessage(data.error || 'Extraction completed without profile payload.');
            }
          } else {
            const errData = await res.json().catch(() => ({}));
            setExtractionStatus('error');
            setErrorMessage(errData.error || 'Server failed to parse uploaded document.');
          }
        } catch (err: any) {
          setExtractionStatus('error');
          setErrorMessage(err.message || 'Parser offline.');
        } finally {
          setIsExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setExtractionStatus('error');
      setErrorMessage(err.message || 'File read failed.');
      setIsExtracting(false);
    }
  };

  const handleDirectTextExtract = async () => {
    if (!pastedText.trim()) return;
    setIsExtracting(true);
    setExtractionStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/profile/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'Direct_Pasted_Resume.txt',
          rawTextInput: pastedText.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          setExtractionStatus('success');
          setShowTextPaste(false);
          setPastedText('');
          await onUpdateProfile(
            data.profile.linkedinUrl || '',
            data.profile.naukriUrl || '',
            data.profile.resumeFilename || 'Pasted_Resume.txt',
            data.profile.email || '',
            data.profile.phone || '',
            data.profile.rawText || '',
            data.profile.fullName || '',
            data.profile.skills || [],
            data.profile.experienceYears || '',
            data.profile.summary || '',
            data.profile.tailoredPitch || '',
            data.profile.coverLetter || ''
          );
        } else {
          setExtractionStatus('error');
          setErrorMessage(data.error || 'Direct parse failed.');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setExtractionStatus('error');
        setErrorMessage(errData.error || 'Parsing error.');
      }
    } catch (err: any) {
      setExtractionStatus('error');
      setErrorMessage(err.message || 'Parser offline.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else if (e.type === "dragleave") setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dynamicPitch = defaultPitch(localName, profile.skills, localExp);
      const dynamicCover = defaultCoverLetter(localName, localExp, profile.skills, localEmail, localPhone);

      await onUpdateProfile(
        localLinkedin,
        localNaukri,
        profile.resumeFilename || 'Master_Profile.docx',
        localEmail,
        localPhone,
        profile.rawText,
        localName,
        profile.skills,
        localExp,
        profile.summary,
        localPitch || dynamicPitch,
        localCoverLetter || dynamicCover
      );
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const pitchWordCount = (localPitch || '').trim().split(/\s+/).filter(Boolean).length;
  const coverWordCount = (localCoverLetter || '').trim().split(/\s+/).filter(Boolean).length;
  const recruiterDMText = generateRecruiterDM(localName, localExp, profile.skills, localEmail, localPhone);

  return (
    <div id="step-1-resume-copilot" className="flex flex-col gap-4">
      
      {/* 1. MASTER RESUME DROP & 1-CLICK CALIBRATION CARD */}
      <div className="celestial-card rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase">
                  Step 1
                </span>
                <h2 className="font-display font-bold text-xs text-zinc-100 uppercase tracking-wider">
                  Master Resume Auto-Ingest
                </h2>
              </div>
              <p className="text-[11px] text-zinc-400">
                1-Click Word (.docx), PDF, or Text vectorization & outreach synthesis.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowTextPaste(!showTextPaste)}
            className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer transition-colors"
          >
            {showTextPaste ? 'Upload File' : 'Paste Text'}
          </button>
        </div>

        {showTextPaste ? (
          /* DIRECT TEXT PASTE FAST-SYNC */
          <div className="space-y-3 p-3 bg-obsidian-900/90 border border-amber-500/30 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-300">
                ⚡ 1-Click Fast Resume Text Sync
              </span>
              <span className="text-[10px] text-zinc-400">Word / LinkedIn / Plain Text</span>
            </div>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste raw resume text directly here to calibrate all parameters in 1-click..."
              className="w-full h-32 bg-obsidian-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 font-mono"
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowTextPaste(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Back to File Upload
              </button>
              <button
                type="button"
                disabled={isExtracting || !pastedText.trim()}
                onClick={handleDirectTextExtract}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Calibrating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>1-Click Fast Calibrate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* DRAG AND DROP ZONE (WORD DOCX, DOC, PDF, TXT) */
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
              isDragActive
                ? 'border-amber-400 bg-amber-500/10 scale-[0.99]'
                : 'border-zinc-700 bg-obsidian-900/60 hover:bg-obsidian-900/90 hover:border-amber-500/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.doc,.pdf,.txt,.rtf"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-obsidian-800 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                {isExtracting ? (
                  <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-amber-400" />
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-200">
                  {isExtracting ? 'Extracting candidate vectors with high precision...' : 'Click to upload Word (.docx / .doc) or PDF resume'}
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  1-Click Auto-Extraction • Zero Placeholder Injection
                </p>
              </div>

              {profile.resumeFilename && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-emerald-300 text-[10px] font-mono font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="truncate max-w-[220px]">{profile.resumeFilename}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Extraction status notification */}
        {extractionStatus === 'error' && (
          <div className="p-2.5 bg-red-900/40 border border-red-500/40 rounded-lg text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage || 'Extraction failed. Please verify document formatting.'}</span>
          </div>
        )}

        {extractionStatus === 'success' && (
          <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span>Identity vectors calibrated & verified with 1-click precision.</span>
          </div>
        )}
      </div>

      {/* 2. CANDIDATE IDENTITY CARD */}
      <div className="celestial-card rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/15 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <h3 className="font-display font-bold text-xs text-zinc-100 uppercase tracking-wider">
              Candidate Identity Vectors
            </h3>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Edit3 className="w-3 h-3" />
            <span>{isEditing ? 'Cancel' : 'Edit Vectors'}</span>
          </button>
        </div>

        {isEditing ? (
          /* Inline Edit Form */
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-amber-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="e.g. Akash Sharma"
                className="w-full bg-obsidian-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-amber-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={localEmail}
                  onChange={(e) => setLocalEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-obsidian-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-amber-400 mb-1">
                  Mobile / Phone
                </label>
                <input
                  type="text"
                  value={localPhone}
                  onChange={(e) => setLocalPhone(e.target.value)}
                  placeholder="+91 98123 45678"
                  className="w-full bg-obsidian-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-amber-400 mb-1">
                LinkedIn Profile URL
              </label>
              <input
                type="text"
                value={localLinkedin}
                onChange={(e) => setLocalLinkedin(e.target.value)}
                placeholder="https://www.linkedin.com/in/your-profile"
                className="w-full bg-obsidian-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-amber-400 mb-1">
                Naukri Profile URL
              </label>
              <input
                type="text"
                value={localNaukri}
                onChange={(e) => setLocalNaukri(e.target.value)}
                placeholder="https://www.naukri.com/mnjuser/profile"
                className="w-full bg-obsidian-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-semibold text-zinc-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Vectors'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Display Identity Vectors */
          <div className="space-y-3">
            <div className="p-3 bg-obsidian-900/80 border border-amber-500/20 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400">Candidate Name</span>
                <p className="font-bold text-sm text-zinc-100">{profile.fullName || 'Candidate'}</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
                {profile.experienceYears || '7+ Years'}
              </span>
            </div>

            {/* Quick-copy Vector Rows */}
            <div className="space-y-2 text-xs">
              
              {/* Email */}
              <div className="flex items-center justify-between p-2.5 bg-obsidian-900/60 border border-zinc-700/60 rounded-xl">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-mono text-zinc-300 truncate">{profile.email || 'Adv.akash2356@gmail.com'}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(profile.email || 'Adv.akash2356@gmail.com', 'email')}
                  className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-amber-300 transition-colors cursor-pointer"
                  title="Copy Email"
                >
                  {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between p-2.5 bg-obsidian-900/60 border border-zinc-700/60 rounded-xl">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {profile.phone ? (
                    <span className="font-mono text-zinc-300 truncate">{profile.phone}</span>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[11px] text-amber-400/80 hover:text-amber-300 underline font-mono cursor-pointer"
                    >
                      + Add Phone Number
                    </button>
                  )}
                </div>
                {profile.phone && (
                  <button
                    onClick={() => copyToClipboard(profile.phone, 'phone')}
                    className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-amber-300 transition-colors cursor-pointer"
                    title="Copy Phone"
                  >
                    {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* LinkedIn */}
              <div className="flex items-center justify-between p-2.5 bg-obsidian-900/60 border border-zinc-700/60 rounded-xl">
                <div className="flex items-center gap-2 overflow-hidden">
                  <LinkIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  {profile.linkedinUrl ? (
                    <span className="font-mono text-zinc-300 truncate text-[11px]">{profile.linkedinUrl}</span>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[11px] text-blue-400/80 hover:text-blue-300 underline font-mono cursor-pointer"
                    >
                      + Add LinkedIn Profile URL
                    </button>
                  )}
                </div>
                {profile.linkedinUrl && (
                  <button
                    onClick={() => copyToClipboard(profile.linkedinUrl, 'linkedin')}
                    className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-amber-300 transition-colors cursor-pointer"
                    title="Copy LinkedIn URL"
                  >
                    {copiedField === 'linkedin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Skills Chips */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400">Detected Skill Vectors ({profile.skills.length})</span>
                <div className="flex flex-wrap gap-1">
                  {profile.skills.map((skill, idx) => (
                    <span key={idx} className="bg-obsidian-900 border border-amber-500/20 text-zinc-300 font-mono text-[10px] px-2 py-0.5 rounded font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. DYNAMIC COPILOT OUTREACH STUDIO */}
      <div className="celestial-card rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-amber-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-display font-bold text-xs text-zinc-100 uppercase tracking-wider">
              Copilot Outreach Studio
            </h3>
          </div>
          
          <div className="flex items-center gap-1 bg-obsidian-900 border border-amber-500/20 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveTab('pitch')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                activeTab === 'pitch' ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Pitch
            </button>
            <button
              onClick={() => setActiveTab('cover_letter')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                activeTab === 'cover_letter' ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Cover Letter
            </button>
            <button
              onClick={() => setActiveTab('recruiter_dm')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                activeTab === 'recruiter_dm' ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Recruiter DM
            </button>
          </div>
        </div>

        {activeTab === 'pitch' && (
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-300 leading-relaxed bg-obsidian-900/80 p-3 rounded-xl border border-zinc-700/60 max-h-40 overflow-y-auto">
              {localPitch || defaultPitch(localName, profile.skills, localExp)}
            </p>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => copyToClipboard(localPitch || defaultPitch(localName, profile.skills, localExp), 'pitch')}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                {copiedField === 'pitch' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-zinc-950" />
                    <span>Copied Pitch!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>1-Click Copy Pitch</span>
                  </>
                )}
              </button>

              {onProceedToStep2 && (
                <button
                  onClick={onProceedToStep2}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Step 2: Ingest</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Intellectual Property & Compliance Verification for Generated Pitch */}
            <ComplianceVerificationBadge 
              variant="compact" 
              assetName="AI-Orchestrated Elevator Pitch"
            />
          </div>
        )}

        {activeTab === 'cover_letter' && (
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-300 leading-relaxed bg-obsidian-900/80 p-3 rounded-xl border border-zinc-700/60 max-h-40 overflow-y-auto whitespace-pre-line font-mono text-[10px]">
              {localCoverLetter || defaultCoverLetter(localName, localExp, profile.skills, localEmail, localPhone)}
            </p>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => copyToClipboard(localCoverLetter || defaultCoverLetter(localName, localExp, profile.skills, localEmail, localPhone), 'cover_letter')}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                {copiedField === 'cover_letter' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-zinc-950" />
                    <span>Copied Cover Letter!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>1-Click Copy Letter</span>
                  </>
                )}
              </button>

              {onProceedToStep2 && (
                <button
                  onClick={onProceedToStep2}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Step 2: Ingest</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Intellectual Property & Compliance Verification for Generated Cover Letter */}
            <ComplianceVerificationBadge 
              variant="compact" 
              assetName="AI-Orchestrated Cover Letter"
            />
          </div>
        )}

        {activeTab === 'recruiter_dm' && (
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-300 leading-relaxed bg-obsidian-900/80 p-3 rounded-xl border border-zinc-700/60 max-h-40 overflow-y-auto whitespace-pre-line font-mono text-[10px]">
              {recruiterDMText}
            </p>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => copyToClipboard(recruiterDMText, 'recruiter_dm')}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                {copiedField === 'recruiter_dm' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-zinc-950" />
                    <span>Copied Recruiter DM!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>1-Click Copy DM</span>
                  </>
                )}
              </button>

              {onProceedToStep2 && (
                <button
                  onClick={onProceedToStep2}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Step 2: Ingest</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Intellectual Property & Compliance Verification for Generated Recruiter DM */}
            <ComplianceVerificationBadge 
              variant="compact" 
              assetName="AI-Orchestrated Recruiter InMail & DM"
            />
          </div>
        )}
      </div>

    </div>
  );
}
