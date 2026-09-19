import React, { useEffect, useState } from 'react';

interface TelemetryPanelProps {
  color: string;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ color }) => {
  const [cpu, setCpu] = useState(0);
  const [ram, setRam] = useState(0);
  const [net, setNet] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(Math.floor(Math.random() * 40) + 20); // 20-60%
      setRam(Math.floor(Math.random() * 20) + 60); // 60-80%
      setNet(Math.floor(Math.random() * 80) + 10); // 10-90%
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-8 left-8 w-64 p-4 border border-red-500/30 rounded-xl bg-black/40 backdrop-blur-sm pointer-events-none transition-colors duration-500 z-20" style={{ borderColor: `${color}44` }}>
      <h3 className="text-xl font-rajdhani font-bold mb-4 tracking-widest" style={{ color }}>SYSTEM TELEMETRY</h3>
      
      <div className="space-y-4">
        {/* CPU */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1" style={{ color: `${color}bb` }}>
            <span>CPU CORE USAGE</span>
            <span>{cpu}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
            <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${cpu}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
          </div>
        </div>

        {/* RAM */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1" style={{ color: `${color}bb` }}>
            <span>MEMORY ALLOCATION</span>
            <span>{ram}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
            <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${ram}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
          </div>
        </div>

        {/* NETWORK */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1" style={{ color: `${color}bb` }}>
            <span>UPLINK TRAFFIC</span>
            <span>{net} MB/s</span>
          </div>
          <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden flex gap-1">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="flex-1 h-full transition-all duration-500" 
                style={{ 
                  backgroundColor: i < (net / 100) * 20 ? color : 'transparent',
                  opacity: i < (net / 100) * 20 ? 0.8 : 0.2,
                  border: `1px solid ${color}33`
                }} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
