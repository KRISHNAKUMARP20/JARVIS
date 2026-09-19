import React, { useState } from 'react';

interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  color: string;
  onLaunchApp: (appName: string) => void;
}

const mockApps = [
  { name: 'Airtel Alert', icon: 'M' },
  { name: 'Albums', icon: '🖼️' },
  { name: 'Apps', icon: '📦' },
  { name: 'Arrow Puzzle', icon: '🧩' },
  { name: 'Authenticator', icon: '🛡️' },
  { name: 'Brave', icon: '🦁' },
  { name: 'Calculator', icon: '🧮' },
  { name: 'Calendar', icon: '📅' },
  { name: 'Camera', icon: '📷' },
  { name: 'ChatGPT', icon: '🤖' },
  { name: 'Chrome', icon: '🌐' },
  { name: 'Claude', icon: '🧠' },
  { name: 'Clock', icon: '⏰' },
  { name: 'Compass', icon: '🧭' },
  { name: 'Contacts', icon: '👤' },
  { name: 'Docs', icon: '📄' },
  { name: 'EasyShare', icon: '🔄' },
  { name: 'FamApp', icon: '👨‍👩‍👧‍👦' },
  { name: 'Feedback', icon: '📝' },
  { name: 'File Manager', icon: '📁' },
  { name: 'Files', icon: '🗂️' },
  { name: 'Flipkart', icon: '🛍️' },
  { name: 'FM Radio', icon: '📻' },
  { name: 'Free Fire MAX', icon: '🎮' },
  { name: 'Game Center', icon: '👾' },
  { name: 'Games', icon: '🕹️' },
  { name: 'Gemini', icon: '✨' },
  { name: 'Gmail', icon: '📧' },
  { name: 'Google', icon: 'G' },
  { name: 'GPay', icon: '💳' },
  { name: 'iManager', icon: '⚙️' },
  { name: 'iPulse', icon: '💓' },
  { name: 'LinkedIn', icon: 'in' },
  { name: 'Lock', icon: '🔒' },
  { name: 'Maps', icon: '🗺️' },
  { name: 'Meet', icon: '📹' },
  { name: 'Messages', icon: '💬' },
  { name: 'Music', icon: '🎵' },
  { name: 'Notes', icon: '🗒️' },
  { name: 'NSPOTR', icon: 'N' },
  { name: 'Overleaf', icon: '🍃' },
  { name: 'Phone', icon: '📞' },
  { name: 'Photos', icon: '🖼️' },
  { name: 'Pinterest', icon: '📌' },
  { name: 'Play Store', icon: '▶️' },
  { name: 'Recorder', icon: '🎙️' },
  { name: 'Safety', icon: '🆘' },
  { name: 'Settings', icon: '⚙️' },
  { name: 'Sheets', icon: '📊' },
  { name: 'Simple View', icon: '👁️' },
  { name: 'Slides', icon: '📽️' },
  { name: 'Super Browser', icon: '🦊' },
  { name: 'Themes', icon: '🎨' },
  { name: 'Unstop', icon: 'U' },
  { name: 'V-Appstore', icon: 'V' },
  { name: 'Video', icon: '🎬' },
  { name: 'vivo Cloud', icon: '☁️' },
  { name: 'vivo Store', icon: '🏪' },
  { name: 'Weather', icon: '⛅' },
  { name: 'WhatsApp', icon: '📞' },
];

export const AppDrawer: React.FC<AppDrawerProps> = ({ isOpen, onClose, color, onLaunchApp }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredApps = mockApps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#111111] text-white font-sans animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="pt-12 pb-4 px-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-6">
            <h1 className="text-2xl font-semibold border-b-2 pb-1" style={{ borderColor: '#3b82f6' }}>Apps</h1>
            <h1 className="text-2xl font-semibold text-gray-500 pb-1">Widgets</h1>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input
            type="text"
            className="w-full bg-[#2a2a2a] text-white rounded-full py-3 pl-12 pr-4 outline-none placeholder:text-gray-400"
            placeholder="Search apps"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* App Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 relative">
        <div className="grid grid-cols-4 gap-y-8 gap-x-2 mr-6">
          {filteredApps.map((app, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform"
              onClick={() => {
                onLaunchApp(app.name);
                onClose();
              }}
            >
              <div className="w-16 h-16 bg-white rounded-[22px] flex items-center justify-center text-3xl shadow-sm">
                <span className={app.icon.length === 1 ? 'text-black font-bold' : ''}>{app.icon}</span>
              </div>
              <span className="text-xs text-gray-300 text-center truncate w-full px-1">{app.name}</span>
            </div>
          ))}
        </div>
        
        {/* Alphabet Scroller (Mock) */}
        <div className="fixed right-1 top-40 bottom-24 w-6 flex flex-col items-center justify-between text-[10px] text-gray-500 font-medium">
          <span>#</span>
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
            <span key={letter} className="hover:text-white cursor-pointer">{letter}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
