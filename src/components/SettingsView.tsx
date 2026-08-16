import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Bell, 
  Database, 
  Lock, 
  Smartphone, 
  Save, 
  CheckCircle2,
  RefreshCw,
  Server
} from 'lucide-react';

export default function SettingsView() {
  const [saved, setSaved] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [smsCritical, setSmsCritical] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [securityLevel, setSecurityLevel] = useState('Nível Corporativo 3C (Criptografia AES-256)');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 text-[#E2E8F0]">
      
      {/* Header */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4A373]">
          PARÂMETROS DO SISTEMA
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-serif">
          Configurações & Governança de Segurança
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ajustes de telemetria, permissões de acesso e notificações em tempo real
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold">
            Configurações salvas e propagadas para todos os terminais operacionais!
          </p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Security Box */}
        <div className="rounded-3xl bg-[#121620] border border-[#222B3B] p-6 shadow-2xl space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#D4A373]" />
            Políticas de Acesso & Criptografia
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Perfil de Segurança Ativo</label>
              <select 
                value={securityLevel} 
                onChange={(e) => setSecurityLevel(e.target.value)}
                className="w-full bg-[#1A2230] border border-[#2A374C] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A373]"
              >
                <option>Nível Corporativo 3C (Criptografia AES-256)</option>
                <option>Nível Estrito (Autenticação Duplo Fator Obrigatória)</option>
                <option>Nível Emergencial / Quarentena</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#18202D] border border-[#28354A] flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Sessão Segura por IP Fixo</p>
                <p className="text-[10px] text-slate-400">Restringir acesso a computadores autorizados da rede 3 Corações.</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded accent-[#D4A373] w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-3xl bg-[#121620] border border-[#222B3B] p-6 shadow-2xl space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#D4A373]" />
            Canais de Alerta & Notificação
          </h3>

          <div className="space-y-3 text-xs">
            <label className="p-3.5 rounded-2xl bg-[#18202D] border border-[#28354A] flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-bold text-white">Notificações Push no Navegador</p>
                <p className="text-[10px] text-slate-400">Alertas instantâneos para ocorrências prioritárias e pânicos.</p>
              </div>
              <input 
                type="checkbox" 
                checked={pushAlerts} 
                onChange={(e) => setPushAlerts(e.target.checked)}
                className="rounded accent-[#D4A373] w-4 h-4" 
              />
            </label>

            <label className="p-3.5 rounded-2xl bg-[#18202D] border border-[#28354A] flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-bold text-white">Envio de SMS para Gestores de Plantão</p>
                <p className="text-[10px] text-slate-400">Disparo automático em eventos de severidade Alta ou Crítica.</p>
              </div>
              <input 
                type="checkbox" 
                checked={smsCritical} 
                onChange={(e) => setSmsCritical(e.target.checked)}
                className="rounded accent-[#D4A373] w-4 h-4" 
              />
            </label>
          </div>
        </div>

        {/* Database & Cloud Backup */}
        <div className="rounded-3xl bg-[#121620] border border-[#222B3B] p-6 shadow-2xl space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-[#D4A373]" />
            Armazenamento & Sincronização em Nuvem
          </h3>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#18202D] border border-[#28354A]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#10241A] text-emerald-400 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-xs">Banco de Dados em Nuvem (Firestore / Google Cloud)</p>
                <p className="text-[10px] text-emerald-400">Sincronizado • Prontidão de 99.99%</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Latência: 12ms</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#C68A4C] to-[#E2B170] text-black text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Preferências</span>
          </button>
        </div>

      </form>

    </div>
  );
}
