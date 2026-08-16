import React, { useState, useRef } from 'react';

interface ThreeDCardProps extends React.HTMLAttributes<HTMLDivElement> {
  key?: React.Key;
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  maxTilt?: number;
  onClick?: () => void;
  id?: string;
}

export default function ThreeDCard({
  children,
  className = '',
  glowColor = 'rgba(212, 163, 115, 0.15)',
  maxTilt = 6,
  onClick,
  id,
  ...rest
}: ThreeDCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    setMousePos({ x: percentX, y: percentY });

    const tiltY = ((x - rect.width / 2) / (rect.width / 2)) * maxTilt;
    const tiltX = -((y - rect.height / 2) / (rect.height / 2)) * maxTilt;

    setRotX(tiltX);
    setRotY(tiltY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotX(0);
    setRotY(0);
  };

  return (
    <div
      id={id}
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1200px',
      }}
      className={`relative group ${onClick ? 'cursor-pointer' : ''}`}
      {...rest}
    >
      <div
        style={{
          transform: isHovered
            ? `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(8px)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transformStyle: 'preserve-3d',
        }}
        className={`relative rounded-2xl bg-gradient-to-b from-[#0F1522]/90 via-[#0B0F17]/95 to-[#070A0F]/98 border border-[#1E2B40] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.6)] backdrop-blur-md overflow-hidden ${className}`}
      >
        {/* Specular Radial Spotlight following cursor */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle 350px at ${mousePos.x}% ${mousePos.y}%, ${glowColor}, transparent 70%)`,
          }}
        />

        {/* Ambient Top Rim Reflection Line */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A373]/40 to-transparent pointer-events-none" />
        
        {/* Ambient Corner Accent Points */}
        <div className="absolute top-1 left-1 w-1 h-1 bg-[#D4A373]/40 rounded-full pointer-events-none" />
        <div className="absolute top-1 right-1 w-1 h-1 bg-[#D4A373]/40 rounded-full pointer-events-none" />

        {/* Content with 3D Z-elevation */}
        <div className="relative z-10" style={{ transform: 'translateZ(10px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
