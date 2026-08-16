import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#1C222E] bg-[#070A0E] py-4 px-6 md:px-10 text-xs text-[#94A3B8]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Left Side: Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#94612D] via-[#E2B170] to-[#55371A] p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-[#0A0D12] rounded-full flex items-center justify-center">
              <span className="font-serif font-black text-[9px] text-[#E2B170]">3C</span>
            </div>
          </div>
          <span className="font-medium text-slate-300">
            <strong className="text-[#D4A373]">Café Três Corações</strong> - Sistema de Gestão de Segurança
          </span>
        </div>

        {/* Right Side: Version & Copyright */}
        <div className="text-[11px] text-slate-500 font-medium">
          <span>Versão 3.0.0</span>
          <span className="mx-2">•</span>
          <span>Todos os direitos reservados</span>
        </div>

      </div>
    </footer>
  );
}
