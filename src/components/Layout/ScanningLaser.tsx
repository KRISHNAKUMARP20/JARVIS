import React from 'react';

export const ScanningLaser: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <div 
        className="absolute top-0 left-0 w-full h-[2px] opacity-70 animate-scan-vertical"
        style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}, 0 0 30px ${color}` }}
      />
      <div 
        className="absolute top-0 left-0 h-full w-[2px] opacity-70 animate-scan-horizontal"
        style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}, 0 0 30px ${color}` }}
      />
    </div>
  );
};
