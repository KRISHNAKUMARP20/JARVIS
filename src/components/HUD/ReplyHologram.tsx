import React, { useEffect, useState, useRef } from 'react';
import { Radio } from 'lucide-react';
import { AssistantState } from '../../types';
import { sfx, SpeechProgressEvent } from '../../audio/sfx';

interface ReplyHologramProps {
  latestMessage: string | null;
  state: AssistantState;
  color: string;
}

export const ReplyHologram: React.FC<ReplyHologramProps> = ({
  latestMessage,
  state,
  color,
}) => {
  const isSpeaking = state === 'SPEAKING';
  const isComputing = state === 'COMPUTING';
  const [displayedCharCount, setDisplayedCharCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);

  // Target character index reported by speech boundaries or timer estimation
  const targetCharIndexRef = useRef(0);
  const speechStartTimeRef = useRef<number>(0);
  const audioBoundaryReceivedRef = useRef(false);
  const lastTickTimeRef = useRef(0);

  // Trigger brief glitch animation on state changes
  useEffect(() => {
    setIsGlitching(true);
    const timer = setTimeout(() => {
      setIsGlitching(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [state]);

  // Handle visibility transitions
  useEffect(() => {
    if (isSpeaking || isComputing) {
      setVisible(true);
    } else {
      // Keep visible for a comfortable reading period after speaking finishes
      const timeout = setTimeout(() => {
        setVisible(false);
      }, 4500);
      return () => clearTimeout(timeout);
    }
  }, [isSpeaking, isComputing]);

  // Real-time Audio Speech Progress Subscription
  useEffect(() => {
    const unsubscribe = sfx.onSpeechProgress((event: SpeechProgressEvent) => {
      if (!latestMessage) return;

      if (event.isSpeaking) {
        audioBoundaryReceivedRef.current = true;
        // The boundary event charIndex is the start of the currently spoken word
        const wordEnd = event.charLength
          ? event.charIndex + event.charLength
          : Math.min(
              latestMessage.length,
              latestMessage.indexOf(' ', event.charIndex) !== -1
                ? latestMessage.indexOf(' ', event.charIndex)
                : event.charIndex + 4
            );
        targetCharIndexRef.current = Math.max(targetCharIndexRef.current, wordEnd);
      } else {
        // Speech playback finished
        targetCharIndexRef.current = latestMessage.length;
        setDisplayedCharCount(latestMessage.length);
      }
    });

    return unsubscribe;
  }, [latestMessage]);

  // Synchronized Character-by-Character Typewriter Loop
  useEffect(() => {
    if (!latestMessage) {
      setDisplayedCharCount(0);
      targetCharIndexRef.current = 0;
      return;
    }

    if (!isSpeaking) {
      // If already finished or idle, reveal full text
      setDisplayedCharCount(latestMessage.length);
      targetCharIndexRef.current = latestMessage.length;
      return;
    }

    // Reset typewriter for incoming vocal response
    setDisplayedCharCount(0);
    targetCharIndexRef.current = 0;
    speechStartTimeRef.current = performance.now();
    audioBoundaryReceivedRef.current = false;

    const fullLen = latestMessage.length;
    let currentCharCount = 0;

    // High precision character advance loop synchronized with audio playback
    const interval = setInterval(() => {
      if (currentCharCount >= fullLen) {
        setDisplayedCharCount(fullLen);
        clearInterval(interval);
        return;
      }

      const now = performance.now();
      const elapsedMs = now - speechStartTimeRef.current;

      // Pacing calculation calibrated to 1.02 speech rate (~16-18 chars/sec)
      const estimatedChars = Math.floor(elapsedMs / 56);

      // Synthesize boundary target with elapsed pace
      let effectiveTarget = Math.max(targetCharIndexRef.current, estimatedChars);
      effectiveTarget = Math.min(fullLen, effectiveTarget);

      if (currentCharCount < effectiveTarget) {
        // Advance character-by-character
        currentCharCount += 1;
        setDisplayedCharCount(currentCharCount);

        // Acoustic feedback for typewriter character appearance
        if (now - lastTickTimeRef.current > 70) {
          lastTickTimeRef.current = now;
          sfx.playSoftTypeTick();
        }
      } else if (currentCharCount < fullLen) {
        // Natural speech pause handling on punctuation marks
        const nextChar = latestMessage[currentCharCount];
        const isPauseChar =
          nextChar === ',' ||
          nextChar === '.' ||
          nextChar === ';' ||
          nextChar === '!' ||
          nextChar === '?';

        if (elapsedMs > currentCharCount * (isPauseChar ? 75 : 54)) {
          currentCharCount += 1;
          setDisplayedCharCount(currentCharCount);

          if (now - lastTickTimeRef.current > 70) {
            lastTickTimeRef.current = now;
            sfx.playSoftTypeTick();
          }
        }
      }
    }, 26);

    return () => clearInterval(interval);
  }, [latestMessage, isSpeaking]);

  if (!visible) {
    return null;
  }

  // Slice text according to character counter
  const textToRender = latestMessage
    ? isSpeaking
      ? latestMessage.slice(0, displayedCharCount)
      : latestMessage
    : '';

  const priorText = textToRender.length > 1 ? textToRender.slice(0, -1) : '';
  const lastChar = textToRender.length > 0 ? textToRender[textToRender.length - 1] : '';

  return (
    <div className="w-full max-w-xl mx-auto my-2 px-4 select-none relative transition-all duration-700 animate-in fade-in zoom-in-95">
      {/* Background Holographic Light Beam Glow */}
      <div
        className={`absolute -inset-2 rounded-2xl blur-lg transition-opacity duration-700 pointer-events-none ${
          isSpeaking ? 'opacity-40 animate-pulse' : 'opacity-15'
        }`}
        style={{
          background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
        }}
      />

      {/* Main Hologram Card - Clean Minimal Display */}
      <div
        className={`relative rounded-2xl border backdrop-blur-md p-4 sm:p-5 transition-all duration-500 shadow-2xl overflow-hidden ${
          isSpeaking
            ? 'bg-slate-950/85 border-red-400/60 shadow-[0_0_40px_rgba(255,26,64,0.4)] ring-1 ring-red-400/30'
            : 'bg-slate-950/80 border-red-500/30 shadow-[0_0_25px_rgba(255,26,64,0.18)]'
        } ${isGlitching ? 'holo-glitch-active' : ''}`}
      >
        {/* Hologram Scanline Sweeper */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(255,26,64,0.06)_50%)] bg-[length:100%_4px]" />

        {/* Central Speech Projection with Typewriter Effect */}
        <div className="min-h-[52px] flex items-center justify-center text-center">
          {isComputing ? (
            <div className="flex items-center gap-3 text-red-300 font-tech text-sm sm:text-base tracking-widest animate-pulse">
              <Radio className="w-4 h-4 text-red-400 animate-spin" />
              <span>...</span>
            </div>
          ) : (
            <p className="font-rajdhani text-base sm:text-lg text-red-100 font-medium tracking-wide leading-relaxed drop-shadow-[0_0_12px_rgba(255,26,64,0.65)]">
              {/* Prior Typed Characters */}
              <span>{priorText}</span>

              {/* Active Leading Character with Dynamic Optical Glow */}
              {lastChar && (
                <span
                  className="font-semibold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-all"
                  style={{ textShadow: `0 0 10px ${color}` }}
                >
                  {lastChar}
                </span>
              )}

              {/* Futuristic Typewriter Holographic Cursor */}
              {isSpeaking && (
                <span
                  className="inline-block w-2 sm:w-2.5 h-4 sm:h-5 ml-1 align-middle animate-pulse shadow-[0_0_8px_rgba(255,26,64,0.8)]"
                  style={{ backgroundColor: color }}
                />
              )}
            </p>
          )}
        </div>

        {/* Subtle Holographic Audio Waveform when Speaking */}
        {isSpeaking && (
          <div className="mt-3 pt-2 border-t border-red-500/20 flex items-center justify-center gap-1">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full animate-pulse"
                style={{
                  height: `${4 + Math.sin(i * 0.7 + displayedCharCount * 0.2) * 8 + Math.random() * 4}px`,
                  backgroundColor: color,
                  animationDuration: `${0.22 + (i % 5) * 0.07}s`,
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
        )}

        {/* Corner Sci-Fi Framing Ticks */}
        <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-red-400/80" />
        <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-red-400/80" />
        <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-red-400/80" />
        <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-red-400/80" />
      </div>
    </div>
  );
};
