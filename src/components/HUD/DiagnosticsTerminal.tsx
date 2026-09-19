import React, { useEffect, useState } from 'react';

const FAKE_LOGS = [
  'INITIALIZING QUANTUM NEURAL NET...',
  'BYPASSING SECURITY PROTOCOLS [OK]',
  'LOADING MARK 85 ARMOR DIAGNOSTICS...',
  'REPULSOR SYSTEMS ONLINE.',
  'ARC REACTOR OUTPUT: 104%',
  'SCANNING FOR HOSTILES...',
  'NO THREATS DETECTED.',
  'CALIBRATING TARGETING SYSTEMS...',
  'UPLOADING TELEMETRY DATA...',
  'SYNCING WITH SATELLITE GRID.',
  'ENCRYPTING COMMUNICATIONS...',
  'SYSTEM INTEGRITY AT 99.8%',
  'OPTIMIZING FLIGHT SURFACES...',
  'THERMAL SIGNATURE NOMINAL.',
  'DEFENSE PROTOCOL: STANDBY'
];

export const DiagnosticsTerminal: React.FC<{ color: string }> = ({ color }) => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      setLogs((prev) => {
        const nextLogs = [...prev, `[${new Date().toISOString().substring(11, 23)}] ${FAKE_LOGS[Math.floor(Math.random() * FAKE_LOGS.length)]}`];
        if (nextLogs.length > 20) {
          nextLogs.shift();
        }
        return nextLogs;
      });
      count++;
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute left-4 top-24 bottom-24 w-64 pointer-events-none z-20 flex flex-col justify-end overflow-hidden" style={{ color }}>
      <div className="font-mono text-xs opacity-70 flex flex-col gap-1 tracking-wider">
        {logs.map((log, i) => (
          <div key={i} className="animate-fade-in truncate">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};
