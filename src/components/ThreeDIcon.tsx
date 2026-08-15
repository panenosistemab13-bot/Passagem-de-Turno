import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ThreeDIconProps {
  icon: LucideIcon;
  color?: 'blue' | 'red' | 'green' | 'amber' | 'purple' | 'coffee';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function ThreeDIcon({ 
  icon: Icon, 
  color = 'coffee', 
  size = 'md',
  className = '' 
}: ThreeDIconProps) {
  
  const colorMap = {
    blue: {
      bg: 'from-[#1e40af] to-[#0d3361]',
      shadow: 'shadow-blue-900/40',
      light: 'bg-blue-500/20 text-blue-300',
      border: 'border-blue-400/30'
    },
    red: {
      bg: 'from-[#b91c1c] to-[#7f1d1d]',
      shadow: 'shadow-red-900/40',
      light: 'bg-red-500/20 text-red-300',
      border: 'border-red-400/30'
    },
    green: {
      bg: 'from-[#15803d] to-[#14532d]',
      shadow: 'shadow-green-900/40',
      light: 'bg-green-500/20 text-green-300',
      border: 'border-green-400/30'
    },
    amber: {
      bg: 'from-[#b45309] to-[#78350f]',
      shadow: 'shadow-amber-900/40',
      light: 'bg-amber-500/20 text-amber-300',
      border: 'border-amber-400/30'
    },
    purple: {
      bg: 'from-[#6d28d9] to-[#4c1d95]',
      shadow: 'shadow-purple-900/40',
      light: 'bg-purple-500/20 text-purple-300',
      border: 'border-purple-400/30'
    },
    coffee: {
      bg: 'from-[#78350f] to-[#3b1307]',
      shadow: 'shadow-amber-990/50',
      light: 'bg-[#a16207]/20 text-[#f59e0b]',
      border: 'border-[#78350f]/30'
    }
  };

  const sizeMap = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-12 h-12 p-2.5',
    lg: 'w-16 h-16 p-3.5',
    xl: 'w-24 h-24 p-5'
  };

  const selectedColor = colorMap[color];
  const selectedSize = sizeMap[size];

  return (
    <div className={`relative group ${className}`}>
      {/* Glossy Reflection Highlight */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 to-white/25 z-10 pointer-events-none`} />
      
      {/* 3D Base Shadow & Glow */}
      <div className={`absolute inset-0.5 rounded-xl bg-gradient-to-br ${selectedColor.bg} opacity-80 blur-md ${selectedColor.shadow} translate-y-1.5 transition-all duration-300 group-hover:translate-y-2 group-hover:blur-lg`} />
      
      {/* Main 3D Container */}
      <div className={`relative rounded-xl border ${selectedColor.border} bg-gradient-to-br ${selectedColor.bg} ${selectedSize} flex items-center justify-center transition-all duration-300 transform group-hover:-translate-y-0.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),_0_4px_6px_rgba(0,0,0,0.3)] hover:scale-105`}>
        {/* Soft backlighting inner glow */}
        <div className="absolute inset-0 rounded-lg bg-radial-gradient from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <Icon className="w-full h-full text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]" />
      </div>
    </div>
  );
}

// Visual 3D Leader Folder Component
interface LeaderFolderProps {
  key?: React.Key;
  name: string;
  role: string;
  shift?: string;
  occurrencesCount: number;
  employeesCount: number;
  onClick: () => void;
  color?: 'blue' | 'coffee' | 'amber' | 'green' | 'purple';
}

export function LeaderFolder({
  name,
  role,
  shift,
  occurrencesCount,
  employeesCount,
  onClick,
  color = 'blue'
}: LeaderFolderProps) {
  
  const colors = {
    blue: {
      tab: 'bg-[#1e40af]',
      front: 'bg-gradient-to-br from-[#1e40af] to-[#0c2340]',
      shadow: 'shadow-blue-900/30',
      accent: 'border-blue-400/20',
      badge: 'bg-blue-500/20 text-blue-200'
    },
    coffee: {
      tab: 'bg-[#78350f]',
      front: 'bg-gradient-to-br from-[#78350f] to-[#3b1307]',
      shadow: 'shadow-orange-950/40',
      accent: 'border-amber-600/20',
      badge: 'bg-amber-500/20 text-amber-200'
    },
    amber: {
      tab: 'bg-[#b45309]',
      front: 'bg-gradient-to-br from-[#b45309] to-[#5a2100]',
      shadow: 'shadow-amber-900/30',
      accent: 'border-amber-400/20',
      badge: 'bg-amber-500/20 text-amber-200'
    },
    green: {
      tab: 'bg-[#15803d]',
      front: 'bg-gradient-to-br from-[#15803d] to-[#0f401f]',
      shadow: 'shadow-green-900/30',
      accent: 'border-green-400/20',
      badge: 'bg-green-500/20 text-green-200'
    },
    purple: {
      tab: 'bg-[#6d28d9]',
      front: 'bg-gradient-to-br from-[#6d28d9] to-[#2e1065]',
      shadow: 'shadow-purple-900/30',
      accent: 'border-purple-400/20',
      badge: 'bg-purple-500/20 text-purple-200'
    }
  };

  const activeColor = colors[color];

  return (
    <button 
      onClick={onClick}
      className="text-left group relative w-full h-44 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C8102E] rounded-xl"
    >
      {/* 3D Deep Shadow */}
      <div className={`absolute inset-x-2 bottom-0 h-40 bg-black/40 rounded-xl blur-md translate-y-3 transition-all duration-300 group-hover:translate-y-5 group-hover:blur-lg`} />

      {/* The Folder Wrapper with isometric slant perspective */}
      <div className="relative w-full h-44 flex flex-col justify-end transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-102">
        
        {/* Back Folder Tab */}
        <div className={`absolute top-4 left-6 w-20 h-8 rounded-t-lg ${activeColor.tab} opacity-90 border-t border-x border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]`} />
        
        {/* Back Folder Page (Simulated sheets inside) */}
        <div className="absolute top-6 inset-x-4 h-32 bg-white/95 rounded-t-lg shadow-sm border border-slate-200 transform scale-98 -translate-y-2 flex flex-col justify-start p-3 gap-1 z-0 overflow-hidden">
          <div className="w-16 h-2 bg-slate-200 rounded animate-pulse" />
          <div className="w-24 h-1.5 bg-slate-100 rounded" />
          <div className="w-20 h-1.5 bg-slate-100 rounded" />
        </div>

        {/* Second Page (Slightly rotated sheet for realist detail) */}
        <div className="absolute top-6 inset-x-4 h-32 bg-slate-50 rounded-t-lg shadow-sm border border-slate-100 transform scale-96 -translate-y-1 rotate-1 z-0" />

        {/* Front Folder Plate */}
        <div className={`relative z-10 w-full h-32 rounded-xl ${activeColor.front} border ${activeColor.accent} flex flex-col justify-between p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,0.25)] overflow-hidden`}>
          {/* Subtle reflection overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div className="max-w-[70%]">
              <h4 className="text-white font-bold text-base leading-tight truncate tracking-wide">{name}</h4>
              <p className="text-white/70 text-xs mt-0.5 truncate font-medium">{role}</p>
              {shift && (
                <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/20 text-white border border-white/30">
                  {shift}
                </span>
              )}
            </div>
            {/* Coffee bean outline or logo watermark */}
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/15 shadow-sm">
              <span className="text-white font-bold text-xs">3C</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-white/10">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Ocorrências</span>
              <span className="text-white font-black text-sm">{occurrencesCount}</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Membros</span>
              <span className="text-white font-black text-sm">{employeesCount}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
