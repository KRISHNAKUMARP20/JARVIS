import React, { useEffect, useState, useRef } from 'react';

interface RadarWidgetProps {
  color: string;
}

interface Target {
  id: number;
  r: number; // radius (0 to 1)
  theta: number; // angle
  size: number;
  opacity: number;
}

export const RadarWidget: React.FC<RadarWidgetProps> = ({ color }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const animationRef = useRef<number>(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    // Generate initial targets
    const initialTargets = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      r: 0.2 + Math.random() * 0.7,
      theta: Math.random() * Math.PI * 2,
      size: 2 + Math.random() * 3,
      opacity: 0,
    }));
    setTargets(initialTargets);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // Update targets occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        setTargets(prev => {
          const newTargets = [...prev];
          // Replace one target
          const idx = Math.floor(Math.random() * newTargets.length);
          newTargets[idx] = {
            id: Date.now(),
            r: 0.2 + Math.random() * 0.7,
            theta: Math.random() * Math.PI * 2,
            size: 2 + Math.random() * 3,
            opacity: 1, // Will fade over time in a real implementation, just keeping it simple
          };
          return newTargets;
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-8 right-8 w-48 h-48 border border-red-500/20 rounded-full bg-black/40 backdrop-blur-sm pointer-events-none z-20 flex items-center justify-center overflow-hidden" style={{ borderColor: `${color}33` }}>
      
      {/* Radar Sweep */}
      <div 
        className="absolute inset-0 rounded-full opacity-50"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, ${color}44 360deg)`,
          animation: 'spin 3s linear infinite',
        }}
      />
      
      {/* Concentric Circles */}
      <div className="absolute w-3/4 h-3/4 rounded-full border border-dashed opacity-30 animate-spin-slow" style={{ borderColor: color, animationDuration: '20s' }} />
      <div className="absolute w-2/4 h-2/4 rounded-full border border-dotted opacity-40 animate-spin-reverse" style={{ borderColor: color, animationDuration: '15s' }} />
      <div className="absolute w-1/4 h-1/4 rounded-full border opacity-50" style={{ borderColor: color }} />
      
      {/* Crosshairs */}
      <div className="absolute w-full h-[1px] opacity-30" style={{ backgroundColor: color }} />
      <div className="absolute h-full w-[1px] opacity-30" style={{ backgroundColor: color }} />

      {/* Targets */}
      {targets.map(target => {
        const x = 50 + target.r * 50 * Math.cos(target.theta);
        const y = 50 + target.r * 50 * Math.sin(target.theta);
        
        return (
          <div 
            key={target.id}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${target.size}px`,
              height: `${target.size}px`,
              backgroundColor: color,
              boxShadow: `0 0 ${target.size * 2}px ${color}`,
              transform: 'translate(-50%, -50%)',
              animation: 'pulse 2s infinite'
            }}
          />
        );
      })}
    </div>
  );
};
