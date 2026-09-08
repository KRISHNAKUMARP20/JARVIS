import { ProtocolMode, VoiceCommandLog } from '../types';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during',
  'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'jarvis', 'just',
  'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'now',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'please',
  'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up',
  'very',
  'was', 'we', 'were', 'what', 'whats', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would',
  'you', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Extracts high-value telemetry and semantic intent keywords from voice commands.
 */
export function extractCommandKeywords(command: string): string[] {
  if (!command || !command.trim()) return ['NULL_OP'];

  const lower = command.toLowerCase();
  const keywords: string[] = [];

  // Domain-specific intent tagging
  if (lower.includes('reactor') || lower.includes('arc') || lower.includes('power') || lower.includes('energy')) {
    keywords.push('ARC_REACTOR');
  }
  if (lower.includes('temp') || lower.includes('heat') || lower.includes('cool') || lower.includes('thermal')) {
    keywords.push('THERMAL_REGULATION');
  }
  if (lower.includes('protocol') || lower.includes('stealth') || lower.includes('overclock') || lower.includes('defense') || lower.includes('standby')) {
    keywords.push('DEFENSE_PROTOCOL');
  }
  if (lower.includes('light') || lower.includes('lights') || lower.includes('habitat') || lower.includes('home')) {
    keywords.push('SMART_HABITAT');
  }
  if (lower.includes('status') || lower.includes('report') || lower.includes('diagnostic') || lower.includes('telemetry') || lower.includes('check')) {
    keywords.push('DIAGNOSTIC_QUERY');
  }
  if (lower.includes('security') || lower.includes('perimeter') || lower.includes('door') || lower.includes('lock') || lower.includes('threat')) {
    keywords.push('PERIMETER_DEFENSE');
  }
  if (lower.includes('audio') || lower.includes('mute') || lower.includes('sound') || lower.includes('volume')) {
    keywords.push('ACOUSTIC_SYS');
  }
  if (lower.includes('call') || lower.includes('dial') || lower.includes('phone') || lower.includes('hang up')) {
    keywords.push('CELLULAR_UPLINK');
  }
  if (lower.includes('text') || lower.includes('sms') || lower.includes('message')) {
    keywords.push('SMS_DISPATCH');
  }
  if (lower.includes('torch') || lower.includes('flashlight')) {
    keywords.push('DEVICE_TORCH');
  }
  if (lower.includes('timer') || lower.includes('alarm') || lower.includes('countdown')) {
    keywords.push('CHRONO_ALARM');
  }
  if (lower.includes('find') || lower.includes('where') || lower.includes('ring') || lower.includes('locate')) {
    keywords.push('DEVICE_LOCATOR');
  }
  if (lower.includes('camera') || lower.includes('map') || lower.includes('maps') || lower.includes('music') || lower.includes('spotify') || lower.includes('app')) {
    keywords.push('APP_SUBSYSTEM');
  }
  if (lower.includes('battery') || lower.includes('charge')) {
    keywords.push('BATTERY_POWER');
  }

  // Tokenize words, strip punctuation
  const cleanWords = lower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  for (const word of cleanWords) {
    const upper = word.toUpperCase();
    if (!keywords.includes(upper)) {
      keywords.push(upper);
    }
  }

  return keywords.slice(0, 5);
}

/**
 * Generates ISO high-precision millisecond timestamp for terminal logs.
 */
export function formatTerminalTimestamp(date: Date = new Date()): string {
  const pad = (n: number, z = 2) => ('00' + n).slice(-z);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

/**
 * Initial boot system logs for authentic holographic HUD terminal output.
 */
export function getInitialSystemLogs(): VoiceCommandLog[] {
  const now = Date.now();
  return [
    {
      id: 'sys-boot-1',
      timestamp: formatTerminalTimestamp(new Date(now - 15400)),
      rawCommand: '[KERNEL_BOOT] Initializing Stark Industries Mark-85 Neural Engine',
      keywords: ['KERNEL_BOOT', 'NEURAL_ENGINE', 'ARC_REACTOR'],
      status: 'EXECUTED',
      protocol: 'STANDBY',
    },
    {
      id: 'sys-boot-2',
      timestamp: formatTerminalTimestamp(new Date(now - 8200)),
      rawCommand: '[VOICE_BUS] Calibrating directional microphone array & neural acoustic filter',
      keywords: ['VOICE_BUS', 'ACOUSTIC_SYS', 'CALIBRATION'],
      status: 'EXECUTED',
      protocol: 'STANDBY',
    },
    {
      id: 'sys-boot-3',
      timestamp: formatTerminalTimestamp(new Date(now - 2100)),
      rawCommand: '[QUANTUM_LINK] Synaptic handshake established. Standing by for directive.',
      keywords: ['QUANTUM_LINK', 'SYNAPSE', 'DIAGNOSTIC_QUERY'],
      status: 'EXECUTED',
      protocol: 'STANDBY',
    },
  ];
}
