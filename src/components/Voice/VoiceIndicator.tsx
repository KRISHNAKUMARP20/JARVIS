import React from 'react';
import { AssistantState } from '../../types';

interface VoiceIndicatorProps {
  state: AssistantState;
  color: string;
}

export const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ state, color }) => {
  const stateConfig: Record<
    AssistantState,
    { text: string; subtext: string; badge: string; badgeClass: string }
  > = {
    IDLE: {
      text: 'SYSTEM ONLINE',
      subtext: 'AWAITING VOCAL PROMPT',
      badge: 'STANDBY',
      badgeClass: 'text-red-400 border-red-500/40 bg-red-950/40',
    },
    LISTENING: {
      text: 'LISTENING INTENTLY',
      subtext: 'CAPTURING ACOUSTIC STREAM',
      badge: 'RECORDING',
      badgeClass: 'text-red-300 border-red-400/80 bg-red-950/60 shadow-[0_0_12px_rgba(255,26,64,0.35)] animate-pulse',
    },
    COMPUTING: {
      text: 'EVALUATING COMMAND',
      subtext: 'GEMINI NEURAL DEPLOYMENT',
      badge: 'PROCESSING',
      badgeClass: 'text-red-200 border-red-400/80 bg-red-950/70 shadow-[0_0_12px_rgba(255,26,64,0.35)] animate-pulse',
    },
    SPEAKING: {
      text: 'TRANSMITTING VOCAL SYNTHESIS',
      subtext: 'J.A.R.V.I.S. AUDIO CARRIER',
      badge: 'BROADCASTING',
      badgeClass: 'text-red-100 border-red-400 bg-red-950/80 shadow-[0_0_16px_rgba(255,26,64,0.5)] hud-glow',
    },
  };

  const current = stateConfig[state];

  return (
    <div className="flex flex-col items-center justify-center text-center gap-1.5 pointer-events-none">
      <div className="flex items-center gap-2">
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-semibold tracking-widest uppercase border ${current.badgeClass}`}
        >
          {current.badge}
        </span>
      </div>
      <h2
        className="text-lg sm:text-2xl font-orbitron font-bold tracking-widest uppercase transition-colors duration-300"
        style={{ color, textShadow: `0 0 16px ${color}80` }}
      >
        {current.text}
      </h2>
      <p className="text-xs font-tech tracking-widest text-slate-400 uppercase">
        {current.subtext}
      </p>
    </div>
  );
};
