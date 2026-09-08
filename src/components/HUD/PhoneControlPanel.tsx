import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Phone,
  PhoneOff,
  PhoneCall,
  Volume2,
  VolumeX,
  Flashlight,
  FlashlightOff,
  Timer,
  Bell,
  BellRing,
  Battery,
  BatteryCharging,
  Wifi,
  Bluetooth,
  Camera,
  MapPin,
  Music,
  Send,
  Radio,
  X,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Mic,
  Keyboard,
} from 'lucide-react';
import { PhoneState, PhoneCall as PhoneCallType } from '../../types';
import { sfx } from '../../audio/sfx';

interface PhoneControlPanelProps {
  phone: PhoneState;
  onAction: (action: string, payload?: any) => void;
  onSendDirective: (text: string) => void;
  color?: string;
  onClose?: () => void;
}

export const PhoneControlPanel: React.FC<PhoneControlPanelProps> = ({
  phone,
  onAction,
  onSendDirective,
  color = '#ff1a40',
  onClose,
}) => {
  const [customContact, setCustomContact] = useState('');
  const [smsRecipient, setSmsRecipient] = useState('Pepper Potts');
  const [smsMessage, setSmsMessage] = useState('');
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [activeTab, setActiveTab] = useState<'overview' | 'calls' | 'messages' | 'apps'>('overview');

  // Local call duration counter if active
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval: any;
    if (phone.activeCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [phone.activeCall]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCall = (contact: string) => {
    sfx.playPhoneDial();
    onAction('CALL', { contact });
    onSendDirective(`Call ${contact}`);
  };

  const handleEndCall = () => {
    sfx.playPhoneHangup();
    onAction('END_CALL');
    onSendDirective('Hang up phone call');
  };

  const handleToggleFlashlight = () => {
    sfx.playTorchClick();
    const nextState = !phone.flashlightOn;
    onAction('TOGGLE_FLASHLIGHT', { state: nextState });
    onSendDirective(nextState ? 'Turn on flashlight' : 'Turn off flashlight');
  };

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsMessage.trim()) return;
    sfx.playSmsNotification();
    onSendDirective(`Text ${smsRecipient}: ${smsMessage.trim()}`);
    setSmsMessage('');
  };

  const handleStartTimer = (mins: number) => {
    sfx.playHudTick();
    onAction('SET_TIMER', { seconds: mins * 60, label: `${mins} Min Timer` });
    onSendDirective(`Set timer for ${mins} minutes`);
  };

  const handleRingPhone = () => {
    if (phone.isRinging) {
      sfx.playHudTick();
      onAction('STOP_RINGING');
      onSendDirective('Stop ringing phone');
    } else {
      sfx.playPhoneRinging();
      onAction('RING_PHONE');
      onSendDirective('Find my phone');
    }
  };

  const handleOpenApp = (app: string) => {
    sfx.playConfirmation();
    onAction('OPEN_APP', { app });
    onSendDirective(`Open ${app}`);
  };

  return (
    <div className="w-full bg-slate-950/90 border border-red-500/40 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-[0_0_50px_rgba(255,26,64,0.3)] flex flex-col gap-4 text-red-100 max-h-[85vh] overflow-y-auto font-rajdhani">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-950/80 border border-red-500/40 shadow-[0_0_15px_rgba(255,26,64,0.35)]">
            <Smartphone className="w-5 h-5 text-red-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron text-sm sm:text-base font-bold tracking-wider text-red-100">
                PHONE LINK
              </span>
            </div>
            <p className="text-xs font-tech text-red-300/70">
              {phone.deviceName}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:text-white hover:bg-red-500/20 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-tech">
        {/* Battery */}
        <div className="flex items-center justify-between p-2.5 rounded-xl border border-red-500/25 bg-slate-900/70 shadow-sm">
          <div className="flex items-center gap-2 text-red-300">
            {phone.isCharging ? (
              <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : (
              <Battery className="w-4 h-4 text-red-400" />
            )}
            <span>BATTERY</span>
          </div>
          <span className="font-bold text-red-200">{phone.batteryLevel}%</span>
        </div>

        {/* Flashlight */}
        <button
          onClick={handleToggleFlashlight}
          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
            phone.flashlightOn
              ? 'border-red-400 bg-red-950/80 text-red-100 shadow-[0_0_20px_rgba(255,26,64,0.5)]'
              : 'border-red-500/25 bg-slate-900/70 text-red-300/80 hover:border-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {phone.flashlightOn ? (
              <Flashlight className="w-4 h-4 text-amber-300 animate-pulse" />
            ) : (
              <FlashlightOff className="w-4 h-4" />
            )}
            <span>TORCH</span>
          </div>
          <span className="font-bold">{phone.flashlightOn ? 'ON' : 'OFF'}</span>
        </button>

        {/* Mute / Volume */}
        <button
          onClick={() => {
            const nextVol = phone.volume > 0 ? 0 : 75;
            onAction('SET_VOLUME', { volume: nextVol });
            onSendDirective(nextVol === 0 ? 'Mute phone' : 'Unmute phone');
          }}
          className="flex items-center justify-between p-2.5 rounded-xl border border-red-500/25 bg-slate-900/70 text-red-300/80 hover:border-red-400 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {phone.volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-red-300" />
            )}
            <span>VOLUME</span>
          </div>
          <span className="font-bold">{phone.volume}%</span>
        </button>

        {/* Locator Beacon */}
        <button
          onClick={handleRingPhone}
          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
            phone.isRinging
              ? 'border-amber-400 bg-amber-950/80 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse'
              : 'border-red-500/25 bg-slate-900/70 text-red-300/80 hover:border-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {phone.isRinging ? (
              <BellRing className="w-4 h-4 text-amber-300 animate-bounce" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            <span>FIND PHONE</span>
          </div>
          <span className="font-bold">{phone.isRinging ? 'RINGING' : 'READY'}</span>
        </button>
      </div>

      {/* Flashlight Active Projection Visualizer */}
      {phone.flashlightOn && (
        <div className="p-3 rounded-xl border border-amber-400/60 bg-gradient-to-r from-amber-950/60 via-amber-500/20 to-amber-950/60 flex items-center justify-between shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-pulse">
          <div className="flex items-center gap-2 text-amber-200 font-tech text-xs">
            <Flashlight className="w-4 h-4 text-amber-300" />
            <span>PHONE HIGH-INTENSITY TORCH BEAM PROJECTING</span>
          </div>
          <button
            onClick={handleToggleFlashlight}
            className="px-2.5 py-1 text-[11px] font-tech font-bold rounded-lg border border-amber-400/60 bg-amber-950 hover:bg-amber-900 text-amber-100 cursor-pointer"
          >
            EXTINGUISH
          </button>
        </div>
      )}

      {/* Ringing Phone Locator Banner */}
      {phone.isRinging && (
        <div className="p-3 rounded-xl border border-red-400 bg-red-950/90 flex items-center justify-between shadow-[0_0_35px_rgba(255,26,64,0.6)] animate-pulse">
          <div className="flex items-center gap-2.5">
            <BellRing className="w-5 h-5 text-red-400 animate-bounce" />
            <div>
              <p className="font-orbitron text-xs font-bold text-red-200">
                LOCATOR BEACON EMITTING (98 dB)
              </p>
              <p className="text-[10px] font-tech text-red-300/80">{phone.ringLocation}</p>
            </div>
          </div>
          <button
            onClick={handleRingPhone}
            className="px-3 py-1 text-xs font-tech font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white shadow-md cursor-pointer"
          >
            SILENCE BEACON
          </button>
        </div>
      )}

      {/* ACTIVE CALL CARD */}
      {phone.activeCall && (
        <div className="p-4 rounded-xl border-2 border-red-400 bg-red-950/80 shadow-[0_0_35px_rgba(255,26,64,0.5)] flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-red-400 bg-red-900/60 flex items-center justify-center text-red-200 font-bold text-sm shadow-[0_0_15px_rgba(255,26,64,0.4)]">
                {phone.activeCall.contact.charAt(0)}
              </div>
              <div>
                <p className="font-orbitron text-sm font-bold text-white">
                  {phone.activeCall.contact}
                </p>
                <p className="text-xs font-tech text-red-300/80">
                  {phone.activeCall.number} // SECURE LINE
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-200">
                <Radio className="w-3.5 h-3.5 text-red-400 animate-spin" />
                <span>{formatTime(callDuration)}</span>
              </div>
              <span className="text-[10px] font-tech text-emerald-400 uppercase tracking-wider font-bold">
                CONNECTED
              </span>
            </div>
          </div>

          {/* Active Call Audio Waveform Simulation */}
          <div className="flex items-center justify-center gap-1 h-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-red-400 animate-pulse"
                style={{
                  height: `${Math.max(4, Math.sin((i + callDuration) * 0.8) * 20 + 8)}px`,
                  animationDuration: `${0.3 + (i % 5) * 0.1}s`,
                }}
              />
            ))}
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-3 pt-2 border-t border-red-500/20">
            <button
              onClick={() => {
                sfx.playHudTick();
                onSendDirective('Mute phone call');
              }}
              className="p-2 rounded-full border border-red-500/40 bg-slate-900/80 hover:bg-red-500/20 text-red-300 cursor-pointer"
              title="Mute Micro"
            >
              <VolumeX className="w-4 h-4" />
            </button>
            <button
              onClick={handleEndCall}
              className="px-6 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-tech font-bold tracking-wider text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(255,26,64,0.7)] cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>END CALL</span>
            </button>
            <button
              onClick={() => {
                sfx.playHudTick();
                onSendDirective('Toggle speakerphone');
              }}
              className="p-2 rounded-full border border-red-500/40 bg-slate-900/80 hover:bg-red-500/20 text-red-300 cursor-pointer"
              title="Speaker Mode"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE TIMER CARD */}
      {phone.activeTimer && (
        <div className="p-3 rounded-xl border border-red-500/40 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Timer className="w-5 h-5 text-red-400 animate-spin-slow" />
            <div>
              <p className="font-orbitron text-xs font-bold text-red-200">
                {phone.activeTimer.label}
              </p>
              <p className="text-[10px] font-tech text-red-400/80">RUNNING COUNTDOWN</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-red-200">
              {formatTime(phone.activeTimer.totalSeconds)}
            </span>
            <button
              onClick={() => {
                sfx.playHudTick();
                onAction('CANCEL_TIMER');
                onSendDirective('Cancel timer');
              }}
              className="p-1 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/20 text-xs cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE APP LAUNCHED VIEWER */}
      {phone.activeApp && (
        <div className="p-4 rounded-xl border border-red-400/60 bg-slate-950/90 flex flex-col gap-3 shadow-[0_0_25px_rgba(255,26,64,0.35)]">
          <div className="flex items-center justify-between border-b border-red-500/30 pb-2">
            <div className="flex items-center gap-2">
              {phone.activeApp === 'camera' && <Camera className="w-4 h-4 text-red-400" />}
              {phone.activeApp === 'maps' && <MapPin className="w-4 h-4 text-red-400" />}
              {phone.activeApp === 'music' && <Music className="w-4 h-4 text-red-400" />}
              <span className="font-orbitron text-xs font-bold text-red-200 uppercase">
                {phone.activeApp === 'camera' && 'PHONE OPTICAL SENSOR // CAMERA'}
                {phone.activeApp === 'maps' && 'STARK SATELLITE GPS // MAPS'}
                {phone.activeApp === 'music' && 'MEDIA PLAYER // STARK SOUNDTRACK'}
              </span>
            </div>
            <button
              onClick={() => {
                sfx.playHudTick();
                onAction('CLOSE_APP');
                onSendDirective('Close phone app');
              }}
              className="text-xs font-tech text-red-400 hover:text-white cursor-pointer"
            >
              CLOSE APP
            </button>
          </div>

          {/* Camera Viewfinder Preview */}
          {phone.activeApp === 'camera' && (
            <div className="relative h-40 bg-black/80 rounded-lg border border-red-500/30 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-4 border border-dashed border-red-500/40 rounded pointer-events-none" />
              <div className="absolute w-12 h-12 border-2 border-red-400 rounded-full animate-ping opacity-30" />
              <div className="text-center font-tech text-xs text-red-300">
                <Camera className="w-8 h-8 mx-auto mb-1 text-red-400/80 animate-pulse" />
                <p className="font-bold">4K 60FPS OPTICAL FEED // ACTIVE</p>
                <p className="text-[10px] text-red-400/60">ISO 100 // 1/2000s // f/1.8</p>
              </div>
              <button
                onClick={() => {
                  sfx.playConfirmation();
                  onSendDirective('Take photo with phone');
                }}
                className="absolute bottom-2 right-2 px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-tech text-[10px] font-bold shadow-md cursor-pointer"
              >
                CAPTURE PHOTO
              </button>
            </div>
          )}

          {/* Maps GPS Preview */}
          {phone.activeApp === 'maps' && (
            <div className="relative h-40 bg-slate-900 rounded-lg border border-red-500/30 p-3 overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,26,64,0.15)_0,transparent_70%)] pointer-events-none" />
              <div className="flex items-center justify-between text-[11px] font-tech text-red-300">
                <span>GPS LOCK: 34.0259° N, 118.7798° W</span>
                <span className="text-emerald-400 font-bold">12 SATELLITES</span>
              </div>
              <div className="flex flex-col items-center justify-center my-auto">
                <MapPin className="w-6 h-6 text-red-400 animate-bounce" />
                <p className="font-orbitron text-xs font-bold text-white mt-1">MALIBU POINT 10880</p>
                <p className="text-[10px] font-tech text-red-300/70">Traffic: Nominal // ETA: Instant</p>
              </div>
              <div className="flex justify-between items-center text-[10px] font-tech text-red-400/80">
                <span>STARK NAV-LINK</span>
                <span>HUD SYNCED</span>
              </div>
            </div>
          )}

          {/* Music Player Preview */}
          {phone.activeApp === 'music' && (
            <div className="p-3 bg-slate-900 rounded-lg border border-red-500/30 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-red-950 border border-red-500/50 flex items-center justify-center text-red-400">
                  <Music className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <p className="font-orbitron text-xs font-bold text-white">Back In Black</p>
                  <p className="text-xs font-tech text-red-300">AC/DC // Iron Man Soundtrack</p>
                  <p className="text-[10px] font-mono text-red-400/70">01:24 / 04:15</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 pt-1">
                <button
                  onClick={() => {
                    sfx.playHudTick();
                    onSendDirective('Play previous song on phone');
                  }}
                  className="text-red-400 hover:text-white text-xs font-tech cursor-pointer"
                >
                  PREV
                </button>
                <button
                  onClick={() => {
                    sfx.playConfirmation();
                    onSendDirective('Toggle music pause on phone');
                  }}
                  className="p-2 rounded-full bg-red-600 text-white hover:bg-red-500 shadow-md cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    sfx.playHudTick();
                    onSendDirective('Play next song on phone');
                  }}
                  className="text-red-400 hover:text-white text-xs font-tech cursor-pointer"
                >
                  NEXT
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Tabs for Controls */}
      <div className="flex border-b border-red-500/20 gap-1 text-xs font-tech">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 border-b-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'border-red-400 text-white bg-red-500/10'
              : 'border-transparent text-red-400/70 hover:text-red-200'
          }`}
        >
          QUICK DIRECTIVES
        </button>
        <button
          onClick={() => setActiveTab('calls')}
          className={`px-3 py-1.5 border-b-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'calls'
              ? 'border-red-400 text-white bg-red-500/10'
              : 'border-transparent text-red-400/70 hover:text-red-200'
          }`}
        >
          SPEED DIAL
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-3 py-1.5 border-b-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'messages'
              ? 'border-red-400 text-white bg-red-500/10'
              : 'border-transparent text-red-400/70 hover:text-red-200'
          }`}
        >
          ENCRYPTED SMS
        </button>
        <button
          onClick={() => setActiveTab('apps')}
          className={`px-3 py-1.5 border-b-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'apps'
              ? 'border-red-400 text-white bg-red-500/10'
              : 'border-transparent text-red-400/70 hover:text-red-200'
          }`}
        >
          PHONE APPS
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ONE-TOUCH DIRECTIVES */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-tech text-red-300/80">
            Select a phone control directive or speak/type naturally to JARVIS:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => handleCall('Pepper Potts')}
              className="p-2.5 rounded-xl border border-red-500/30 bg-red-950/40 hover:bg-red-500/20 hover:border-red-400 flex items-center gap-2 text-left transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <p className="font-orbitron text-[11px] font-bold">Call Pepper</p>
                <p className="text-[9px] font-tech text-red-400/70">Secure Mobile</p>
              </div>
            </button>

            <button
              onClick={() => handleCall('Rhodey')}
              className="p-2.5 rounded-xl border border-red-500/30 bg-red-950/40 hover:bg-red-500/20 hover:border-red-400 flex items-center gap-2 text-left transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <p className="font-orbitron text-[11px] font-bold">Call Rhodey</p>
                <p className="text-[9px] font-tech text-red-400/70">War Machine Link</p>
              </div>
            </button>

            <button
              onClick={handleToggleFlashlight}
              className="p-2.5 rounded-xl border border-red-500/30 bg-red-950/40 hover:bg-red-500/20 hover:border-red-400 flex items-center gap-2 text-left transition-all cursor-pointer"
            >
              <Flashlight className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <p className="font-orbitron text-[11px] font-bold">Torch Toggle</p>
                <p className="text-[9px] font-tech text-red-400/70">High Lumens</p>
              </div>
            </button>

            <button
              onClick={() => handleStartTimer(5)}
              className="p-2.5 rounded-xl border border-red-500/30 bg-red-950/40 hover:bg-red-500/20 hover:border-red-400 flex items-center gap-2 text-left transition-all cursor-pointer"
            >
              <Timer className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <p className="font-orbitron text-[11px] font-bold">5 Min Timer</p>
                <p className="text-[9px] font-tech text-red-400/70">Phone Alarm</p>
              </div>
            </button>

            <button
              onClick={() => handleOpenApp('camera')}
              className="p-2.5 rounded-xl border border-red-500/30 bg-red-950/40 hover:bg-red-500/20 hover:border-red-400 flex items-center gap-2 text-left transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <p className="font-orbitron text-[11px] font-bold">Launch Camera</p>
                <p className="text-[9px] font-tech text-red-400/70">Optical Viewfinder</p>
              </div>
            </button>

            <button
              onClick={handleRingPhone}
              className="p-2.5 rounded-xl border border-red-500/30 bg-red-950/40 hover:bg-red-500/20 hover:border-red-400 flex items-center gap-2 text-left transition-all cursor-pointer"
            >
              <BellRing className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <p className="font-orbitron text-[11px] font-bold">Ring Phone</p>
                <p className="text-[9px] font-tech text-red-400/70">Acoustic Beacon</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: SPEED DIAL & CUSTOM CALL */}
      {activeTab === 'calls' && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { name: 'Pepper Potts', desc: 'CEO, Stark Industries', num: '+1 (310) 555-0142' },
              { name: 'Col. James Rhodes', desc: 'War Machine', num: '+1 (202) 555-0198' },
              { name: 'Happy Hogan', desc: 'Head of Asset Management', num: '+1 (212) 555-0122' },
            ].map((contact, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-red-500/25 bg-slate-900/60 flex flex-col justify-between gap-2"
              >
                <div>
                  <p className="font-orbitron text-xs font-bold text-white">{contact.name}</p>
                  <p className="text-[10px] font-tech text-red-300/70">{contact.desc}</p>
                  <p className="text-[10px] font-mono text-red-400/80">{contact.num}</p>
                </div>
                <button
                  onClick={() => handleCall(contact.name)}
                  className="w-full py-1.5 rounded-lg border border-red-500/40 bg-red-950/60 hover:bg-red-600 hover:text-white text-red-200 font-tech font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>DIAL CONTACT</span>
                </button>
              </div>
            ))}
          </div>

          {/* Custom Dial input */}
          <div className="flex gap-2 pt-2 border-t border-red-500/20">
            <input
              type="text"
              placeholder="Or enter custom name or number (e.g. Tony Stark, Mom)..."
              value={customContact}
              onChange={(e) => setCustomContact(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customContact.trim()) {
                  handleCall(customContact.trim());
                  setCustomContact('');
                }
              }}
              className="flex-1 px-3 py-2 rounded-xl border border-red-500/30 bg-slate-900/80 text-xs font-tech text-red-100 focus:outline-none focus:border-red-400"
            />
            <button
              onClick={() => {
                if (customContact.trim()) {
                  handleCall(customContact.trim());
                  setCustomContact('');
                }
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-tech font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>CALL</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: ENCRYPTED SMS */}
      {activeTab === 'messages' && (
        <form onSubmit={handleSendSms} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-tech text-red-400/70 block mb-1">RECIPIENT</label>
              <input
                type="text"
                value={smsRecipient}
                onChange={(e) => setSmsRecipient(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-red-500/30 bg-slate-900/80 text-xs font-tech text-red-100 focus:outline-none focus:border-red-400"
              />
            </div>
            <div className="w-32">
              <label className="text-[10px] font-tech text-red-400/70 block mb-1">SECURITY</label>
              <div className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-slate-900/80 text-[10px] font-tech text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>256-BIT AES</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-tech text-red-400/70 block mb-1">MESSAGE CONTENT</label>
            <textarea
              rows={3}
              placeholder="Type message text to transmit via phone cellular network..."
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-red-500/30 bg-slate-900/80 text-xs font-rajdhani text-red-100 focus:outline-none focus:border-red-400 resize-none"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] font-tech text-red-400/60">
              UPLINK: ENCRYPTED STARK SATELLITE RELAY
            </span>
            <button
              type="submit"
              disabled={!smsMessage.trim()}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-tech font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(255,26,64,0.5)] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>TRANSMIT SMS</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: PHONE APPS LAUNCHER */}
      {activeTab === 'apps' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleOpenApp('camera')}
            className="p-3 rounded-xl border border-red-500/30 bg-slate-900/70 hover:bg-red-500/20 hover:border-red-400 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
          >
            <Camera className="w-6 h-6 text-red-400" />
            <span className="font-orbitron text-xs font-bold text-white">Camera</span>
            <span className="text-[9px] font-tech text-red-300/70">4K Optical Feed</span>
          </button>

          <button
            onClick={() => handleOpenApp('maps')}
            className="p-3 rounded-xl border border-red-500/30 bg-slate-900/70 hover:bg-red-500/20 hover:border-red-400 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
          >
            <MapPin className="w-6 h-6 text-red-400" />
            <span className="font-orbitron text-xs font-bold text-white">Maps</span>
            <span className="text-[9px] font-tech text-red-300/70">GPS Telemetry</span>
          </button>

          <button
            onClick={() => handleOpenApp('music')}
            className="p-3 rounded-xl border border-red-500/30 bg-slate-900/70 hover:bg-red-500/20 hover:border-red-400 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
          >
            <Music className="w-6 h-6 text-red-400" />
            <span className="font-orbitron text-xs font-bold text-white">Music</span>
            <span className="text-[9px] font-tech text-red-300/70">Media Player</span>
          </button>

          <button
            onClick={() => {
              sfx.playConfirmation();
              onAction('OPEN_APP', { app: 'settings' });
              onSendDirective('Open phone settings');
            }}
            className="p-3 rounded-xl border border-red-500/30 bg-slate-900/70 hover:bg-red-500/20 hover:border-red-400 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
          >
            <Smartphone className="w-6 h-6 text-red-400" />
            <span className="font-orbitron text-xs font-bold text-white">Settings</span>
            <span className="text-[9px] font-tech text-red-300/70">Handset Config</span>
          </button>
        </div>
      )}
    </div>
  );
};
