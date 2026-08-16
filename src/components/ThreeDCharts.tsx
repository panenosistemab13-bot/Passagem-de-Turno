import React, { useState } from 'react';

// ============================================================================
// 1. 3D ISOMETRIC BAR CHART
// ============================================================================
export interface Bar3DItem {
  label: string;
  value: number;
  color?: string;
  topColor?: string;
  sideColor?: string;
  sublabel?: string;
}

interface ThreeDBarChartProps {
  data: Bar3DItem[];
  height?: number;
  maxValue?: number;
}

export function ThreeDBarChart({ data, height = 220, maxValue }: ThreeDBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const max = maxValue || Math.max(...data.map(d => d.value), 10);

  return (
    <div className="w-full flex flex-col justify-end select-none">
      <div className="flex items-end justify-between gap-2.5 sm:gap-4 px-2" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const heightPct = Math.max(8, (item.value / max) * 100);
          const isHovered = hoveredIndex === index;
          
          const baseColor = item.color || '#D4A373';
          const topColor = item.topColor || '#FDE68A';
          const sideColor = item.sideColor || '#854D0E';

          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
            >
              {/* Floating Value Pill */}
              <div
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md mb-2 transition-all duration-300 ${
                  isHovered
                    ? 'bg-[#D4A373] text-black shadow-[0_0_15px_rgba(212,163,115,0.6)] scale-110 -translate-y-1'
                    : 'bg-[#141C29] text-slate-300 border border-[#223048]'
                }`}
              >
                {item.value}
              </div>

              {/* 3D Column Assembly */}
              <div className="w-full relative flex justify-center" style={{ height: `${heightPct}%` }}>
                
                {/* 3D Isometric Bar Body */}
                <div 
                  className={`w-full max-w-[42px] h-full rounded-t-sm transition-all duration-300 relative ${
                    isHovered ? 'scale-105 filter brightness-115' : ''
                  }`}
                  style={{
                    background: `linear-gradient(180deg, ${baseColor} 0%, rgba(20, 28, 42, 0.95) 100%)`,
                    boxShadow: isHovered
                      ? `0 0 25px ${baseColor}80, inset 1px 0 0 rgba(255,255,255,0.3)`
                      : '0 8px 20px rgba(0,0,0,0.5), inset 1px 0 0 rgba(255,255,255,0.15)',
                  }}
                >
                  {/* Top 3D Cap / Bevel */}
                  <div
                    className="absolute -top-1.5 inset-x-0 h-3 rounded-sm transform skew-x-12 origin-bottom transition-all"
                    style={{
                      backgroundColor: topColor,
                      boxShadow: '0 -2px 10px rgba(255,255,255,0.3)',
                    }}
                  />

                  {/* Right Depth Shadow Flange */}
                  <div
                    className="absolute top-0 right-0 w-2 h-full opacity-40 rounded-tr-sm"
                    style={{ backgroundColor: sideColor }}
                  />

                  {/* High-tech Vertical Grid Indicator Lines */}
                  <div className="absolute inset-y-2 left-1/2 w-[1px] bg-white/20 -translate-x-1/2" />
                </div>
              </div>

              {/* X-Axis Label */}
              <div className="mt-3 text-center">
                <span className={`text-[10px] sm:text-xs font-bold block transition-colors ${
                  isHovered ? 'text-[#D4A373]' : 'text-slate-400'
                }`}>
                  {item.label}
                </span>
                {item.sublabel && (
                  <span className="text-[9px] font-mono text-slate-500 block truncate max-w-[60px]">
                    {item.sublabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Base baseline axis */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#2D3F59] to-transparent mt-1" />
    </div>
  );
}

// ============================================================================
// 2. 3D EXPLODED DONUT CHART
// ============================================================================
export interface Donut3DSlice {
  id: string;
  label: string;
  value: number;
  color: string;
  glow: string;
}

interface ThreeDDonutChartProps {
  slices: Donut3DSlice[];
  centerLabel?: string;
  centerValue?: string | number;
  size?: number;
}

export function ThreeDDonutChart({
  slices,
  centerLabel = 'TOTAL',
  centerValue,
  size = 220
}: ThreeDDonutChartProps) {
  const [activeSlice, setActiveSlice] = useState<string | null>(null);

  const total = slices.reduce((acc, s) => acc + s.value, 0) || 1;
  const radius = size * 0.38;
  const innerRadius = size * 0.25;
  const cx = size / 2;
  const cy = size / 2;

  let currentAngle = -90;

  const slicePaths = slices.map((slice) => {
    const angle = (slice.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const ix1 = cx + innerRadius * Math.cos(startRad);
    const iy1 = cy + innerRadius * Math.sin(startRad);
    const ix2 = cx + innerRadius * Math.cos(endRad);
    const iy2 = cy + innerRadius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const d = `
      M ${ix1} ${iy1}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${ix2} ${iy2}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}
      Z
    `;

    // Calculate mid angle for explode offset
    const midRad = ((startAngle + endAngle) / 2 * Math.PI) / 180;
    const explodeX = Math.cos(midRad) * 8;
    const explodeY = Math.sin(midRad) * 8;

    return {
      ...slice,
      d,
      pct: ((slice.value / total) * 100).toFixed(0),
      explodeTransform: `translate(${explodeX}px, ${explodeY}px)`,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full select-none">
      {/* SVG Donut Visual */}
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
          {/* Subtle Outer Cyber Glow Ring */}
          <circle
            cx={cx}
            cy={cy}
            r={radius + 8}
            fill="none"
            stroke="rgba(34, 50, 77, 0.3)"
            strokeWidth="1"
            strokeDasharray="4,6"
          />

          {slicePaths.map((slice) => {
            const isHovered = activeSlice === slice.id;

            return (
              <path
                key={slice.id}
                d={slice.d}
                fill={slice.color}
                stroke="#0B0F17"
                strokeWidth="2.5"
                onMouseEnter={() => setActiveSlice(slice.id)}
                onMouseLeave={() => setActiveSlice(null)}
                className="cursor-pointer transition-all duration-300 origin-center"
                style={{
                  transform: isHovered ? `${slice.explodeTransform} scale(1.05)` : 'translate(0,0) scale(1)',
                  filter: isHovered ? `drop-shadow(0 0 12px ${slice.color}) brightness(1.2)` : 'none',
                }}
              />
            );
          })}
        </svg>

        {/* Center Holographic HUD Core */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-[#070A0F] border border-[#223048] flex flex-col items-center justify-center shadow-inner">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
              {centerLabel}
            </span>
            <span className="text-lg font-black text-white font-serif">
              {centerValue !== undefined ? centerValue : total}
            </span>
          </div>
        </div>
      </div>

      {/* Legend Column with 3D Chips */}
      <div className="flex flex-col gap-2 w-full max-w-[200px]">
        {slices.map((slice) => {
          const isHovered = activeSlice === slice.id;
          const pct = ((slice.value / total) * 100).toFixed(0);

          return (
            <div
              key={slice.id}
              onMouseEnter={() => setActiveSlice(slice.id)}
              onMouseLeave={() => setActiveSlice(null)}
              className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                isHovered
                  ? 'bg-[#141D2B] border-[#D4A373] translate-x-1 shadow-md'
                  : 'bg-[#090D14] border-[#1A2536] hover:border-[#2C3B52]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-[11px] font-bold text-slate-300 truncate">
                  {slice.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                <span className="text-xs font-mono font-black text-white">{slice.value}</span>
                <span className="text-[9px] font-mono text-slate-500">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 3. 3D ORBITAL STATUS RING (KPI GAUGE)
// ============================================================================
interface ThreeDOrbitalRingProps {
  value: number;
  max?: number;
  label: string;
  sublabel?: string;
  color?: string;
  size?: number;
  icon?: React.ElementType;
}

export function ThreeDOrbitalRing({
  value,
  max = 100,
  label,
  sublabel,
  color = '#D4A373',
  size = 110,
  icon: Icon
}: ThreeDOrbitalRingProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const strokeWidth = 7;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center select-none group">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* SVG Progress Ring */}
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
          />
        </svg>

        {/* Orbiting Ring Satellite Particle */}
        <div
          className="absolute inset-1 rounded-full border border-dashed border-[#D4A373]/20 animate-[spin_20s_linear_infinite] pointer-events-none"
        />

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          {Icon && <Icon className="w-4 h-4 mb-0.5 text-slate-400 group-hover:text-white transition-colors" />}
          <span className="text-base sm:text-lg font-mono font-black text-white leading-none">
            {value}
          </span>
          <span className="text-[9px] font-mono text-[#D4A373] mt-0.5">
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="text-center mt-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-200 block truncate">
          {label}
        </span>
        {sublabel && (
          <span className="text-[9px] text-slate-500 block truncate">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
