import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../../types';
import { Bot, User, Volume2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { sfx } from '../../audio/sfx';

interface ChatOverlayProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSpeakMessage?: (text: string) => void;
  color: string;
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
  messages,
  isTyping,
  onSpeakMessage,
  color,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="w-full h-64 sm:h-72 bg-slate-950/70 border border-red-500/20 rounded-xl p-3.5 backdrop-blur-md flex flex-col shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-500/20 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-red-400" />
          <span className="font-orbitron text-xs tracking-wider text-red-300 uppercase font-semibold">
            COMMUNICATIONS
          </span>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-sm">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-red-400/50 p-4">
            <Bot className="w-8 h-8 mb-2 opacity-40 animate-pulse" />
            <p className="font-orbitron text-xs tracking-wider">AWAITING VOCAL INPUT</p>
            <p className="text-[11px] font-rajdhani text-slate-400 mt-1 max-w-xs">
              Say &quot;Jarvis, run diagnostics&quot; or press the microphone below to initiate instructions.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isJarvis = msg.sender === 'jarvis';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isJarvis ? 'items-start' : 'items-end'} transition-all animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-3 border text-xs leading-relaxed transition-all duration-300 relative overflow-hidden ${
                    isJarvis
                      ? 'bg-red-950/50 border-red-400/40 text-red-100 rounded-tl-sm shadow-[0_0_15px_rgba(255,26,64,0.2)] ring-1 ring-red-500/20'
                      : 'bg-slate-900/85 border-slate-700/60 text-slate-200 rounded-tr-sm shadow-md'
                  }`}
                >
                  {isJarvis && (
                    <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none bg-gradient-to-bl from-red-400/20 to-transparent" />
                  )}
                  <div className="flex items-center justify-between gap-2 mb-1 opacity-75 text-[10px] font-tech">
                    <span className="flex items-center gap-1 font-semibold uppercase tracking-wider">
                      {isJarvis ? (
                        <>
                          <Bot className="w-3 h-3 text-red-400 animate-pulse" />
                          <span className="text-red-300">J.A.R.V.I.S.</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 text-slate-400" />
                          <span>MR. STARK</span>
                        </>
                      )}
                    </span>
                    <span className="text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>

                  <p className="font-rajdhani text-sm font-medium tracking-wide whitespace-pre-wrap">
                    {msg.text}
                  </p>

                  {/* Skill Badge if executed */}
                  {msg.skill && (
                    <div className="mt-2 pt-2 border-t border-red-500/20 flex flex-wrap items-center gap-1.5 text-[10px] font-tech text-red-300">
                      <CheckCircle2 className="w-3 h-3 text-red-400" />
                      <span className="uppercase font-bold tracking-wider">
                        SKILL: {msg.skill.name}
                      </span>
                      {msg.skill.details && (
                        <span className="text-slate-400 font-mono">
                          ({JSON.stringify(msg.skill.details)})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Speak button for Jarvis messages */}
                  {isJarvis && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => {
                          sfx.playHudTick();
                          sfx.speak(msg.text);
                        }}
                        className="flex items-center gap-1 text-[10px] font-tech text-red-400/80 hover:text-red-200 transition-colors"
                        title="Replay speech"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>REPLAY AUDIO</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-red-400 font-tech text-xs bg-red-950/30 border border-red-500/20 p-2 rounded-lg w-fit">
            <Bot className="w-3.5 h-3.5 animate-spin" />
            <span className="tracking-widest animate-pulse">PROCESSING NEURAL VECTORS...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
