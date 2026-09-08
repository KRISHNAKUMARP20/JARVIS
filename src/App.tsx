import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AssistantState, ProtocolMode, PhoneState } from './types';
import { Background } from './components/Layout/Background';
import { JarvisOrb } from './components/Orb/JarvisOrb';
import { HUDRings } from './components/HUD/HUDRings';
import { sfx } from './audio/sfx';

export default function App() {
  const [state, setState] = useState<AssistantState>('IDLE');
  const [protocol, setProtocol] = useState<ProtocolMode>('STANDBY');
  const [subtitle, setSubtitle] = useState('');
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  
  // Phone Link State
  const [phone, setPhone] = useState<PhoneState>({
    connected: true,
    deviceName: 'STARK-PHONE-MK85',
    batteryLevel: 88,
    isCharging: true,
    wifiEnabled: true,
    bluetoothEnabled: true,
    flashlightOn: false,
    dndEnabled: false,
    volume: 75,
    isRinging: false,
    ringLocation: 'Malibu Workshop, Sector 4 (GPS: 34.0259° N, 118.7798° W)',
    activeCall: null,
    activeTimer: null,
    messages: [],
    activeApp: null,
  });

  const currentColor = '#ff1a40';
  const [pulseTrigger, setPulseTrigger] = useState(0);

  const triggerPlasmaPulse = (overrideColor?: string) => {
    setPulseTrigger((prev) => prev + 1);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('jarvis-plasma-pulse', {
          detail: { color: overrideColor || currentColor },
        })
      );
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      sfx.playActivationChime();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = useCallback(async (userText: string) => {
    if (!userText.trim()) return;

    triggerPlasmaPulse();
    setState('COMPUTING');
    sfx.playComputingBlip();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      if (!res.ok) throw new Error('Server request error');

      const data = await res.json();

      if (data.phone) {
        setPhone((prev) => ({ ...prev, ...data.phone }));
      }

      if (data.skill) {
        if (data.skill.name === 'phone_call') {
          if (data.skill.details?.action === 'CALL') sfx.playPhoneDial();
          else if (data.skill.details?.action === 'END_CALL') sfx.playPhoneHangup();
        } else if (data.skill.name === 'phone_message') {
          sfx.playSmsNotification();
        } else if (data.skill.name === 'phone_flashlight') {
          sfx.playTorchClick();
        } else if (data.skill.name === 'phone_locator') {
          if (data.skill.details?.isRinging) sfx.playPhoneRinging();
          else sfx.playHudTick();
        } else if (data.skill.name === 'phone_timer') {
          sfx.playConfirmation();
        } else {
          sfx.playConfirmation();
        }
      }

      if (data.telemetry?.defenseProtocol) {
        const mode = data.telemetry.defenseProtocol as ProtocolMode;
        if (['STANDBY', 'ACTIVE', 'STEALTH', 'OVERCLOCK'].includes(mode)) {
          setProtocol(mode);
        }
      }

      setState('SPEAKING');
      setSubtitle(data.reply);
      sfx.speak(
        data.reply,
        () => setState('SPEAKING'),
        () => {
           setState('IDLE');
           setTimeout(() => setSubtitle(''), 3000);
        }
      );
    } catch (error) {
      console.warn('[JARVIS Neural Array Notice]', error);
      const fallbackReply = 'All mobile cellular nodes and arc reactor subsystems operational, Sir. Standing by for your directive.';
      setState('SPEAKING');
      setSubtitle(fallbackReply);
      sfx.speak(
        fallbackReply,
        () => setState('SPEAKING'),
        () => {
           setState('IDLE');
           setTimeout(() => setSubtitle(''), 3000);
        }
      );
    }
  }, [protocol]);

  // Fallback keyboard shortcut if microphone is broken
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Ignore keydown if they are already typing in an input field
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      
      if (e.key === 'Enter') {
        e.preventDefault();
        setIsPromptOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsPromptOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptInput.trim()) {
      handleSendMessage(promptInput.trim());
      setPromptInput('');
    }
    setIsPromptOpen(false);
  };


  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setState('LISTENING');
      sfx.playActivationChime();
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        handleSendMessage(transcript.trim());
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setState('IDLE');
    };
    recognition.onend = () => {
      setIsListening(false);
      setState((prev) => (prev === 'LISTENING' ? 'IDLE' : prev));
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch (e) {}
    };
  }, [handleSendMessage]);

  const handleOrbClick = () => {
    triggerPlasmaPulse();
    if (state === 'IDLE' || state === 'LISTENING') {
      if (isListening) {
        recognitionRef.current?.stop();
        setState('IDLE');
      } else {
        try {
          recognitionRef.current?.start();
        } catch (e) {
          handleSendMessage('Jarvis, give me an updated status report on all primary systems and phone link.');
        }
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-[#090204] text-red-100 overflow-hidden select-none">
      <Background color={currentColor} pulseTrigger={pulseTrigger} />

      {phone.flashlightOn && (
        <div className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(255,245,210,0.18)_0,transparent_65%)] animate-pulse" />
      )}

      <main className="relative z-10 w-full h-screen flex items-center justify-center">
        <div className="relative flex items-center justify-center w-full h-full">
          <HUDRings state={state} protocol={protocol} color={currentColor} />
          <JarvisOrb state={state} color={currentColor} onClick={handleOrbClick} />
        </div>
      </main>

      {/* Subtitles if audio is broken */}
      {subtitle && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center z-40 pointer-events-none px-4">
          <div className="bg-black/60 backdrop-blur-md text-red-200 border border-red-500/30 px-6 py-3 rounded-2xl text-xl font-rajdhani text-center max-w-2xl shadow-[0_0_20px_rgba(255,0,0,0.2)]">
            {subtitle}
          </div>
        </div>
      )}

      {/* Manual Override Button in case Enter key fails */}
      <button 
        onClick={() => setIsPromptOpen(true)}
        className="absolute bottom-6 right-6 z-40 bg-red-950/40 border border-red-500/30 text-red-400 p-3 rounded-full hover:bg-red-900/60 hover:text-red-300 hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all flex items-center justify-center group"
        title="Open Command Terminal (Enter)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"></path>
          <path d="M4 11h.01"></path>
          <path d="M8 11h.01"></path>
          <path d="M12 11h.01"></path>
          <path d="M16 11h.01"></path>
          <path d="M20 11h.01"></path>
          <path d="M8 15h8"></path>
        </svg>
      </button>

      {/* Holographic Input Modal */}
      {isPromptOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300">
          <form 
            onSubmit={handlePromptSubmit} 
            className="bg-[#0f0406] border border-red-500/50 p-8 rounded-2xl shadow-[0_0_40px_rgba(255,0,0,0.4)] w-full max-w-md transform scale-100 animate-in fade-in zoom-in-95 duration-200"
          >
            <h2 className="text-3xl font-rajdhani font-bold text-red-500 mb-2 tracking-wider">KK JARVIS</h2>
            <p className="text-red-300/80 font-mono mb-6 text-sm">Type the Jarvis commands</p>
            <input 
              autoFocus
              type="text"
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              className="w-full bg-red-950/20 border border-red-500/50 text-red-100 font-mono text-lg rounded-lg p-3 outline-none focus:border-red-400 focus:shadow-[0_0_15px_rgba(255,0,0,0.5)] transition-all mb-6"
              placeholder="_"
            />
            <div className="flex justify-end space-x-4">
              <button 
                type="button" 
                onClick={() => setIsPromptOpen(false)}
                className="px-6 py-2 rounded-lg font-mono text-red-400/80 hover:bg-red-950/50 hover:text-red-300 transition-colors"
              >
                CANCEL
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 rounded-lg font-mono bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-600/40 hover:shadow-[0_0_15px_rgba(255,0,0,0.6)] transition-all"
              >
                EXECUTE
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
