import React, { useState, useEffect } from 'react';
import { AssistantState, ProtocolMode } from '../../types';

interface HUDRingsProps {
  state: AssistantState;
  protocol: ProtocolMode;
  color: string;
}

export const HUDRings: React.FC<HUDRingsProps> = ({ state, protocol: _protocol, color }) => {
  const isListening = state === 'LISTENING';
  const isComputing = state === 'COMPUTING';
  const isSpeaking = state === 'SPEAKING';

  const [isGlitching, setIsGlitching] = useState(false);

  // Trigger brief glitch animation on state or protocol changes
  useEffect(() => {
    setIsGlitching(true);
    const timer = setTimeout(() => {
      setIsGlitching(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [state, _protocol]);

  // Subtle random glitch spasms to enhance organic holographic projection
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const scheduleNextGlitch = () => {
      // Random interval between 6s and 14s
      const delay = Math.floor(Math.random() * 8000) + 6000;
      timeoutId = setTimeout(() => {
        setIsGlitching(true);
        setTimeout(() => {
          setIsGlitching(false);
          scheduleNextGlitch();
        }, 320 + Math.random() * 200);
      }, delay);
    };

    scheduleNextGlitch();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div
      className={`absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden transition-filter duration-200 ${
        isGlitching ? 'holo-glitch-active' : ''
      }`}
    >
      {/* Outer Rotating Segmented Ring */}
      <div
        className="absolute w-[95vmin] h-[95vmin] rounded-full border animate-hyper-blur-spin animate-blinding-flash"
        style={{
          borderColor: `${color}`,
          borderStyle: 'dashed',
        }}
      >
        {/* Cardinal Notches & Beacons */}
        <div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full shadow-[0_0_12px_currentColor]"
          style={{ backgroundColor: color, color }}
        />
        <div
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />

        {/* Diagonal Notch Ticks */}
        <div
          className="absolute top-[14.6%] left-[14.6%] w-2 h-2 rounded-full opacity-70"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute top-[14.6%] right-[14.6%] w-2 h-2 rounded-full opacity-70"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute bottom-[14.6%] left-[14.6%] w-2 h-2 rounded-full opacity-70"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute bottom-[14.6%] right-[14.6%] w-2 h-2 rounded-full opacity-70"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Counter Rotating Ring with Radial Markers */}
      <div
        className="absolute w-[85vmin] h-[85vmin] rounded-full border-2 border-transparent animate-hyper-blur-spin animate-blinding-flash"
        style={{
          borderTopColor: `${color}`,
          borderBottomColor: `${color}`,
          animationDirection: 'reverse'
        }}
      >
        {/* Orbiting Photon Beacons on inner track */}
        <div
          className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]"
          style={{ backgroundColor: color, color }}
        />
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]"
          style={{ backgroundColor: color, color }}
        />
      </div>

      {/* Target Reticle Brackets */}
      <div
        className={`absolute w-[75vmin] h-[75vmin] transition-all duration-500 ${
          isSpeaking ? 'scale-105' : isListening ? 'scale-110' : 'scale-100'
        }`}
      >
        {/* Top-left bracket */}
        <div
          className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 transition-colors duration-500"
          style={{ borderColor: color }}
        />
        {/* Top-right bracket */}
        <div
          className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 transition-colors duration-500"
          style={{ borderColor: color }}
        />
        {/* Bottom-left bracket */}
        <div
          className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 transition-colors duration-500"
          style={{ borderColor: color }}
        />
        {/* Bottom-right bracket */}
        <div
          className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 transition-colors duration-500"
          style={{ borderColor: color }}
        />

        {/* Top & Bottom Precision Alignment Chevron Ticks */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-0.5" style={{ backgroundColor: color }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-3 h-0.5" style={{ backgroundColor: color }} />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 h-3 w-0.5" style={{ backgroundColor: color }} />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 h-3 w-0.5" style={{ backgroundColor: color }} />
      </div>

      {/* Holographic Arc Segment Rings */}
      <svg
        className={`absolute w-[80vmin] h-[80vmin] transition-all duration-500 ${
          isSpeaking ? 'scale-105' : 'scale-100'
        }`}
        viewBox="0 0 200 200"
      >
        <circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke={color}
          strokeWidth="0.8"
          strokeDasharray="4 6"
          opacity="0.4"
        />
        <circle
          cx="100"
          cy="100"
          r="74"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="18 10 35 12"
          opacity="0.6"
          className="origin-center animate-spin-slow"
          style={{ animationDuration: '40s' }}
        />
        <circle
          cx="100"
          cy="100"
          r="62"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="2 12"
          opacity="0.5"
          className="origin-center animate-spin-reverse"
          style={{ animationDuration: '20s' }}
        />
        {/* Additional Concentric Hexagon Target Ring */}
        <polygon
          points="100,20 169,60 169,140 100,180 31,140 31,60"
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          strokeDasharray="6 8"
          opacity="0.25"
          className="origin-center animate-spin-slow"
          style={{ animationDuration: '60s' }}
        />
      </svg>

      {/* Sweeping Radar Scanner Line */}
      <div
        className="absolute w-[78vmin] h-[78vmin] rounded-full pointer-events-none"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, transparent 315deg, ${color}35 360deg)`,
          animation: 'spin 5s linear infinite',
        }}
      />

      {/* Concentric Audio Reactive Shockwave Pulses on speaking */}
      {isSpeaking && (
        <>
          <div
            className="absolute w-[65vmin] h-[65vmin] rounded-full animate-shockwave pointer-events-none border-2 opacity-80"
            style={{ borderColor: color, boxShadow: `0 0 15px ${color}` }}
          />
          <div
            className="absolute w-[65vmin] h-[65vmin] rounded-full animate-shockwave pointer-events-none border opacity-60"
            style={{ borderColor: color, animationDelay: '0.45s', boxShadow: `0 0 10px ${color}` }}
          />
          <div
            className="absolute w-[65vmin] h-[65vmin] rounded-full animate-shockwave pointer-events-none border opacity-40"
            style={{ borderColor: color, animationDelay: '0.9s' }}
          />
          {/* Radial acoustic burst spikes */}
          <div
            className="absolute w-[90vmin] h-[90vmin] rounded-full border border-dashed animate-spin-slow opacity-60 pointer-events-none"
            style={{ borderColor: color, animationDuration: '6s' }}
          />
        </>
      )}

      {/* Central Crosshair Lines */}
      <div className="absolute w-[80vmin] h-[1px] pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />
      <div className="absolute h-[80vmin] w-[1px] pointer-events-none" style={{ background: `linear-gradient(180deg, transparent, ${color}40, transparent)` }} />
    </div>
  );
};
