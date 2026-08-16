import React, { useState } from 'react';
import { 
  Repeat, 
  CheckCircle2, 
  Clock, 
  User, 
  FileText, 
  Send, 
  AlertCircle, 
  Key, 
  Radio, 
  Layers,
  Sparkles
} from 'lucide-react';

export default function ShiftHandover() {
  const [outgoingLeader, setOutgoingLeader] = useState('Airton Carvalho');
  const [incomingLeader, setIncomingLeader] = useState('Cristiane Fialho');
  const [shiftType, setShiftType] = useState('Diurno -> Noturno (18:00)');
  const [notes, setNotes] = useState('Todas as viaturas abastecidas e em pátio. Câmera C-12 no estacionamento com chamado técnico em aberto. Equipe noturna escalada com 8 vigilantes operacionais.');
  const [keysHanded, setKeysHanded] = useState(true);
  const [radiosHanded, setRadiosHanded] = useState(true);
  const [armoryChecked, setArmoryChecked] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 text-[#E2E8F0]">
      
      {/* Header */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4A373]">
          CONTINUIDADE OPERACIONAL
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-serif">
          Passagem de Plantão & Livro de Turno
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Registro formal de transferência de responsabilidade entre líderes de segurança
        </p>
      </div>

      {submitted && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold">
            Passagem de plantão assinada e homologada com sucesso no sistema Café 3 Corações!
          </p>
        </div>
      )}

      {/* Handover Form */}
      <form onSubmit={handleSubmit} className="rounded-3xl bg-[#121620] border border-[#222B3B] p-6 sm:p-8 shadow-2xl space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Líder que Entrega o Turno</label>
            <input 
              type="text" 
              value={outgoingLeader} 
              onChange={(e) => setOutgoingLeader(e.target.value)}
              className="w-full bg-[#1A2230] border border-[#2A374C] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373]"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Líder que Assume o Turno</label>
            <input 
              type="text" 
              value={incomingLeader} 
              onChange={(e) => setIncomingLeader(e.target.value)}
              className="w-full bg-[#1A2230] border border-[#2A374C] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373]"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">Transição de Turno</label>
          <select 
            value={shiftType} 
            onChange={(e) => setShiftType(e.target.value)}
            className="w-full bg-[#1A2230] border border-[#2A374C] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373]"
          >
            <option>Diurno → Noturno (18:00)</option>
            <option>Noturno → Diurno (06:00)</option>
            <option>Turno Administrativo Intermediário</option>
          </select>
        </div>

        {/* Checklist items */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-[#D4A373] uppercase tracking-wider block">
            Checklist de Inventário e Custódia
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="p-3 rounded-xl bg-[#18202D] border border-[#28354A] flex items-center gap-3 cursor-pointer hover:border-[#D4A373] transition-colors">
              <input 
                type="checkbox" 
                checked={keysHanded} 
                onChange={(e) => setKeysHanded(e.target.checked)}
                className="rounded accent-[#D4A373]"
              />
              <div className="text-xs">
                <p className="font-bold text-white">Claviculário / Chaves</p>
                <span className="text-[10px] text-slate-400">100% conferidas</span>
              </div>
            </label>

            <label className="p-3 rounded-xl bg-[#18202D] border border-[#28354A] flex items-center gap-3 cursor-pointer hover:border-[#D4A373] transition-colors">
              <input 
                type="checkbox" 
                checked={radiosHanded} 
                onChange={(e) => setRadiosHanded(e.target.checked)}
                className="rounded accent-[#D4A373]"
              />
              <div className="text-xs">
                <p className="font-bold text-white">Rádios HT & Baterias</p>
                <span className="text-[10px] text-slate-400">12 unidades na base</span>
              </div>
            </label>

            <label className="p-3 rounded-xl bg-[#18202D] border border-[#28354A] flex items-center gap-3 cursor-pointer hover:border-[#D4A373] transition-colors">
              <input 
                type="checkbox" 
                checked={armoryChecked} 
                onChange={(e) => setArmoryChecked(e.target.checked)}
                className="rounded accent-[#D4A373]"
              />
              <div className="text-xs">
                <p className="font-bold text-white">Armeiro & Lacres</p>
                <span className="text-[10px] text-slate-400">Livro de registro OK</span>
              </div>
            </label>
          </div>
        </div>

        {/* Observations */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">
            Observações Gerais & Ocorrências Pendentes de Seguimento
          </label>
          <textarea 
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#1A2230] border border-[#2A374C] rounded-xl p-4 text-xs text-white focus:outline-none focus:border-[#D4A373] leading-relaxed"
            placeholder="Descreva pendências, manutenções em curso ou orientações especiais..."
            required
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#C68A4C] to-[#E2B170] text-black text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Repeat className="w-4 h-4" />
            <span>Homologar Passagem de Plantão</span>
          </button>
        </div>

      </form>

    </div>
  );
}
