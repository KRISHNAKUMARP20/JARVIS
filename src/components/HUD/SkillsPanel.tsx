import React from 'react';
import { CloudRain, ShieldAlert, Cpu, Calendar, Home, Sparkles, Terminal } from 'lucide-react';
import { sfx } from '../../audio/sfx';

interface SkillsPanelProps {
  onExecuteCommand: (cmd: string) => void;
  disabled?: boolean;
}

export const SkillsPanel: React.FC<SkillsPanelProps> = ({ onExecuteCommand, disabled }) => {
  const quickSkills = [
    {
      id: 'diag',
      label: 'Run Diagnostic',
      command: 'Run full system diagnostic on all core thrusters and neural links.',
      icon: Cpu,
      color: 'border-red-500/30 text-red-200 bg-red-950/30 hover:border-red-400 hover:bg-red-500/15 shadow-[0_0_10px_rgba(255,26,64,0.08)] hover:shadow-[0_0_15px_rgba(255,26,64,0.3)]',
    },
    {
      id: 'defense',
      label: 'Defense Protocol',
      command: 'Engage defense protocol and redirect arc reactor to shielding.',
      icon: ShieldAlert,
      color: 'border-red-500/30 text-red-200 bg-red-950/30 hover:border-red-400 hover:bg-red-500/15 shadow-[0_0_10px_rgba(255,26,64,0.08)] hover:shadow-[0_0_15px_rgba(255,26,64,0.3)]',
    },
    {
      id: 'weather',
      label: 'Atmospheric Scan',
      command: 'Provide current weather conditions and atmospheric readings.',
      icon: CloudRain,
      color: 'border-red-500/30 text-red-200 bg-red-950/30 hover:border-red-400 hover:bg-red-500/15 shadow-[0_0_10px_rgba(255,26,64,0.08)] hover:shadow-[0_0_15px_rgba(255,26,64,0.3)]',
    },
    {
      id: 'calendar',
      label: 'Check Schedule',
      command: 'Check my schedule and meetings for today.',
      icon: Calendar,
      color: 'border-red-500/30 text-red-200 bg-red-950/30 hover:border-red-400 hover:bg-red-500/15 shadow-[0_0_10px_rgba(255,26,64,0.08)] hover:shadow-[0_0_15px_rgba(255,26,64,0.3)]',
    },
    {
      id: 'lights',
      label: 'Workshop Lights',
      command: 'Adjust workshop lighting to full luminescent mode.',
      icon: Home,
      color: 'border-red-500/30 text-red-200 bg-red-950/30 hover:border-red-400 hover:bg-red-500/15 shadow-[0_0_10px_rgba(255,26,64,0.08)] hover:shadow-[0_0_15px_rgba(255,26,64,0.3)]',
    },
    {
      id: 'suit',
      label: 'Suit Status',
      command: 'Give me status report on the Mark 85 armor.',
      icon: Sparkles,
      color: 'border-red-500/30 text-red-200 bg-red-950/30 hover:border-red-400 hover:bg-red-500/15 shadow-[0_0_10px_rgba(255,26,64,0.08)] hover:shadow-[0_0_15px_rgba(255,26,64,0.3)]',
    },
  ];

  return (
    <div className="w-full bg-slate-950/70 border border-red-500/20 rounded-xl p-3.5 backdrop-blur-md flex flex-col gap-2.5 shadow-xl">
      <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-orbitron text-red-300 font-semibold tracking-wider">
          <Terminal className="w-3.5 h-3.5 text-red-400" />
          <span>SKILLS</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {quickSkills.map((skill) => {
          const Icon = skill.icon;
          return (
            <button
              key={skill.id}
              disabled={disabled}
              onClick={() => {
                sfx.playHudTick();
                onExecuteCommand(skill.command);
              }}
              className={`flex items-center gap-2 p-2 rounded-lg border bg-slate-900/60 text-left transition-all duration-200 group disabled:opacity-40 ${skill.color}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-[11px] font-rajdhani font-medium tracking-wide truncate">
                {skill.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
