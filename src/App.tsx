import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AssistantState, ProtocolMode, PhoneState } from './types';
import { Background } from './components/Layout/Background';
import { JarvisOrb } from './components/Orb/JarvisOrb';
import { HUDRings } from './components/HUD/HUDRings';
import { TelemetryPanel } from './components/HUD/TelemetryPanel';
import { RadarWidget } from './components/HUD/RadarWidget';
import { AudioVisualizer } from './components/HUD/AudioVisualizer';
import { Header } from './components/Layout/Header';
import { ParticleOverlay } from './components/Layout/ParticleOverlay';
import { DiagnosticsTerminal } from './components/HUD/DiagnosticsTerminal';
import { ScanningLaser } from './components/Layout/ScanningLaser';
import { AppDrawer } from './components/Phone/AppDrawer';
import { sfx } from './audio/sfx';

export default function App() {
  const [state, setState] = useState<AssistantState>('IDLE');
  const [protocol, setProtocol] = useState<ProtocolMode>('STANDBY');
  const [subtitle, setSubtitle] = useState('');
  const [promptInput, setPromptInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
  const [playBgm, setPlayBgm] = useState(false);
  
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

  const getProtocolColor = (mode: ProtocolMode) => {
    switch (mode) {
      case 'ACTIVE': return '#ff1a40'; // Red
      case 'STEALTH': return '#4ade80'; // Green
      case 'OVERCLOCK': return '#ff8c00'; // Orange
      case 'STANDBY':
      default: return '#00bfff'; // Cyan Blue
    }
  };

  const currentColor = getProtocolColor(protocol);
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
        } else if (data.skill.name === 'play_tamil_bgm') {
          setPlayBgm(true);
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
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      
      if (e.key === 'Enter') {
        e.preventDefault();
        // Focus the input box if they press Enter outside of it
        const input = document.getElementById('jarvis-input');
        if (input) input.focus();
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
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-[#090204] text-cyan-100 overflow-hidden select-none animate-boot-sequence">
      <Background color={currentColor} pulseTrigger={pulseTrigger} />
      <ParticleOverlay color={currentColor} />
      <Header color={currentColor} />

      {playBgm && (
        <audio 
          autoPlay 
          src="/rolex.mp3" 
          className="hidden"
          onEnded={() => setPlayBgm(false)}
        />
      )}

      {phone.flashlightOn && (
        <div className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(255,245,210,0.18)_0,transparent_65%)] animate-pulse" />
      )}

      <main className="relative z-10 w-full h-screen flex items-center justify-center">
        <ScanningLaser color={currentColor} />
        <DiagnosticsTerminal color={currentColor} />
        <TelemetryPanel color={currentColor} />
        <RadarWidget color={currentColor} />
        <div className="relative flex items-center justify-center w-full h-full">
          <HUDRings state={state} protocol={protocol} color={currentColor} />
          <JarvisOrb state={state} color={currentColor} onClick={handleOrbClick} />
        </div>
        <AudioVisualizer color={currentColor} state={state} />
      </main>

      <AppDrawer 
        isOpen={isAppDrawerOpen} 
        onClose={() => setIsAppDrawerOpen(false)} 
        color={currentColor}
        onLaunchApp={(appName) => {
          handleSendMessage(`Opening ${appName} app...`);
        }}
      />

      <div className="absolute top-8 left-8 z-50">
        <button 
          onClick={() => setIsAppDrawerOpen(true)}
          className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-2xl flex items-center justify-center border hover:scale-105 transition-transform"
          style={{ borderColor: `${currentColor}40`, color: currentColor }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </button>
      </div>

      {/* Subtitles if audio is broken */}
      {subtitle && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center z-40 pointer-events-none px-4">
          <div className="bg-black/60 backdrop-blur-md text-cyan-200 border border-cyan-500/30 px-6 py-3 rounded-2xl text-xl font-rajdhani text-center max-w-2xl shadow-[0_0_20px_rgba(0,191,255,0.2)]">
            {subtitle}
          </div>
        </div>
      )}      {/* Persistent Chat Input Box */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-auto flex justify-center">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,191,255,0.2)]"
            style={{ borderColor: `${currentColor}66`, color: currentColor }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        ) : (
          <form 
            onSubmit={handlePromptSubmit} 
            className="w-full bg-black/60 backdrop-blur-md border p-1.5 rounded-full shadow-[0_0_15px_rgba(0,191,255,0.2)] flex gap-2 items-center animate-in zoom-in-95 duration-200"
            style={{ borderColor: `${currentColor}40` }}
          >
            <button 
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="pl-4 opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: currentColor }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <input 
              id="jarvis-input"
              type="text"
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              className="flex-1 bg-transparent border-none font-mono text-sm rounded-lg py-2 px-1 outline-none placeholder:text-cyan-900/60"
              style={{ color: currentColor }}
              placeholder="Type command..."
              autoFocus
            />
            <button 
              type="submit" 
              className="px-4 py-1.5 mr-1 rounded-full font-rajdhani font-bold text-sm tracking-widest transition-all"
              style={{ color: currentColor, borderColor: `${currentColor}66`, backgroundColor: `${currentColor}22` }}
            >
              SEND
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
