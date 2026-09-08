import React from 'react';

interface ScanlineOverlayProps {
  color?: string;
}

export const ScanlineOverlay: React.FC<ScanlineOverlayProps> = ({ color = '#ff1a40' }) => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none"
    >
      {/* 1. Downward Scrolling Micro-Scanlines Layer */}
      <div
        className="absolute inset-0 holo-scanlines-pattern opacity-60"
        style={{
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 65%, rgba(0,0,0,0.5) 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 65%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* 2. Soft Downward Scrolling Primary Holographic Refresh Beam */}
      <div
        className="absolute left-0 right-0 h-44 holo-beam-sweep pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, ${color}08 30%, ${color}20 50%, ${color}08 70%, transparent 100%)`,
          boxShadow: `0 0 35px ${color}15`,
        }}
      />

      {/* 3. High-Energy Precision Phosphor Raster Line */}
      <div
        className="absolute left-0 right-0 h-[2px] holo-beam-sweep pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color}40 20%, ${color}90 50%, ${color}40 80%, transparent 100%)`,
          boxShadow: `0 0 12px ${color}`,
        }}
      />

      {/* 4. Peripheral Terminal Visor Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(2,6,23,0.45)_100%)] pointer-events-none" />
    </div>
  );
};
