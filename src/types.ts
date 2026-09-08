export type AssistantState = 'IDLE' | 'LISTENING' | 'COMPUTING' | 'SPEAKING';

export type ProtocolMode = 'STANDBY' | 'ACTIVE' | 'STEALTH' | 'OVERCLOCK';

export interface TelemetryData {
  reactorOutput: number;
  coreTemperature: number;
  neuralSync: number;
  defenseProtocol: string;
  ambientNoise: number;
  activeThreads: number;
  networkLatency: number;
  smartHome: {
    lights: boolean;
    lightColor: string;
    thermostat: number;
    perimeterSecurity: string;
    blastDoors: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
  timestamp: string;
  skill?: {
    name: string;
    details: any;
  } | null;
}

export interface VoiceCommandLog {
  id: string;
  timestamp: string;
  rawCommand: string;
  keywords: string[];
  status: 'PROCESSED' | 'EXECUTED' | 'STANDBY' | 'FAILED';
  protocol: ProtocolMode;
}

export interface SkillItem {
  id: string;
  title: string;
  command: string;
  category: 'system' | 'defense' | 'environment' | 'schedule' | 'phone';
  icon: string;
}

export interface PhoneCall {
  contact: string;
  number: string;
  duration: number; // in seconds
  status: 'DIALING' | 'CONNECTED' | 'MUTED' | 'ENDED';
  isSpeaker: boolean;
  avatar?: string;
}

export interface PhoneMessage {
  id: string;
  contact: string;
  text: string;
  timestamp: string;
  isIncoming: boolean;
  delivered: boolean;
}

export interface PhoneTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

export interface PhoneState {
  connected: boolean;
  deviceName: string;
  batteryLevel: number;
  isCharging: boolean;
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  flashlightOn: boolean;
  dndEnabled: boolean;
  volume: number; // 0 to 100
  isRinging: boolean; // phone finder
  ringLocation?: string;
  activeCall: PhoneCall | null;
  activeTimer: PhoneTimer | null;
  messages: PhoneMessage[];
  activeApp: 'camera' | 'maps' | 'music' | 'messages' | 'phone' | 'settings' | null;
}

