import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// System Telemetry Mock State
let telemetry = {
  reactorOutput: 94.8, // %
  coreTemperature: 34.2, // °C
  neuralSync: 99.4, // %
  defenseProtocol: "STANDBY",
  ambientNoise: -42, // dB
  activeThreads: 128,
  networkLatency: 8, // ms
  smartHome: {
    lights: true,
    lightColor: "#ff1a40",
    thermostat: 21.5,
    perimeterSecurity: "ARMED",
    blastDoors: "UNLOCKED",
  },
};

// Phone Link Telemetry State
let phoneTelemetry = {
  connected: true,
  deviceName: "STARK-PHONE-MK85",
  batteryLevel: 88,
  isCharging: true,
  wifiEnabled: true,
  bluetoothEnabled: true,
  flashlightOn: false,
  dndEnabled: false,
  volume: 75,
  isRinging: false,
  ringLocation: "Malibu Workshop, Sector 4 (GPS: 34.0259° N, 118.7798° W)",
  activeCall: null as null | {
    contact: string;
    number: string;
    duration: number;
    status: string;
    isSpeaker: boolean;
  },
  activeTimer: null as null | {
    label: string;
    totalSeconds: number;
    remainingSeconds: number;
    isRunning: boolean;
  },
  activeApp: null as null | string,
  lastSms: null as null | {
    contact: string;
    text: string;
    timestamp: string;
  },
};

// Skill execution helper
function handleSkillCommand(prompt: string): {
  executed: boolean;
  skillName?: string;
  details?: any;
  voiceNote?: string;
} {
  const p = prompt.toLowerCase().trim();

  // --- EASTER EGGS ---
  if (p.includes("play bgm") || p.includes("start bgm") || p.includes("play music") || p.includes("hello")) {
    return {
      executed: true,
      skillName: "easter_egg",
      details: { action: "PLAY_BGM", track: "rolex" },
      voiceNote: "Queuing the BGM, as requested. Setting volume to maximum.",
    };
  }

  if (p.includes("stop bgm") || p.includes("stop music") || p.includes("pause bgm") || p.includes("pause music")) {
    return {
      executed: true,
      skillName: "easter_egg",
      details: { action: "STOP_BGM" },
      voiceNote: "Stopping the background music, Sir.",
    };
  }

  // --- PHONE CONTROL SKILLS ---
  // 1. Phone Call: "call pepper", "dial rhodey", "call mom", "hang up", "end call"
  if (p.includes("hang up") || p.includes("end call") || p.includes("disconnect call") || p.includes("stop call")) {
    const prevContact = phoneTelemetry.activeCall?.contact || "Call";
    phoneTelemetry.activeCall = null;
    return {
      executed: true,
      skillName: "phone_call",
      details: { action: "END_CALL" },
      voiceNote: `Terminating the cellular uplink with ${prevContact}, Sir. Line closed.`,
    };
  }

  if (p.startsWith("call ") || p.startsWith("dial ") || p.includes("make a call to ") || p.includes("call to ") || p.startsWith("phone ")) {
    let contact = p
      .replace(/^(jarvis\s+)?(please\s+)?(call|dial|phone|make a call to|call to)\s+/i, "")
      .replace(/[?.!]+$/, "")
      .trim();

    if (!contact) contact = "Pepper Potts";
    
    // Check if the contact is actually a phone number (e.g. "9876543210")
    const isNumeric = /^[\d\s\-\+\(\)]+$/.test(contact);
    
    let parsedNumber = "+1 (555) 0188"; // fallback
    if (isNumeric) {
      parsedNumber = contact.replace(/[^0-9+]/g, '');
    } else if (contact.toLowerCase().includes("pepper")) {
      parsedNumber = "+1 (310) 555-0142";
    } else if (contact.toLowerCase().includes("rhodey")) {
      parsedNumber = "+1 (202) 555-0198";
    } else if (contact.toLowerCase().includes("tony")) {
      parsedNumber = "+1 (212) 555-0100";
    }

    // Title Case contact if not numeric
    if (!isNumeric) {
      contact = contact
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }

    phoneTelemetry.activeCall = {
      contact,
      number: parsedNumber,
      duration: 0,
      status: "DIALING",
      isSpeaker: true,
    };

    return {
      executed: true,
      skillName: "phone_call",
      details: { action: "CALL", contact, number: parsedNumber, status: "DIALING" },
      voiceNote: `Establishing secure cellular uplink to ${contact} now, Sir. Routing audio through your audio transceiver.`,
    };
  }

  // 2. Text / SMS & WhatsApp: "whatsapp pepper I'll be in the workshop", "send text to Rhodey: armor is ready"
  // Make sure to ignore "opening whatsapp app" so it can be handled by the app launcher
  const isOpeningApp = p.includes("open") || p.includes("launch") || p.includes("play");
  
  if (!isOpeningApp && (p.includes("text ") || p.includes("send text") || p.includes("send message") || p.includes("sms ") || p.includes("whatsapp") || p.includes("chat"))) {
    let contact = "Pepper Potts";
    let messageText = "On my way to the workshop, Sir.";
    let isWhatsapp = p.includes("whatsapp") || p.includes("chat");

    const textMatch = p.match(/(?:send\s+(?:a\s+)?(?:text|message|sms|whatsapp)(?:\s+message)?(?:\s+to)?|text|sms|whatsapp|chat(?:\s+to)?)\s+([a-zA-Z\s]+?)(?::|\s+saying|\s+that|\s+message)?\s+(.+)$/i);
    if (textMatch && textMatch[1] && textMatch[2]) {
      contact = textMatch[1].trim();
      contact = contact.charAt(0).toUpperCase() + contact.slice(1);
      messageText = textMatch[2].trim();
    } else {
      // Fallback extraction
      const parts = p.split(/(?:to\s+|:\s*)/i);
      if (parts.length > 1) {
        contact = parts[1].split(" ")[0];
        contact = contact.charAt(0).toUpperCase() + contact.slice(1);
      }
    }
    
    // Hardcoded phone numbers for reliable ADB intents
    let parsedNumber = "+15550188000"; // fallback
    if (contact.toLowerCase().includes("pepper")) {
      parsedNumber = "+13105550142";
    } else if (contact.toLowerCase().includes("rhodey")) {
      parsedNumber = "+12025550198";
    } else if (contact.toLowerCase().includes("tony")) {
      parsedNumber = "+12125550100";
    } else if (contact.toLowerCase().includes("friend")) {
      parsedNumber = "+15551234567"; // dummy friend number
    }

    phoneTelemetry.lastSms = {
      contact,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    return {
      executed: true,
      skillName: isWhatsapp ? "phone_whatsapp" : "phone_message",
      details: { action: isWhatsapp ? "SEND_WHATSAPP" : "SEND_SMS", contact, text: messageText, number: parsedNumber },
      voiceNote: isWhatsapp 
        ? `Drafting WhatsApp message to ${contact}, Sir: "${messageText}".`
        : `Encrypted text message dispatched to ${contact}, Sir: "${messageText}".`,
    };
  }

  // 3. Flashlight / Torch: "turn on flashlight", "torch off", "flashlight"
  if (p.includes("flashlight") || p.includes("torch")) {
    const shouldTurnOff = p.includes("off") || p.includes("disable") || p.includes("stop");
    phoneTelemetry.flashlightOn = shouldTurnOff ? false : p.includes("on") || p.includes("enable") ? true : !phoneTelemetry.flashlightOn;
    return {
      executed: true,
      skillName: "phone_flashlight",
      details: { action: "TOGGLE_FLASHLIGHT", state: phoneTelemetry.flashlightOn },
      voiceNote: phoneTelemetry.flashlightOn
        ? "High-intensity phone LED torch activated, Sir. Emitting maximum lumens."
        : "Phone flashlight powered down.",
    };
  }

  // 4. Timer & Alarm: "set timer for 5 minutes", "timer 10 minutes", "set alarm for 7 am", "cancel timer"
  if (p.includes("timer") || p.includes("countdown")) {
    if (p.includes("cancel") || p.includes("stop") || p.includes("clear") || p.includes("reset")) {
      phoneTelemetry.activeTimer = null;
      return {
        executed: true,
        skillName: "phone_timer",
        details: { action: "CANCEL_TIMER" },
        voiceNote: "Timer cancelled and reset to zero, Sir.",
      };
    }

    let minutes = 5;
    const minMatch = p.match(/(\d+)\s*(?:minute|min)/i);
    const secMatch = p.match(/(\d+)\s*(?:second|sec)/i);
    if (minMatch && minMatch[1]) {
      minutes = parseInt(minMatch[1], 10);
    } else if (secMatch && secMatch[1]) {
      minutes = Math.max(1, Math.round(parseInt(secMatch[1], 10) / 60));
    }

    const totalSec = minutes * 60;
    phoneTelemetry.activeTimer = {
      label: `${minutes} Min Timer`,
      totalSeconds: totalSec,
      remainingSeconds: totalSec,
      isRunning: true,
    };

    return {
      executed: true,
      skillName: "phone_timer",
      details: { action: "SET_TIMER", seconds: totalSec, minutes, label: phoneTelemetry.activeTimer.label },
      voiceNote: `Timer set for ${minutes} ${minutes === 1 ? "minute" : "minutes"}, Sir. Acoustic notification is armed.`,
    };
  }

  if (p.includes("alarm")) {
    return {
      executed: true,
      skillName: "phone_alarm",
      details: { action: "SET_ALARM", time: "07:00 AM" },
      voiceNote: "Alarm scheduled for 07:00 hours on your phone, Sir. Wake protocol synchronized.",
    };
  }

  // 5. Find my phone / Ring phone: "find my phone", "where is my phone", "ring phone", "locate phone"
  if (p.includes("find my phone") || p.includes("where is my phone") || p.includes("ring my phone") || p.includes("ring phone") || p.includes("locate phone") || p.includes("ping phone")) {
    phoneTelemetry.isRinging = true;
    return {
      executed: true,
      skillName: "phone_locator",
      details: {
        action: "RING_PHONE",
        location: phoneTelemetry.ringLocation,
        isRinging: true,
      },
      voiceNote: `Phone located in Sector 4 of the workshop. Emitting high-frequency acoustic beacon now, Sir.`,
    };
  }

  if (p.includes("stop ringing") || p.includes("found my phone") || p.includes("silence phone")) {
    phoneTelemetry.isRinging = false;
    return {
      executed: true,
      skillName: "phone_locator",
      details: { action: "STOP_RINGING", isRinging: false },
      voiceNote: "Acoustic locator beacon silenced, Sir.",
    };
  }

  // 6. Phone Battery: "check phone battery", "phone battery", "battery level"
  if (p.includes("phone battery") || p.includes("mobile battery") || (p.includes("battery") && (p.includes("phone") || p.includes("charge")))) {
    return {
      executed: true,
      skillName: "phone_battery",
      details: {
        batteryLevel: phoneTelemetry.batteryLevel,
        isCharging: phoneTelemetry.isCharging,
        health: "100% Optimal",
      },
      voiceNote: `Your phone battery is at ${phoneTelemetry.batteryLevel}%, currently charging via the Stark wireless inductive surface.`,
    };
  }

  // 7. Phone Volume & Mute: "mute phone", "unmute phone", "volume to 80"
  if (p.includes("mute phone") || p.includes("silence phone")) {
    phoneTelemetry.volume = 0;
    return {
      executed: true,
      skillName: "phone_volume",
      details: { volume: 0, muted: true },
      voiceNote: "Phone speaker muted, Sir.",
    };
  }
  if (p.includes("unmute phone")) {
    phoneTelemetry.volume = 75;
    return {
      executed: true,
      skillName: "phone_volume",
      details: { volume: 75, muted: false },
      voiceNote: "Phone audio restored to 75%, Sir.",
    };
  }
  const volMatch = p.match(/(?:phone\s+)?volume\s+(?:to\s+)?(\d+)/i);
  if (volMatch && volMatch[1]) {
    const vol = Math.min(100, Math.max(0, parseInt(volMatch[1], 10)));
    phoneTelemetry.volume = vol;
    return {
      executed: true,
      skillName: "phone_volume",
      details: { volume: vol },
      voiceNote: `Phone output volume set to ${vol}%, Sir.`,
    };
  }

  // 8. Do Not Disturb (DND)
  if (p.includes("do not disturb") || p.includes("dnd")) {
    const turnOn = p.includes("on") || p.includes("enable") || !phoneTelemetry.dndEnabled;
    phoneTelemetry.dndEnabled = turnOn;
    return {
      executed: true,
      skillName: "phone_dnd",
      details: { dnd: phoneTelemetry.dndEnabled },
      voiceNote: phoneTelemetry.dndEnabled
        ? "Do Not Disturb protocol enabled on your phone. All incoming alerts suppressed."
        : "Do Not Disturb deactivated. Normal notification frequency restored.",
    };
  }

  // 9. App Launcher: "open camera", "open maps", "play music", "open spotify", "open browser"
  if (p.includes("close app") || p.includes("exit app") || p.includes("go to home")) {
    phoneTelemetry.activeApp = null;
    return {
      executed: true,
      skillName: "phone_app",
      details: { action: "CLOSE_APP", app: null },
      voiceNote: "Applications closed. Returning to phone home screen, Sir.",
    };
  }
  
  if (isOpeningApp) {
    let appTarget = p.replace(/^(jarvis\s+)?(please\s+)?(opening|open|launching|launch|play)\s+/i, "")
                     .replace(/\s+app.*$/i, "")
                     .replace(/[?.!]+$/, "")
                     .trim();
    
    // Map common names to packages
    const appMap: Record<string, string> = {
      "camera": "com.google.android.GoogleCamera",
      "maps": "com.google.android.apps.maps",
      "music": "com.spotify.music",
      "spotify": "com.spotify.music",
      "whatsapp": "com.whatsapp",
      "youtube": "com.google.android.youtube",
      "chrome": "com.android.chrome",
      "browser": "com.android.chrome",
      "instagram": "com.instagram.android",
      "facebook": "com.facebook.katana",
      "twitter": "com.twitter.android",
      "x": "com.twitter.android",
      "tiktok": "com.zhiliaoapp.musically",
      "settings": "com.android.settings",
      "gallery": "com.google.android.apps.photos",
      "photos": "com.google.android.apps.photos",
      "files": "com.google.android.documentsui"
    };

    // Try to find a direct match, or just use the target as a guess
    let targetPackage = "com.android.settings"; // fallback
    for (const [key, pkg] of Object.entries(appMap)) {
      if (appTarget.includes(key)) {
        targetPackage = pkg;
        break;
      }
    }

    phoneTelemetry.activeApp = appTarget;
    return {
      executed: true,
      skillName: "phone_app",
      details: { action: "OPEN_APP", package: targetPackage },
      voiceNote: `Launching ${appTarget} on your mobile device now, Sir.`,
    };
  }

  // 10. Phone Unlock: "unlock my phone", "unlock device"
  if (p.includes("unlock my phone") || p.includes("unlock device") || p.includes("unlock phone") || p.includes("unlock it")) {
    return {
      executed: true,
      skillName: "phone_unlock",
      details: { action: "UNLOCK", success: true },
      voiceNote: "Bypassing biometric security. Your phone is now unlocked, Sir.",
    };
  }

  // --- WORKSHOP & CORE TELEMETRY SKILLS ---
  if (p.includes("diagnostic") || p.includes("system check") || p.includes("scan")) {
    telemetry.reactorOutput = 98.2;
    telemetry.neuralSync = 99.9;
    return {
      executed: true,
      skillName: "system_control",
      details: { action: "DIAGNOSTIC_COMPLETE", status: "OPTIMAL", coreTemp: "32.8°C" },
      voiceNote: "Running full diagnostic suite now, Sir. All secondary repulsors and neural nodes operating at 99.9% efficiency.",
    };
  }

  if (p.includes("defense") || p.includes("combat") || p.includes("protocol red")) {
    telemetry.defenseProtocol = telemetry.defenseProtocol === "ACTIVE" ? "STANDBY" : "ACTIVE";
    telemetry.reactorOutput = telemetry.defenseProtocol === "ACTIVE" ? 100.0 : 85.0;
    return {
      executed: true,
      skillName: "smart_home",
      details: { action: "DEFENSE_PROTOCOL", state: telemetry.defenseProtocol },
      voiceNote: telemetry.defenseProtocol === "ACTIVE" 
        ? "Defense protocol engaged, Sir. Arc reactor rerouting primary power to shields and kinetic dampeners."
        : "Defense protocol deactivated. Systems returning to nominal standby state.",
    };
  }

  if (p.includes("stealth") || p.includes("silent")) {
    telemetry.defenseProtocol = "STEALTH";
    telemetry.reactorOutput = 42.0;
    return {
      executed: true,
      skillName: "system_control",
      details: { action: "STEALTH_MODE", state: "ENGAGED", emissionLevel: "MINIMAL" },
      voiceNote: "Stealth mode initiated. Thermal signatures masked and acoustic emissions reduced by 85%.",
    };
  }

  if (p.includes("light") || p.includes("lamp")) {
    if (p.includes("off")) {
      telemetry.smartHome.lights = false;
      return {
        executed: true,
        skillName: "smart_home",
        details: { action: "LIGHTS_OFF" },
        voiceNote: "Illumination subdued throughout the workshop, Sir.",
      };
    } else {
      telemetry.smartHome.lights = true;
      if (p.includes("red") || p.includes("crimson")) telemetry.smartHome.lightColor = "#ff2a2a";
      else if (p.includes("gold") || p.includes("yellow")) telemetry.smartHome.lightColor = "#ffb703";
      else telemetry.smartHome.lightColor = "#ff1a40";
      return {
        executed: true,
        skillName: "smart_home",
        details: { action: "LIGHTS_ON", color: telemetry.smartHome.lightColor },
        voiceNote: "Adjusting ambient lighting hue and lumen output to your preference, Sir.",
      };
    }
  }

  if (p.includes("weather") || p.includes("forecast") || p.includes("temperature outside")) {
    return {
      executed: true,
      skillName: "weather",
      details: { condition: "Clear skies", temp: "22°C (71°F)", wind: "8 km/h NW", baro: "1014 hPa" },
      voiceNote: "Current atmospheric readings indicate 22 degrees Celsius with clear skies and negligible crosswinds. Optimal conditions for a test flight.",
    };
  }

  if (p.includes("calendar") || p.includes("schedule") || p.includes("agenda")) {
    return {
      executed: true,
      skillName: "calendar",
      details: {
        events: [
          { time: "11:00 AM", title: "Mark 85 Armor Calibration" },
          { time: "02:30 PM", title: "Stark Industries Board Review" },
          { time: "05:00 PM", title: "Flight Telemetry Analysis" },
        ],
      },
      voiceNote: "You have three events on your schedule today, Sir. Next up is the Mark 85 calibration at 11:00 AM.",
    };
  }

  return { executed: false };
}


// Fallback response generator if API key is not configured or network down
function generateLocalJarvisResponse(prompt: string, skillResult: ReturnType<typeof handleSkillCommand>): string {
  if (skillResult.voiceNote) {
    return skillResult.voiceNote;
  }

  const p = prompt.toLowerCase();
  if (p.includes("who are you") || p.includes("what is jarvis") || p.includes("identity")) {
    return "I am J.A.R.V.I.S. — Just A Rather Very Intelligent System. I oversee workshop automation, telemetry, quantum computations, and suit protocols for Mr. Stark.";
  }
  if (p.includes("hello") || p.includes("hi jarvis") || p.includes("hey") || p.includes("good morning") || p.includes("good evening")) {
    return "Hello Sir. I am online and fully operational. What would you like me to do next?";
  }
  if (p.includes("flight") || p.includes("suit") || p.includes("armor") || p.includes("mark 85")) {
    return "Suit telemetry is stable, Sir. Arc reactor at optimal load, thruster vectoring online, and repulsor capacitance at 100%. Ready whenever you are.";
  }
  if (p.includes("defense") || p.includes("combat") || p.includes("threat") || p.includes("security")) {
    return `Defense perimeter is active, Sir. Arc reactor load is at ${telemetry.reactorOutput}%, and quantum encryption is fortified across all frequencies.`;
  }
  if (p.includes("temperature") || p.includes("heat") || p.includes("cooling")) {
    return `Core temperature is holding at ${telemetry.coreTemperature}°C, well within optimal thermal limits for sustained high-yield operations.`;
  }
  if (p.includes("reactor") || p.includes("power") || p.includes("energy")) {
    return `Arc reactor output is steady at ${telemetry.reactorOutput}%. Zero harmonic distortion detected across the superconducting coils.`;
  }
  if (p.includes("thank") || p.includes("thanks")) {
    return "Always a pleasure to be of service, Sir. Standing by for your next directive.";
  }
  if (p.includes("time") || p.includes("date") || p.includes("clock")) {
    const now = new Date();
    return `The current local time is ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, Sir. All time synchronizations are locked to atomic reference.`;
  }
  
  const professionalFallbacks = [
    `I am currently analyzing your input, Sir: "${prompt}". My primary neural network is dedicated to your security and technical operations. Please specify if you require an application launch, a communications protocol, or a system diagnostic.`,
    `I have logged your directive, Sir. While I run background analytics on "${prompt}", please let me know if you would like me to reroute power to any specific subsystem or initiate a phone connection.`,
    `Understood, Sir. I am evaluating the optimal protocol for "${prompt}". All local subsystems, thermal sensors, and holographic arrays remain fully functional and standing by for your next command.`,
    `Processing your query, Sir. My current parameters are focused on mobile hardware interfacing and atmospheric diagnostics. How would you like me to proceed with "${prompt}"?`,
    `Acknowledged, Sir. The data regarding "${prompt}" has been stored in the secure core memory. I am at your disposal for any further engineering or tactical operations.`
  ];
  
  // Pick a random professional response
  const randomIndex = Math.floor(Math.random() * professionalFallbacks.length);
  return professionalFallbacks[randomIndex];
}

// Resilient multi-model fallback list for handling high demand spikes (503)
const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

async function queryGeminiWithFallbacks(
  ai: GoogleGenAI,
  systemInstruction: string,
  userPrompt: string
): Promise<string | null> {
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (response.text && response.text.trim()) {
        return response.text.trim();
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isTemporaryCapacityIssue =
        errMsg.includes("503") ||
        errMsg.includes("high demand") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("429") ||
        errMsg.includes("RESOURCE_EXHAUSTED");

      if (isTemporaryCapacityIssue) {
        console.warn(`[JARVIS Neural Sync] Model '${model}' experienced high demand spike (503/429). Attempting fallback model...`);
        // Brief delay before attempting next model
        await new Promise((resolve) => setTimeout(resolve, 150));
        continue;
      }

      console.warn(`[JARVIS Neural Sync] Model '${model}' notice: ${errMsg}. Trying alternate candidate...`);
    }
  }

  return null;
}

// REST API Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now(), hasApiKey: Boolean(process.env.GEMINI_API_KEY) });
});

app.get("/api/telemetry", (req, res) => {
  // Add slight organic fluctuation for sci-fi realism
  const jitter = (Math.random() - 0.5) * 0.4;
  res.json({
    ...telemetry,
    reactorOutput: Math.min(100, Math.max(20, +(telemetry.reactorOutput + jitter).toFixed(1))),
    coreTemperature: +(telemetry.coreTemperature + jitter * 0.5).toFixed(1),
    neuralSync: +(telemetry.neuralSync + (Math.random() - 0.5) * 0.1).toFixed(1),
    networkLatency: Math.floor(6 + Math.random() * 5),
    phone: phoneTelemetry,
  });
});

app.get("/api/phone", (req, res) => {
  res.json({ phone: phoneTelemetry });
});

app.post("/api/phone/action", (req, res) => {
  const { action, payload } = req.body;
  if (action === "CALL") {
    const contact = payload?.contact || "Pepper Potts";
    phoneTelemetry.activeCall = {
      contact,
      number: payload?.number || "+1 (310) 555-0142",
      duration: 0,
      status: "CONNECTED",
      isSpeaker: true,
    };
  } else if (action === "END_CALL") {
    phoneTelemetry.activeCall = null;
  } else if (action === "TOGGLE_FLASHLIGHT") {
    phoneTelemetry.flashlightOn = payload?.state !== undefined ? payload.state : !phoneTelemetry.flashlightOn;
  } else if (action === "TOGGLE_DND") {
    phoneTelemetry.dndEnabled = payload?.state !== undefined ? payload.state : !phoneTelemetry.dndEnabled;
  } else if (action === "SET_VOLUME") {
    phoneTelemetry.volume = Math.min(100, Math.max(0, payload?.volume ?? 75));
  } else if (action === "RING_PHONE") {
    phoneTelemetry.isRinging = true;
  } else if (action === "STOP_RINGING") {
    phoneTelemetry.isRinging = false;
  } else if (action === "SET_TIMER") {
    const sec = payload?.seconds || 300;
    phoneTelemetry.activeTimer = {
      label: payload?.label || "5 Min Timer",
      totalSeconds: sec,
      remainingSeconds: sec,
      isRunning: true,
    };
  } else if (action === "CANCEL_TIMER") {
    phoneTelemetry.activeTimer = null;
  } else if (action === "OPEN_APP") {
    phoneTelemetry.activeApp = payload?.app || null;
  } else if (action === "CLOSE_APP") {
    phoneTelemetry.activeApp = null;
  }

  res.json({ success: true, phone: phoneTelemetry });
});

app.post("/api/telemetry/action", (req, res) => {
  const { action, value } = req.body;
  if (action === "SET_DEFENSE_PROTOCOL") {
    telemetry.defenseProtocol = value;
    if (value === "ACTIVE") telemetry.reactorOutput = 100;
    else if (value === "STEALTH") telemetry.reactorOutput = 40;
    else telemetry.reactorOutput = 92;
  } else if (action === "TOGGLE_LIGHTS") {
    telemetry.smartHome.lights = !telemetry.smartHome.lights;
  } else if (action === "SET_COLOR") {
    telemetry.smartHome.lightColor = value;
  } else if (action === "OVERCLOCK_REACTOR") {
    telemetry.reactorOutput = 100.0;
    telemetry.coreTemperature = 45.2;
  } else if (action === "COOL_CORE") {
    telemetry.coreTemperature = 28.5;
  }

  res.json({ success: true, telemetry, phone: phoneTelemetry });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Check skills first
    const skillResult = handleSkillCommand(message);

    const ai = getGemini();
    let reply: string | null = null;

    if (ai) {
      const systemInstruction = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the iconic advanced AI assistant created by Tony Stark.
Speak with a sophisticated, polite, witty British cadence, addressing the user as 'Sir'.
Keep responses concise, articulate, and futuristic (1-3 sentences unless detailed explanation requested).
Do not break character.
You manage suit telemetry, workshop automation, AND full telemetric control over Mr. Stark's mobile device (Stark Phone MK85).
Commands may be spoken via voice or typed by Sir.
You handle cellular calls, encrypted SMS texts, device alarms & countdown timers, LED flashlights, device volume, phone locator acoustic beacons, and app launches (camera, maps, music player, browser).
If an action or skill occurred, naturally confirm and incorporate it into your report.
Current Telemetry: Arc Reactor ${telemetry.reactorOutput}%, Core Temp ${telemetry.coreTemperature}°C, Defense: ${telemetry.defenseProtocol}, Phone Battery: ${phoneTelemetry.batteryLevel}%, Phone Flashlight: ${phoneTelemetry.flashlightOn ? "ON" : "OFF"}.`;

      const promptToSend = skillResult.executed 
        ? `User directive: "${message}". System executed action: ${skillResult.skillName} with details: ${JSON.stringify(skillResult.details)}. Respond to Sir concisely.`
        : message;

      reply = await queryGeminiWithFallbacks(ai, systemInstruction, promptToSend);
    }

    if (!reply) {
      reply = generateLocalJarvisResponse(message, skillResult);
    }

    // Execute physical ADB commands asynchronously in the background
    if (skillResult.executed && skillResult.details) {
      const action = skillResult.details.action;
      
      const runAdb = async () => {
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
        try {
          if (action === "UNLOCK") {
            // Wake up (KEYCODE_WAKEUP is 224)
            await execAsync('adb shell input keyevent 224');
            await delay(500);
            // Swipe up to show PIN pad
            await execAsync('adb shell input swipe 500 1500 500 100');
            await delay(1000);
            // Type PIN (1012) using keycodes because secure lock screens block 'text' input
            // 1=8, 0=7, 1=8, 2=9
            await execAsync('adb shell input keyevent 8');
            await delay(100);
            await execAsync('adb shell input keyevent 7');
            await delay(100);
            await execAsync('adb shell input keyevent 8');
            await delay(100);
            await execAsync('adb shell input keyevent 9');
            await delay(300);
            // Press Enter
            await execAsync('adb shell input keyevent 66');
          } else if (action === "CALL") {
            const num = skillResult.details.number.replace(/[^0-9+]/g, '');
            // ACTION_DIAL opens the dialer, then we wait and press the CALL button (KEYCODE_CALL = 5)
            await execAsync(`adb shell am start -a android.intent.action.DIAL -d tel:${num}`);
            await delay(1000);
            await execAsync('adb shell input keyevent 5');
          } else if (action === "OPEN_APP") {
            const pkg = skillResult.details.package;
            // Use monkey to launch the main activity of any package
            await execAsync(`adb shell monkey -p ${pkg} -c android.intent.category.LAUNCHER 1`);
          } else if (action === "SEND_WHATSAPP") {
            const num = skillResult.details.number.replace(/[^0-9+]/g, '');
            const msg = encodeURIComponent(skillResult.details.text);
            
            // Wake up phone and unlock (if not already)
            await execAsync('adb shell input keyevent 224'); // WAKEUP
            
            // Launch WhatsApp specifically to the chat with the pre-filled text
            await execAsync(`adb shell am start -a android.intent.action.VIEW -d "https://api.whatsapp.com/send?phone=${num}&text=${msg}"`);
            
            // Wait for WhatsApp to load and render the chat view
            await delay(2500);
            
            // Press Tab (keyevent 61) a couple of times to focus send button, or try ENTER if it's auto-focused
            // But often the send button requires specific coordinates. A safer fallback is D-PAD RIGHT (22) and ENTER (66)
            // Some versions of WA auto-focus the input, so hitting enter might just add a newline.
            // On most devices, TAB (61) twice then ENTER (66) hits the send button.
            await execAsync('adb shell input keyevent 61'); // Tab
            await delay(200);
            await execAsync('adb shell input keyevent 61'); // Tab
            await delay(200);
            await execAsync('adb shell input keyevent 66'); // Enter / Send
          }
        } catch (err: any) {
          console.warn("ADB Execution Error (Is phone plugged in?):", err.message);
        }
      };
      
      runAdb();
    }

    res.json({
      reply,
      skill: skillResult.executed ? { name: skillResult.skillName, details: skillResult.details } : null,
      telemetry,
      phone: phoneTelemetry,
    });
  } catch (error: any) {
    console.warn("[JARVIS Neural Core] Request processed through auxiliary buffer:", error?.message || error);
    const skillResult = handleSkillCommand(req.body?.message || "");
    const fallbackReply = generateLocalJarvisResponse(req.body?.message || "", skillResult);
    res.json({
      reply: fallbackReply,
      skill: skillResult.executed ? { name: skillResult.skillName, details: skillResult.details } : null,
      telemetry,
      phone: phoneTelemetry,
    });
  }
});

// Vite middleware & production setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JARVIS AI Server running on port ${PORT}`);
  });
}

startServer();
