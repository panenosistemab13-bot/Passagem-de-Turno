import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Database, Satellite, Zap, CheckCircle2, Lock, Radio, Activity } from 'lucide-react';
import { ASSETS } from '../assets/brandAssets';

interface BootSequenceModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const BOOT_STEPS = [
  { id: 'kernel', label: 'INITIALIZING 3C-CORE QUANTUM KERNEL v8.4', icon: Cpu, delay: 400 },
  { id: 'db', label: 'CONNECTING SECURE RTDB CLOUD REPOSITORIES', icon: Database, delay: 800 },
  { id: 'sat', label: 'LOCKING SASCAR TELEMETRY SATELLITE CHANNELS', icon: Satellite, delay: 1200 },
  { id: 'crypto', label: 'VALIDATING AES-256 PERIMETER ENCRYPTION', icon: Lock, delay: 1600 },
  { id: 'nodes', label: 'SYNCHRONIZING 38 REGIONAL LOGISTICS HUBS', icon: Radio, delay: 2000 },
  { id: 'complete', label: 'TACTICAL COMMAND CENTER ONLINE (1920×1080 4K READY)', icon: ShieldCheck, delay: 2400 },
];

export default function BootSequenceModal({ isOpen, onComplete }: BootSequenceModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setProgress(10);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400);
          return 100;
        }
        return prev + 15;
      });
    }, 280);

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < BOOT_STEPS.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 420);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#040609]/95 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      
      {/* Background Volumetric Beam */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#D4A373]/15 via-blue-900/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E2B40_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      {/* Main Tactical Box */}
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#0F1624] via-[#090D14] to-[#05070B] border border-[#223048] rounded-3xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden">
        
        {/* Top Accent Light Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D4A373] to-transparent" />

        {/* Center 3D Insignia */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#84532B] via-[#E2B170] to-[#3D2513] shadow-[0_0_30px_rgba(212,163,115,0.3)] animate-pulse mb-3">
            <div className="w-full h-full rounded-full bg-[#090D14] flex items-center justify-center overflow-hidden border border-[#2A1D13]">
              <img
                src={ASSETS.badgeLogo}
                alt="Grupo 3 Corações"
                className="w-full h-full object-cover filter contrast-125 brightness-105"
              />
            </div>
          </div>

          <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-[#D4A373]">
            GRUPO 3 CORAÇÕES • SISTEMA OPERACIONAL
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider font-sans mt-1">
            CENTRO DE COMANDO & CONTROLE
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            BOOT SEQUENCE PROTOCOL // SECURE TERMINAL 4K
          </p>
        </div>

        {/* Progress Bar with High-tech Ticks */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-spin" /> CARREGANDO MÓDULOS
            </span>
            <span className="text-[#D4A373] font-bold">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-[#080C13] rounded-full overflow-hidden border border-[#1F2B3E] p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#84532B] via-[#D4A373] to-[#E2B170] rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(212,163,115,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Diagnostic Steps Feed */}
        <div className="bg-[#06090F] border border-[#172130] rounded-2xl p-4 space-y-2.5 max-h-48 overflow-hidden font-mono text-[11px]">
          {BOOT_STEPS.map((step, idx) => {
            const isDone = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between transition-all duration-300 ${
                  isDone ? 'opacity-100' : 'opacity-25'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${
                    isDone ? 'text-emerald-400' : 'text-slate-500'
                  }`} />
                  <span className={`truncate ${
                    isCurrent ? 'text-[#D4A373] font-bold' : isDone ? 'text-slate-200' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                  isDone
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                    : 'text-slate-600'
                }`}>
                  {isDone ? 'OK' : 'PENDING'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Manual Skip Button */}
        <div className="mt-6 flex justify-between items-center">
          <span className="text-[10px] font-mono text-slate-500">
            SECURITY KEY: 3C-CORP-SEC-V8
          </span>
          <button
            type="button"
            onClick={onComplete}
            className="px-4 py-1.5 rounded-xl bg-[#141C29] border border-[#25354D] hover:border-[#D4A373] text-[11px] font-bold text-[#D4A373] hover:text-white transition-all cursor-pointer shadow-sm"
          >
            Acessar Imediatamente →
          </button>
        </div>

      </div>
    </div>
  );
}
