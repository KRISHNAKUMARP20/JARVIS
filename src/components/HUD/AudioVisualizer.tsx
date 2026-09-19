import React, { useEffect, useState } from 'react';
import { AssistantState } from '../../types';

interface AudioVisualizerProps {
  color: string;
  state: AssistantState;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ color, state }) => {
  const [bars, setBars] = useState<number[]>(Array(32).fill(10));
  const isSpeaking = state === 'SPEAKING';

  useEffect(() => {
    if (!isSpeaking) {
      // Return to baseline
      setBars(prev => prev.map(v => Math.max(10, v * 0.8)));
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => {
        // Random height between 10% and 100%
        return Math.floor(Math.random() * 90) + 10;
      }));
    }, 100); // 10fps update for fast audio reaction

    return () => clearInterval(interval);
  }, [isSpeaking]);

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-96 h-16 flex items-end justify-center gap-1 opacity-70 pointer-events-none z-20">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-2 rounded-t-sm transition-all duration-75 ease-out"
          style={{
            height: `${isSpeaking ? height : 10}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`,
            opacity: isSpeaking ? 0.8 : 0.3
          }}
        />
      ))}
    </div>
  );
};
