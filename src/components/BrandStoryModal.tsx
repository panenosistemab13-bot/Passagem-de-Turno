import React from 'react';
import { X, Award, Shield, Heart, Coffee, CheckCircle } from 'lucide-react';
import { ASSETS } from '../assets/brandAssets';

export interface BrandStoryModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export default function BrandStoryModal({ isOpen = true, onClose }: BrandStoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0E131C] border border-[#C68A4C]/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-[#E2E8F0] overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#18202D] text-slate-400 hover:text-white hover:bg-[#253247] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with 3C Emblem */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-[#94612D] via-[#E2B170] to-[#55371A] shadow-xl flex items-center justify-center">
            <img 
              src={ASSETS.badgeLogo} 
              alt="Café Três Corações" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <span className="text-xs font-black tracking-widest text-[#D4A373] uppercase font-cinzel">
              CAFÉ TRÊS CORAÇÕES
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-serif">
              Tradição, Proteção & Excelência
            </h2>
            <p className="font-script text-xl text-[#E2B170]">
              Desde 1959
            </p>
          </div>
        </div>

        {/* Story Body */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <p>
            O <strong className="text-white">Grupo 3corações</strong> é líder nacional no segmento de café torrado e moído. Nascido no coração de Minas Gerais e expandido estrategicamente para o Nordeste e todo o território brasileiro, nosso compromisso diário vai além de produzir o melhor café: cuidamos de cada colaborador, patrimônio e operação com os mais rigorosos padrões de segurança e tecnologia.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
            <div className="p-4 rounded-2xl bg-[#141A25] border border-[#232F42] flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#2E2015] text-[#D4A373] flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-xs">Segurança Integrada</h4>
              <p className="text-[11px] text-slate-400">Monitoramento 24/7 de plantas industriais e centros de distribuição.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141A25] border border-[#232F42] flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#2E2015] text-[#D4A373] flex items-center justify-center">
                <Coffee className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-xs">Paixão por Café</h4>
              <p className="text-[11px] text-slate-400">Tradição artesanal combinada à mais alta inovação operacional.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141A25] border border-[#232F42] flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#2E2015] text-[#D4A373] flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-xs">Cuidado Humano</h4>
              <p className="text-[11px] text-slate-400">Ambiente seguro e protegido para mais de 10.000 colaboradores.</p>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Este sistema corporativo unifica o controle de ocorrências, gestão de riscos, despacho operacional de frotas e telemetria para garantir total prontidão e tranquilidade.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#1C2534] flex items-center justify-between">
          <span className="text-[11px] text-[#D4A373] font-semibold">
            Fortaleza • Varginha • Natal • Montes Claros • Salvador
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C68A4C] to-[#E2B170] text-black text-xs font-bold hover:brightness-110 transition-all shadow-md"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
