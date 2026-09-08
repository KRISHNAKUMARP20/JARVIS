import React, { useState, useEffect, useRef } from 'react';
import { TelemetryData, ProtocolMode, AssistantState, VoiceCommandLog } from '../../types';
import {
  Shield,
  Zap,
  Cpu,
  Activity,
  Thermometer,
  Radio,
  Lock,
  Lightbulb,
  Terminal,
  Trash2,
  Copy,
  Check,
  Search,
  Filter,
} from 'lucide-react';
import { sfx } from '../../audio/sfx';

interface StatusPanelProps {
  telemetry: TelemetryData;
  protocol: ProtocolMode;
  state?: AssistantState;
  onSelectProtocol: (proto: ProtocolMode) => void;
  color: string;
  systemLogs?: VoiceCommandLog[];
  onClearLogs?: () => void;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  telemetry,
  protocol,
  state,
  onSelectProtocol,
  color,
  systemLogs = [],
  onClearLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'TELEMETRY' | 'LOGS'>('TELEMETRY');
  const [isGlitching, setIsGlitching] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [copied, setCopied] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Trigger brief glitch animation on protocol or assistant state changes
  useEffect(() => {
    setIsGlitching(true);
    const timer = setTimeout(() => {
      setIsGlitching(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [protocol, state]);

  // Subtle random holographic glitch bursts
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const scheduleNextGlitch = () => {
      const delay = Math.floor(Math.random() * 9000) + 7000;
      timeoutId = setTimeout(() => {
        setIsGlitching(true);
        setTimeout(() => {
          setIsGlitching(false);
          scheduleNextGlitch();
        }, 300 + Math.random() * 180);
      }, delay);
    };

    scheduleNextGlitch();
    return () => clearTimeout(timeoutId);
  }, []);

  // Auto-scroll logs to bottom when new entries arrive in logs tab
  useEffect(() => {
    if (activeTab === 'LOGS' && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [systemLogs.length, activeTab]);

  const handleTabChange = (tab: 'TELEMETRY' | 'LOGS') => {
    sfx.playHudTick();
    setActiveTab(tab);
  };

  const handleCopyLogs = () => {
    if (systemLogs.length === 0) return;
    const textData = systemLogs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.protocol}] DIRECTIVE: "${l.rawCommand}" | KEYWORDS: [${l.keywords.join(', ')}] | STATUS: ${l.status}`
      )
      .join('\n');
    navigator.clipboard.writeText(textData);
    setCopied(true);
    sfx.playConfirmation();
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = systemLogs.filter((log) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      log.rawCommand.toLowerCase().includes(q) ||
      log.keywords.some((k) => k.toLowerCase().includes(q)) ||
      log.timestamp.toLowerCase().includes(q) ||
      log.status.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className={`w-full bg-slate-950/90 border border-red-500/25 rounded-xl p-4 backdrop-blur-md flex flex-col gap-3.5 shadow-2xl transition-all duration-300 relative overflow-hidden ${
        isGlitching ? 'holo-glitch-active' : ''
      }`}
    >
      {/* Glitch CRT flash bar during distortion */}
      {isGlitching && (
        <div
          className="absolute inset-0 pointer-events-none holo-glitch-flicker z-20"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${color}15 40%, ${color}30 50%, transparent 60%)`,
          }}
        />
      )}

      {/* Dual Tab Navigation Header */}
      <div className="flex items-center justify-between border-b border-red-500/20 pb-2.5">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-lg border border-red-500/20">
          <button
            onClick={() => handleTabChange('TELEMETRY')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-orbitron font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === 'TELEMETRY'
                ? 'bg-red-500/25 text-red-200 border border-red-400/50 shadow-[0_0_10px_rgba(255,26,64,0.4)]'
                : 'text-slate-400 hover:text-red-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-red-400" />
            TELEMETRY
          </button>

          <button
            onClick={() => handleTabChange('LOGS')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-orbitron font-semibold tracking-wider transition-all duration-200 cursor-pointer relative ${
              activeTab === 'LOGS'
                ? 'bg-red-500/25 text-red-200 border border-red-400/50 shadow-[0_0_10px_rgba(255,26,64,0.4)]'
                : 'text-slate-400 hover:text-red-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-red-400" />
            SYSTEM LOGS
            {systemLogs.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-red-500/20 text-red-300 border border-red-500/30">
                {systemLogs.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-tech text-[11px] text-red-400/80 bg-red-950/50 px-2 py-0.5 rounded border border-red-500/30">
            {activeTab === 'TELEMETRY' ? 'ONLINE' : 'ACTIVE'}
          </span>
        </div>
      </div>

      {/* TAB 1: TELEMETRY VIEW */}
      {activeTab === 'TELEMETRY' && (
        <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
          {/* Grid of Key Metrics */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Arc Reactor Output */}
            <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-2.5 flex flex-col gap-1.5 shadow-[0_0_12px_rgba(255,26,64,0.08)]">
              <div className="flex items-center justify-between text-[11px] text-red-300 font-rajdhani">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-red-400" />
                  ARC CORE
                </span>
                <span className="font-tech text-red-200 font-bold">{telemetry.reactorOutput}%</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${telemetry.reactorOutput}%`,
                    backgroundColor: '#ff1a40',
                    boxShadow: '0 0 10px rgba(255, 26, 64, 0.7)',
                  }}
                />
              </div>
              <span className="text-[9px] font-tech text-red-400/70">3.85 GW</span>
            </div>

            {/* Core Temperature */}
            <div className="bg-red-950/30 border border-red-500/15 rounded-lg p-2.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] text-red-300/80 font-rajdhani">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-red-400" />
                  CORE TEMP
                </span>
                <span className="font-tech text-red-200 font-bold">{telemetry.coreTemperature}°C</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (telemetry.coreTemperature / 80) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Neural Sync */}
            <div className="bg-red-950/30 border border-red-500/15 rounded-lg p-2.5 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] text-red-300/80 font-rajdhani">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-red-400" />
                  NEURAL SYNC
                </span>
                <span className="font-tech text-red-300 font-bold">{telemetry.neuralSync}%</span>
              </div>
            </div>

            {/* Network & Threads */}
            <div className="bg-red-950/30 border border-red-500/15 rounded-lg p-2.5 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] text-red-300/80 font-rajdhani">
                <span className="flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-red-400" />
                  QUANTUM LINK
                </span>
                <span className="font-tech text-red-300 font-bold">{telemetry.networkLatency}ms</span>
              </div>
            </div>
          </div>

          {/* Protocol Mode Switcher */}
          <div className="flex flex-col gap-1.5 border-t border-red-500/15 pt-2">
            <span className="text-[10px] font-tech text-red-400/80 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-red-400" />
              PROTOCOL
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['STANDBY', 'ACTIVE', 'STEALTH'] as ProtocolMode[]).map((mode) => {
                const isActive = protocol === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      sfx.playHudTick();
                      onSelectProtocol(mode);
                    }}
                    className={`py-1.5 px-2 rounded text-[10px] font-orbitron tracking-wider transition-all duration-300 border ${
                      isActive
                        ? 'bg-red-500/25 border-red-400 text-red-200 shadow-[0_0_12px_rgba(255,26,64,0.4)]'
                        : 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:border-red-500/40 hover:text-red-300'
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Smart Habitat Subsystem */}
          <div className="border-t border-red-500/15 pt-2 flex items-center justify-between text-[11px] font-tech text-slate-300">
            <div className="flex items-center gap-2">
              <Lightbulb
                className="w-3.5 h-3.5"
                style={{ color: telemetry.smartHome.lights ? telemetry.smartHome.lightColor : '#64748b' }}
              />
              <span className="text-red-300 font-bold">
                {telemetry.smartHome.lights ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Lock className="w-3 h-3 text-red-400" />
              <span className="text-red-400 font-mono text-[10px]">
                {telemetry.smartHome.perimeterSecurity}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HIDDEN SYSTEM LOGS (TERMINAL VIEW) */}
      {activeTab === 'LOGS' && (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-200">
          {/* Terminal Sub-header & Filter Bar */}
          <div className="flex items-center justify-between gap-2 bg-slate-900/90 border border-red-500/20 rounded-lg px-2.5 py-1.5 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-red-400 flex-1">
              <Search className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search logs or directives..."
                className="bg-transparent text-red-100 placeholder:text-slate-500 focus:outline-none w-full text-[11px] font-mono"
              />
            </div>
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="text-slate-400 hover:text-red-300 text-[10px] px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Terminal Console Log Stream */}
          <div
            ref={logContainerRef}
            className="w-full h-56 overflow-y-auto bg-black/90 rounded-lg border border-red-500/25 p-3 flex flex-col gap-2 font-mono text-[11px] shadow-inner select-text relative"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255, 26, 64, 0.05) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            {filteredLogs.length === 0 ? (
              <div className="text-slate-500 italic py-6 text-center text-[11px]">
                {searchFilter
                  ? `> No logs matching keyword "${searchFilter}".`
                  : '> Voice buffer empty. Awaiting audio ingress...'}
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col gap-1 p-2 rounded bg-slate-900/60 border border-red-500/15 hover:border-red-500/40 transition-colors"
                >
                  {/* Log Header: Timestamp & Protocol & Status */}
                  <div className="flex items-center justify-between text-[10px] flex-wrap gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-red-400 font-bold font-mono">[{log.timestamp}]</span>
                      <span className="text-slate-400 font-mono">[{log.protocol}]</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-mono tracking-wider ${
                        log.status === 'EXECUTED'
                          ? 'bg-red-500/25 text-red-200 border border-red-400/50 shadow-[0_0_8px_rgba(255,26,64,0.25)]'
                          : log.status === 'PROCESSED'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-red-950/60 text-red-400/80 border border-red-500/20'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>

                  {/* Raw Voice Command Spoken */}
                  <div className="text-slate-200 text-[11px] leading-relaxed font-mono">
                    <span className="text-red-500 select-none mr-1">&gt;</span>
                    <span className="text-red-100 font-mono font-medium">"{log.rawCommand}"</span>
                  </div>

                  {/* Extracted Keywords Badges */}
                  <div className="flex items-center gap-1 flex-wrap mt-0.5 pt-1 border-t border-slate-800/80">
                    {log.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider bg-red-950/80 text-red-300 border border-red-500/30 shadow-[0_0_6px_rgba(255,26,64,0.2)]"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Terminal Footer Actions */}
          <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-slate-400 border-t border-red-500/15">
            <span className="text-slate-400">
              <span className="text-red-300 font-bold">{filteredLogs.length}</span> / {systemLogs.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLogs}
                disabled={systemLogs.length === 0}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-red-500/30 text-red-300 hover:text-red-100 hover:border-red-400 transition-colors cursor-pointer disabled:opacity-40"
                title="Copy"
              >
                {copied ? <Check className="w-3 h-3 text-red-400" /> : <Copy className="w-3 h-3" />}
              </button>

              {onClearLogs && (
                <button
                  onClick={() => {
                    sfx.playHudTick();
                    onClearLogs();
                  }}
                  disabled={systemLogs.length === 0}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-red-500/30 text-red-400 hover:text-red-200 hover:border-red-400 transition-colors cursor-pointer disabled:opacity-40"
                  title="Purge"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

