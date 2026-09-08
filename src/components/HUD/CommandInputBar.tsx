import React, { useState, useRef } from 'react';
import {
  Send,
  Smartphone,
  Phone,
  Flashlight,
  Timer,
  BellRing,
  Battery,
  Camera,
  Music,
  Search,
  X,
} from 'lucide-react';
import { AssistantState, PhoneState } from '../../types';
import { sfx } from '../../audio/sfx';

interface CommandInputBarProps {
  onSendMessage: (text: string) => void;
  state: AssistantState;
  phone: PhoneState;
  onTogglePhonePanel: () => void;
  color?: string;
}

const QUICK_PHONE_DIRECTIVES = [
  { label: 'Search', prompt: 'Search database for active diagnostics', icon: Search },
  { label: 'Call Pepper', prompt: 'Call Pepper Potts', icon: Phone },
  { label: 'Text Rhodey', prompt: 'Send text to Rhodey: Armor flight test ready', icon: Send },
  { label: 'Flashlight', prompt: 'Toggle flashlight', icon: Flashlight },
  { label: '5m Timer', prompt: 'Set timer for 5 minutes', icon: Timer },
  { label: 'Find Phone', prompt: 'Find my phone', icon: BellRing },
  { label: 'Battery', prompt: 'Check phone battery', icon: Battery },
  { label: 'Camera', prompt: 'Open camera', icon: Camera },
  { label: 'Music', prompt: 'Play music', icon: Music },
];

export const CommandInputBar: React.FC<CommandInputBarProps> = ({
  onSendMessage,
  state,
  phone,
  onTogglePhonePanel,
  color = '#ff1a40',
}) => {
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || state === 'COMPUTING') return;

    sfx.playHudTick();
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleQuickDirective = (prompt: string) => {
    sfx.playHudTick();
    onSendMessage(prompt);
  };

  const isComputing = state === 'COMPUTING';

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-2 select-none font-rajdhani px-3">
      {/* Quick Phone Directive Pills */}
      <div className="w-full flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {/* Phone Hub Button */}
        <button
          type="button"
          onClick={() => {
            sfx.playHudTick();
            onTogglePhonePanel();
          }}
          className={`px-3 py-1.5 rounded-full border text-[11px] font-tech font-bold tracking-wider flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            phone.activeCall || phone.flashlightOn || phone.isRinging
              ? 'border-red-400 bg-red-950 text-red-100 shadow-[0_0_20px_rgba(255,26,64,0.6)] animate-pulse'
              : 'border-red-500/40 bg-slate-950/80 text-red-300 hover:border-red-300 hover:text-white shadow-sm'
          }`}
          title="Open Stark Phone Control Hub"
        >
          <Smartphone className="w-3.5 h-3.5 text-red-400" />
          <span>PHONE LINK</span>
          {(phone.activeCall || phone.flashlightOn || phone.isRinging) && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
          )}
        </button>

        {/* Action Directives */}
        {QUICK_PHONE_DIRECTIVES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickDirective(item.prompt)}
              disabled={isComputing}
              className="px-2.5 py-1 rounded-full border border-red-500/25 bg-slate-950/70 hover:bg-red-500/15 hover:border-red-400 text-red-300/85 hover:text-red-100 text-[11px] font-tech font-medium flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-40 cursor-pointer shadow-sm backdrop-blur-md"
            >
              <Icon className="w-3 h-3 text-red-400" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Holographic Keyboard Typing Bar */}
      <form
        onSubmit={handleSubmit}
        className={`w-full relative flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-2xl border transition-all duration-300 backdrop-blur-xl shadow-lg ${
          isFocused
            ? 'border-red-400 bg-slate-950/90 shadow-[0_0_25px_rgba(255,26,64,0.45)] ring-1 ring-red-400/40'
            : 'border-red-500/30 bg-slate-950/75 hover:border-red-500/50'
        }`}
      >
        {/* Search & Directive Prompt Indicator */}
        <div className="flex items-center gap-1.5 pl-1 text-red-400">
          <Search className="w-4 h-4 text-red-400 opacity-80" />
        </div>

        {/* Input Text Field */}
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search status, diagnostics, or type command..."
          disabled={isComputing}
          className="flex-1 bg-transparent border-none text-xs sm:text-sm font-rajdhani text-red-100 placeholder-red-400/40 focus:outline-none focus:ring-0 disabled:opacity-50 tracking-wide"
        />

        {/* Clear Button if text typed */}
        {inputText && (
          <button
            type="button"
            onClick={() => setInputText('')}
            className="p-1 rounded-md text-red-400/60 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-all"
            title="Clear text"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Send Command Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isComputing}
          className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
            inputText.trim() && !isComputing
              ? 'border-red-400 bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(255,26,64,0.6)] scale-105'
              : 'border-red-500/20 bg-slate-900/50 text-red-500/40 cursor-not-allowed'
          }`}
          title="Send command to JARVIS (Enter)"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
