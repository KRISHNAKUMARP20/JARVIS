import React, { useEffect, useState, useRef } from 'react';
import { AssistantState } from '../../types';

interface WaveformVizProps {
  state: AssistantState;
  color: string;
}

export const WaveformViz: React.FC<WaveformVizProps> = ({ state, color }) => {
  const [bars, setBars] = useState<number[]>(() => new Array(32).fill(8));
  const [peaks, setPeaks] = useState<number[]>(() => new Array(32).fill(10));
  const peaksRef = useRef<number[]>(new Array(32).fill(10));

  useEffect(() => {
    let animId: number;
    let t = 0;

    const update = () => {
      t += 0.08;
      const newBars: number[] = [];
      const currentPeaks = [...peaksRef.current];

      for (let i = 0; i < 32; i++) {
        let height = 8;
        const normIdx = i / 31; // 0 to 1

        if (state === 'IDLE') {
          // Gentle resting wave
          height = 6 + Math.sin(t * 1.5 + i * 0.3) * 5;
        } else if (state === 'LISTENING') {
          // Reactive microphone acoustic ripples
          const wave1 = Math.sin(t * 3.5 + i * 0.4);
          const wave2 = Math.cos(t * 2.1 - i * 0.2);
          const envelope = Math.sin(normIdx * Math.PI);
          height = 10 + Math.abs(wave1 * wave2) * 44 * envelope;
        } else if (state === 'COMPUTING') {
          // Fast algorithmic spectrum sweep
          const sweep = Math.sin(t * 6 + i * 0.6);
          height = 12 + Math.abs(sweep) * 48;
        } else if (state === 'SPEAKING') {
          // Rich vocal harmonics
          const fundamental = Math.sin(t * 4.2 + i * 0.2);
          const harmonic1 = Math.sin(t * 7.8 + i * 0.5) * 0.5;
          const envelope = Math.sin(normIdx * Math.PI);
          height = 14 + (Math.abs(fundamental + harmonic1) * 62) * (0.35 + 0.65 * envelope);
        }

        const clampedHeight = Math.max(4, Math.min(68, height));
        newBars.push(clampedHeight);

        // Peak decay physics
        if (clampedHeight > currentPeaks[i]) {
          currentPeaks[i] = clampedHeight;
        } else {
          currentPeaks[i] = Math.max(4, currentPeaks[i] - 0.7);
        }
      }

      peaksRef.current = currentPeaks;
      setPeaks(currentPeaks);
      setBars(newBars);
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [state]);

  return (
    <div className="w-full max-w-lg flex flex-col items-center select-none pointer-events-none">
      {/* Waveform Visualizer with Glowing Peaks & Mirror Reflection */}
      <div className="relative flex flex-col items-center justify-center w-full px-4">
        {/* Main Spectrum Bars & Floating Peaks */}
        <div className="flex items-end justify-center gap-[3px] sm:gap-1.5 h-16 w-full relative">
          {bars.map((h, i) => {
            const isCenter = i > 10 && i < 22;
            const peakY = peaks[i];
            return (
              <div key={i} className="relative flex flex-col items-center justify-end h-full">
                {/* Floating Peak Dot */}
                <div
                  className="w-1 sm:w-1.5 h-1 rounded-full absolute transition-all duration-75"
                  style={{
                    bottom: `${peakY + 2}px`,
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}`,
                    opacity: 0.95,
                  }}
                />
                {/* Harmonic Bar */}
                <div
                  className="w-1 sm:w-1.5 rounded-t-sm transition-all duration-75"
                  style={{
                    height: `${h}px`,
                    backgroundColor: color,
                    opacity: isCenter ? 0.95 : 0.6,
                    boxShadow: `0 0 10px ${color}80`,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Mirror Reflection with Opacity Gradient */}
        <div className="flex items-start justify-center gap-[3px] sm:gap-1.5 h-5 w-full opacity-25 overflow-hidden">
          {bars.map((h, i) => (
            <div
              key={i}
              className="w-1 sm:w-1.5 rounded-b-sm"
              style={{
                height: `${h * 0.4}px`,
                backgroundColor: color,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
