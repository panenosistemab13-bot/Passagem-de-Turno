import React, { useState } from 'react';
import { 
  Video, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  ShieldCheck, 
  Sliders, 
  AlertCircle, 
  Layers, 
  Camera, 
  CircleDot,
  CheckCircle2,
  RefreshCw,
  Clock,
  Scan,
  Eye,
  Crosshair,
  Sparkles,
  Sun,
  Moon,
  Flame
} from 'lucide-react';
import ThreeDCard from './ThreeDCard';

export default function CameraMonitoring() {
  const [selectedFeed, setSelectedFeed] = useState<string>('cam-1');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [visionMode, setVisionMode] = useState<'normal' | 'thermal' | 'night'>('normal');

  const cameras = [
    {
      id: 'cam-1',
      name: 'CAM 01 - Portaria Principal & Cargas',
      unit: 'Unidade Fortaleza / CE',
      status: 'online',
      resolution: '4K • 60 FPS',
      aiStatus: 'Reconhecimento LPR / Placas Ativo',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      motion: 'Movimento detectado: Carreta BRA-2E34'
    },
    {
      id: 'cam-2',
      name: 'CAM 02 - Linha de Torrefação & Moagem',
      unit: 'Planta Industrial Eusébio',
      status: 'online',
      resolution: '1080p • 30 FPS',
      aiStatus: 'Sensor Térmico Normal (42°C)',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      motion: 'Operação regular em esteiras'
    },
    {
      id: 'cam-3',
      name: 'CAM 03 - Armazém Café Cru & Silos',
      unit: 'CD Varginha / MG',
      status: 'online',
      resolution: '1080p • 30 FPS',
      aiStatus: 'Controle de Umidade Conforme',
      image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      motion: 'Empilhadeira 03 em trânsito'
    },
    {
      id: 'cam-4',
      name: 'CAM 04 - Pátio de Estacionamento & Balança',
      unit: 'Unidade Fortaleza / CE',
      status: 'online',
      resolution: '4K • 60 FPS',
      aiStatus: 'Perímetro Livre',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      motion: 'Área externa desimpedida'
    },
    {
      id: 'cam-5',
      name: 'CAM 05 - Perímetro Norte & Cerca Virtual',
      unit: 'Fábrica Natal / RN',
      status: 'online',
      resolution: '1080p • 30 FPS',
      aiStatus: 'Barreira Infravermelha OK',
      image: 'https://images.unsplash.com/photo-1508873696983-2df57046475a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      motion: 'Sem violações'
    },
    {
      id: 'cam-6',
      name: 'CAM 06 - Sala de Controle & CFTV Central',
      unit: 'Matriz Fortaleza / CE',
      status: 'online',
      resolution: '1080p • 30 FPS',
      aiStatus: 'Operador Presente',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      motion: 'Plantão Diurno Ativo'
    }
  ];

  const currentCam = cameras.find(c => c.id === selectedFeed) || cameras[0];

  return (
    <div className="space-y-6 max-w-full overflow-hidden text-[#E2E8F0] select-none">
      
      {/* 3D Master Header */}
      <ThreeDCard className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#D4A373] flex items-center gap-1.5">
              <Scan className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> CFTV ANALYTICS & AI SURVEILLANCE
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight mt-1">
              Central de Vigilância & Câmeras 4K
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitoramento em tempo real de 48 canais com detecção de movimento e inteligência perimetral.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#0A0E17] p-1 rounded-xl border border-[#1E2B40]">
              <button
                onClick={() => setVisionMode('normal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  visionMode === 'normal' ? 'bg-[#D4A373] text-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Óptico
              </button>
              <button
                onClick={() => setVisionMode('night')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  visionMode === 'night' ? 'bg-emerald-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Noturno
              </button>
              <button
                onClick={() => setVisionMode('thermal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  visionMode === 'thermal' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" /> Térmico
              </button>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> 48/48 ONLINE
            </div>
          </div>
        </div>
      </ThreeDCard>

      {/* Main Video Stream & Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Large Active Camera Stream (8 Cols) */}
        <div className="lg:col-span-8">
          <ThreeDCard className="p-0 overflow-hidden">
            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              <img 
                src={currentCam.image} 
                alt={currentCam.name}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  visionMode === 'night' ? 'filter hue-rotate-90 brightness-125 contrast-150 saturate-200' :
                  visionMode === 'thermal' ? 'filter invert hue-rotate-180 contrast-200 saturate-200' : ''
                }`}
              />

              {/* Holographic Tactical HUD Overlays */}
              <div className="absolute inset-0 border border-emerald-500/20 pointer-events-none" />
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-mono text-xs text-white flex items-center gap-2">
                <CircleDot className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span className="font-bold">{currentCam.name}</span>
              </div>

              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-mono text-xs text-emerald-400">
                {currentCam.resolution}
              </div>

              {/* AI Bounding Box Simulation */}
              <div className="absolute top-1/3 left-1/4 w-48 h-32 border-2 border-dashed border-emerald-400/80 rounded-lg pointer-events-none flex flex-col justify-between p-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <span className="text-[9px] font-mono font-bold bg-emerald-500 text-black px-1 rounded w-max">
                  IA: VEÍCULO DETECTADO (98%)
                </span>
                <span className="text-[8px] font-mono text-emerald-300 self-end">
                  LPR: BRA-2E34
                </span>
              </div>

              {/* Bottom Stream Status */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-between bg-black/75 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs font-mono">
                <span className="text-[#D4A373] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> {currentCam.aiStatus}
                </span>
                <span className="text-slate-400">
                  {currentCam.motion}
                </span>
              </div>
            </div>
          </ThreeDCard>
        </div>

        {/* Thumbnail Selector Grid (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          {cameras.map((cam) => (
            <div
              key={cam.id}
              onClick={() => setSelectedFeed(cam.id)}
              className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                selectedFeed === cam.id
                  ? 'bg-[#182436] border-[#D4A373] shadow-[0_0_20px_rgba(212,163,115,0.2)] translate-x-1'
                  : 'bg-[#090D14] border-[#1A2536] hover:border-[#2A3F5C]'
              }`}
            >
              <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-black shrink-0">
                <img 
                  src={cam.image} 
                  alt={cam.name} 
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[8px] font-mono text-emerald-400">
                  LIVE
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{cam.name}</p>
                <p className="text-[10px] font-mono text-slate-400 truncate">{cam.unit}</p>
                <p className="text-[9px] font-mono text-[#D4A373] mt-0.5 truncate">{cam.aiStatus}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
