import React, { useState } from 'react';
import { ASSETS } from '../assets/brandAssets';

interface ThreeDLogoProps {
  onClick?: () => void;
  size?: number;
}

export default function ThreeDLogo({ onClick, size = 110 }: ThreeDLogoProps) {
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setRot({ x: -y * 15, y: x * 15 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRot({ x: 0, y: 0 });
  };

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        width: size,
        height: size,
        perspective: '800px',
      }}
      className="relative flex items-center justify-center cursor-pointer select-none group"
    >
      {/* 3D Holographic Orbit Ring */}
      <div
        className="absolute inset-0 rounded-full border border-dashed border-[#D4A373]/30 animate-[spin_18s_linear_infinite] pointer-events-none"
        style={{
          boxShadow: isHovered ? '0 0 25px rgba(212,163,115,0.4)' : 'none',
          transition: 'box-shadow 0.3s ease',
        }}
      />

      {/* Main 3D Floating Emblem */}
      <div
        style={{
          transform: isHovered
            ? `rotateX(${rot.x}deg) rotateY(${rot.y}deg) scale(1.08) translateZ(10px)`
            : 'rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full h-full rounded-full p-1 bg-gradient-to-tr from-[#94612D] via-[#E2B170] to-[#4A2F17] shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-center"
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-[#070A0F] relative flex items-center justify-center border-2 border-[#1E1711]">
          <img
            src={ASSETS.badgeLogo}
            alt="Grupo 3 Corações"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full filter contrast-125 brightness-100"
          />
          {/* Specular glass reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
