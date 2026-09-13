import React from 'react';

interface QuickToggleProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

// One iOS-Control-Center-style tile: a rounded square that switches from
// dim/gray to a lit accent color when active.
export const QuickToggle: React.FC<QuickToggleProps> = ({ label, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 rounded-2xl aspect-square transition-colors ${
      active ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);
