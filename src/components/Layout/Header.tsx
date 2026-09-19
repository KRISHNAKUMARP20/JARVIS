import React, { useState, useEffect } from 'react';

interface HeaderProps {
  color: string;
}

export const Header: React.FC<HeaderProps> = ({ color }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-16 flex items-center justify-between px-8 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-30" style={{ borderBottom: `1px solid ${color}33` }}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
          <span className="font-rajdhani font-bold tracking-widest text-lg" style={{ color }}>J.A.R.V.I.S. SYSTEM ONLINE</span>
        </div>
        <div className="h-4 w-[1px] bg-gray-700" />
        <span className="font-mono text-sm tracking-wider opacity-60">MARK 85 ARMOR OS v4.2.1</span>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="text-right font-mono text-sm opacity-70">
          <div className="tracking-widest">MALIBU POINT, 10880</div>
          <div style={{ color }}>34.0259° N, 118.7798° W</div>
        </div>
        <div className="text-right font-rajdhani font-medium text-2xl tracking-widest min-w-[120px]" style={{ color }}>
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </div>
      </div>
    </div>
  );
};
