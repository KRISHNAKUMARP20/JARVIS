import React, { useState } from 'react';
import { Volume2, VolumeX, Cpu, RotateCcw, Activity, Smartphone } from 'lucide-react';
import { ProtocolMode, PhoneState } from '../../types';
import { sfx } from '../../audio/sfx';

interface NavbarProps {
  protocol: ProtocolMode;
  showStatus?: boolean;
  onToggleStatus?: () => void;
  phone?: PhoneState;
  showPhonePanel?: boolean;
  onTogglePhonePanel?: () => void;
  onSelectProtocol?: (mode: ProtocolMode) => void;
  onReset: () => void;
  color: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  protocol,
  showStatus,
  onToggleStatus,
  phone,
  showPhonePanel,
  onTogglePhonePanel,
  onSelectProtocol,
  onReset,
  color,
}) => {
  const [soundActive, setSoundActive] = useState(true);

  const toggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    sfx.setEnabled(next);
    if (next) sfx.playHudTick();
  };

  return (
    <header className="relative z-20 w-full px-4 sm:px-8 py-3 flex items-center justify-between border-b border-red-500/15 bg-slate-950/60 backdrop-blur-md">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl border border-red-400/60 bg-red-950/40 flex items-center justify-center shadow-[0_0_15px_rgba(255,26,64,0.4)] transition-colors duration-500"
          style={{ borderColor: color }}
        >
          <Cpu className="w-5 h-5" style={{ color }} />
        </div>
        <h1 className="font-orbitron font-black text-lg sm:text-xl tracking-widest text-red-200 hud-glow">
          J.A.R.V.I.S.
        </h1>
      </div>

      {/* Single Signature Holographic Crimson Arc Reactor Telemetry Core Badge */}
      <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-red-500/30 bg-slate-950/70 backdrop-blur-md shadow-[0_0_15px_rgba(255,26,64,0.2)]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_#ff1a40]" />
        </span>
        <span className="font-orbitron text-[10px] sm:text-[11px] font-bold tracking-widest text-red-200">
          CRIMSON CORE <span className="text-red-400 font-normal opacity-80">// MK-85</span>
        </span>
        <span className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/30 text-red-300">
          99.8% FLUX
        </span>
      </div>

      {/* Right Controls: Phone Link, Telemetry HUD, Sound Toggle, Reset */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Phone Link Control Toggle */}
        <button
          onClick={() => {
            sfx.playHudTick();
            onTogglePhonePanel?.();
          }}
          className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
            showPhonePanel || phone?.activeCall || phone?.flashlightOn || phone?.isRinging
              ? 'bg-red-500/25 border-red-400 text-red-200 shadow-[0_0_20px_rgba(255,26,64,0.6)] animate-pulse'
              : 'border-red-500/30 bg-slate-900/60 text-red-300 hover:border-red-400 hover:bg-red-500/20 shadow-[0_0_15px_rgba(255,26,64,0.2)]'
          }`}
          title="Phone Control Hub (Voice & Typing)"
        >
          <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
          <span className="hidden lg:inline font-orbitron text-[11px] font-semibold tracking-wider">
            PHONE LINK
          </span>
          {phone && (
            <span className="text-[9px] font-mono font-bold text-red-300 hidden sm:inline">
              {phone.batteryLevel}%
            </span>
          )}
        </button>

        {/* Telemetry Status Panel Toggle */}
        <button
          onClick={() => {
            sfx.playHudTick();
            onToggleStatus?.();
          }}
          className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
            showStatus
              ? 'bg-red-500/25 border-red-400 text-red-200 shadow-[0_0_15px_rgba(255,26,64,0.5)]'
              : 'border-red-500/30 bg-slate-900/60 text-red-300 hover:border-red-400 hover:bg-red-500/20 shadow-[0_0_15px_rgba(255,26,64,0.2)]'
          }`}
          title="Toggle Diagnostics & Status Panel"
        >
          <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden md:inline font-orbitron text-[11px] font-semibold tracking-wider">
            TELEMETRY
          </span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          className="p-2 sm:p-2.5 rounded-xl border border-red-500/30 bg-slate-900/60 text-red-300 hover:border-red-400 hover:bg-red-500/20 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,26,64,0.2)]"
          title={soundActive ? 'Mute Audio Effects' : 'Enable Audio Effects'}
        >
          {soundActive ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />}
        </button>

        {/* Reset / Purge */}
        <button
          onClick={() => {
            sfx.playHudTick();
            onReset();
          }}
          className="p-2 sm:p-2.5 rounded-xl border border-red-500/30 bg-slate-900/60 text-red-300 hover:border-red-400 hover:bg-red-500/20 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,26,64,0.2)]"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </header>
  );
};
