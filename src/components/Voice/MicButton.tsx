import React, { useState, useEffect, useRef } from 'react';
import { Mic, Radio, Volume2 } from 'lucide-react';
import { AssistantState } from '../../types';
import { sfx } from '../../audio/sfx';

interface MicButtonProps {
  state: AssistantState;
  onSendMessage: (text: string) => void;
  color: string;
}

export const MicButton: React.FC<MicButtonProps> = ({
  state,
  onSendMessage,
  color,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setLiveTranscript('');
      sfx.playActivationChime();
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setLiveTranscript(interim || final);

      if (final.trim()) {
        onSendMessage(final.trim());
        setLiveTranscript('');
        setIsListening(false);
      }
    };

    recognition.onerror = (err: any) => {
      console.warn('Speech recognition notice:', err?.error || err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch (e) {
        // ignore
      }
    };
  }, [onSendMessage]);

  const toggleListening = () => {
    if (!speechSupported) {
      onSendMessage('Jarvis, give me an updated status report on all active systems.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Recognition start notice:', e);
        // Fallback to trigger voice response
        onSendMessage('Jarvis, report on reactor output and primary defense grid.');
      }
    }
  };

  const isSpeaking = state === 'SPEAKING';
  const isComputing = state === 'COMPUTING';

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-3 select-none">
      {/* Live Voice Transcription Pill if actively speaking into mic */}
      {liveTranscript && (
        <div className="px-4 py-1.5 rounded-full border border-red-400/60 bg-red-950/80 backdrop-blur-md shadow-[0_0_20px_rgba(255,26,64,0.4)] flex items-center gap-2 animate-bounce">
          <Radio className="w-3.5 h-3.5 text-red-300 animate-spin" />
          <span className="text-xs font-rajdhani font-semibold text-red-200 tracking-wide">
            &quot;{liveTranscript}&quot;
          </span>
        </div>
      )}

      {/* Voice Trigger Holographic Arc Reactor Dock */}
      <div className="relative flex items-center justify-center">
        {/* Radiating sound halos */}
        {(isListening || isSpeaking) && (
          <>
            <div
              className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full animate-ping opacity-35"
              style={{ backgroundColor: color }}
            />
            <div
              className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full animate-pulse opacity-25 border-2"
              style={{ borderColor: color }}
            />
          </>
        )}

        {/* Ambient rotating HUD ring around mic */}
        <div
          className={`absolute w-24 h-24 sm:w-30 sm:h-30 rounded-full border border-dashed transition-all duration-700 pointer-events-none ${
            isListening ? 'animate-spin-slow opacity-95 scale-110' : 'animate-spin-slow opacity-45'
          }`}
          style={{ borderColor: color }}
        />

        {/* Outer Counter Rotating Ring */}
        <div
          className={`absolute w-28 h-28 sm:w-34 sm:h-34 rounded-full border-2 border-transparent transition-all duration-700 pointer-events-none ${
            isListening ? 'animate-spin-reverse opacity-85' : 'animate-spin-reverse opacity-30'
          }`}
          style={{
            borderTopColor: color,
            borderBottomColor: color,
          }}
        />

        {/* Main Microphone Button */}
        <button
          onClick={toggleListening}
          className={`relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl border-2 cursor-pointer ${
            isListening
              ? 'bg-amber-500/25 border-amber-400 text-amber-200 scale-110 shadow-[0_0_40px_rgba(245,158,11,0.7)] ring-4 ring-amber-400/20'
              : isSpeaking
              ? 'bg-red-500/25 border-red-300 text-red-100 scale-105 shadow-[0_0_35px_rgba(255,26,64,0.65)] animate-pulse'
              : isComputing
              ? 'bg-rose-950/70 border-rose-400 text-rose-300 animate-spin-slow'
              : 'bg-slate-950/85 border-red-400/50 text-red-300 hover:scale-110 hover:border-red-300 shadow-[0_0_30px_rgba(255,26,64,0.35)]'
          }`}
          title={isListening ? 'Listening...' : 'Voice Activate'}
        >
          {isListening ? (
            <Mic className="w-7 h-7 sm:w-8 sm:h-8 animate-pulse text-amber-300" />
          ) : isSpeaking ? (
            <Volume2 className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce text-red-200" />
          ) : (
            <Mic className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110" />
          )}
        </button>
      </div>
    </div>
  );
};
