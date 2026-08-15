import React from 'react';
import { Occurrence, OccurrenceStatus } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  Info, 
  TrendingUp, 
  Truck,
  Coffee,
  Plus
} from 'lucide-react';
import ThreeDIcon from './ThreeDIcon';

interface DashboardStatusProps {
  occurrences: Occurrence[];
  onSelectTab: (tab: string) => void;
}

export default function DashboardStatus({ occurrences, onSelectTab }: DashboardStatusProps) {
  
  // Calculate statistics
  const total = occurrences.length;
  const countByStatus = (status: OccurrenceStatus) => occurrences.filter(o => o.status === status).length;
  const countByRisk = (risk: string) => occurrences.filter(o => o.riskLevel === risk).length;

  const statusStats = {
    acompanhar: countByStatus('acompanhar'),
    resolvido: countByStatus('resolvido'),
    paraConhecimento: countByStatus('para conhecimento')
  };

  const riskStats = [
    { name: 'Baixo', value: countByRisk('Baixo'), color: '#10b981' },
    { name: 'Médio', value: countByRisk('Médio'), color: '#f59e0b' },
    { name: 'Alto', value: countByRisk('Alto'), color: '#f97316' },
    { name: 'Crítico', value: countByRisk('Crítico'), color: '#ef4444' }
  ].filter(r => r.value > 0);

  // Distribution by Category
  const categoriesList = ['Segurança', 'Operação', 'Logística', 'Qualidade', 'Manutenção', 'Outros'];
  const categoryData = categoriesList.map(cat => ({
    name: cat,
    Quantidade: occurrences.filter(o => o.category === cat).length
  })).filter(item => item.Quantidade > 0);

  // Status breakdown data for simple visual chart
  const statusChartData = [
    { name: 'Acompanhar', value: statusStats.acompanhar, color: '#f59e0b' },
    { name: 'Resolvido', value: statusStats.resolvido, color: '#10b981' },
    { name: 'Conhecimento', value: statusStats.paraConhecimento, color: '#3b82f6' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Upper Highlight Metric Row - Sophisticated Flat Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Metric Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Total de Ocorrências</span>
            <div className="text-2xl font-black text-[#0F172A]">{total}</div>
            <p className="text-[9px] text-[#2563EB] font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>Plantão ativo 100%</span>
            </p>
          </div>
          <ThreeDIcon icon={Activity} color="coffee" size="md" />
        </div>

        {/* Acompanhar (Acompanhar) Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Sob Monitoramento</span>
            <div className="text-2xl font-black text-[#d97706]">{statusStats.acompanhar}</div>
            <p className="text-[9px] text-amber-600 font-bold">Requer atenção imediata</p>
          </div>
          <ThreeDIcon icon={ShieldAlert} color="amber" size="md" />
        </div>

        {/* Resolvido Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Ocorrências Resolvidas</span>
            <div className="text-2xl font-black text-[#059669]">{statusStats.resolvido}</div>
            <p className="text-[9px] text-emerald-600 font-bold">Mitigações concluídas</p>
          </div>
          <ThreeDIcon icon={CheckCircle} color="green" size="md" />
        </div>

        {/* Para Conhecimento Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Para Conhecimento</span>
            <div className="text-2xl font-black text-[#1d4ed8]">{statusStats.paraConhecimento}</div>
            <p className="text-[9px] text-blue-600 font-bold">Cientificado para a equipe</p>
          </div>
          <ThreeDIcon icon={Info} color="blue" size="md" />
        </div>

      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Category Breakdown (Bar Chart) */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-1.5 border-b border-[#F1F5F9]">
            <div>
              <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Ocorrências por Categoria</h3>
              <p className="text-[10px] text-[#64748B]">Áreas operacionais sob fiscalização</p>
            </div>
            <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded uppercase border border-blue-200">Métricas</span>
          </div>
          
          <div className="w-full h-64 flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="text-[#64748B] text-xs py-10">Nenhum dado registrado para gerar o gráfico de categorias.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#334155', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff' }}
                    labelStyle={{ fontWeight: 'bold', color: '#60A5FA' }}
                  />
                  <Bar dataKey="Quantidade" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={24}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563EB' : '#1E40AF'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Risk Distribution (Pie Chart with Glossy Visuals) */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-1.5 border-b border-[#F1F5F9]">
            <div>
              <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Níveis de Risco do Plantão</h3>
              <p className="text-[10px] text-[#64748B]">Proporção de severidade dos riscos</p>
            </div>
            <span className="text-[9px] font-bold bg-slate-100 text-[#0F172A] px-2 py-0.5 rounded uppercase border border-slate-200">Nível Geral</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 items-center">
            <div className="sm:col-span-3 h-64 flex items-center justify-center">
              {riskStats.length === 0 ? (
                <div className="text-[#64748B] text-xs py-10">Nenhum risco registrado no plantão de hoje.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {riskStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Legend List */}
            <div className="sm:col-span-2 space-y-2 pr-2">
              {riskStats.map((risk, index) => (
                <div key={index} className="flex items-center justify-between bg-[#F1F5F9] p-2 rounded-lg border border-[#E2E8F0]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: risk.color }} />
                    <span className="text-[11px] font-bold text-[#334155]">{risk.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-[#0F172A] bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                    {risk.value}
                  </span>
                </div>
              ))}
              {riskStats.length === 0 && (
                <div className="text-[11px] text-[#64748B] text-center py-4">Sem dados estatísticos.</div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Corporate Monitoring Tables */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        
        {/* Table Header Section */}
        <div className="bg-[#0F172A] text-white p-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#2563EB]" />
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider">Escala e Monitoramento Ativo de Rodotrens</h3>
              <p className="text-[10px] text-[#94A3B8]">Viagens registradas sob fiscalização para Café Três Corações</p>
            </div>
          </div>
          <button 
            onClick={() => onSelectTab('registrar')}
            className="text-[10px] font-bold bg-[#2563EB] text-white px-3 py-1.5 rounded-lg hover:bg-[#1D4ED8] transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <Plus className="w-3 h-3" /> Adicionar Ocorrência
          </button>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1E293B] text-white uppercase font-black tracking-wider text-[9px] border-b border-[#334155]">
                <th className="py-2.5 px-3 border-r border-[#334155]">Data / Plantão</th>
                <th className="py-2.5 px-3 border-r border-[#334155]">Líder do Registro</th>
                <th className="py-2.5 px-3 border-r border-[#334155]">Placa / Transp. / Unidade</th>
                <th className="py-2.5 px-3 border-r border-[#334155]">Ocorrência / Título</th>
                <th className="py-2.5 px-3 border-r border-[#334155]">Nível Risco</th>
                <th className="py-2.5 px-3">Status / Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
              {occurrences.slice(0, 6).map((occ) => (
                <tr key={occ.id} className="hover:bg-[#F1F5F9]/70 transition-colors">
                  <td className="py-2 px-3 font-bold text-[#0F172A] border-r border-[#E2E8F0] whitespace-nowrap bg-[#F8FAFC]">
                    {occ.shiftDate}
                  </td>
                  <td className="py-2 px-3 border-r border-[#E2E8F0] font-medium whitespace-nowrap">
                    {occ.leaderName}
                  </td>
                  <td className="py-2 px-3 border-r border-[#E2E8F0] whitespace-nowrap">
                    {occ.plate ? (
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="font-mono text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[10px]">
                          {occ.plate}
                        </span>
                        <span className="text-[10px] text-[#64748B] max-w-[120px] truncate">
                          {occ.carrier || occ.unit || 'Frota 3C'}
                        </span>
                      </div>
                    ) : occ.recordType === 'instabilidade' ? (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                        ⚡ {occ.instabilitySystem || 'Instabilidade'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#64748B]">-</span>
                    )}
                  </td>
                  <td className="py-2 px-3 border-r border-[#E2E8F0] font-bold max-w-xs truncate">
                    {occ.title}
                  </td>
                  <td className="py-2 px-3 border-r border-[#E2E8F0] whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase border ${
                      occ.riskLevel === 'Crítico' ? 'bg-red-50 text-red-700 border-red-200' :
                      occ.riskLevel === 'Alto' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      occ.riskLevel === 'Médio' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {occ.riskLevel}
                    </span>
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border ${
                      occ.status === 'resolvido' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      occ.status === 'acompanhar' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {occ.status === 'resolvido' ? '✓ Resolvido' : 
                       occ.status === 'acompanhar' ? '⚠ Acompanhar' : 
                       'ℹ Conhecimento'}
                    </span>
                  </td>
                </tr>
              ))}
              {occurrences.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-[#64748B]">
                    Nenhuma ocorrência registrada no sistema. Clique em "Adicionar Ocorrência" para começar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* View history trigger button */}
        <div className="bg-[#F8FAFC] p-2.5 text-center border-t border-[#E2E8F0]">
          <button
            onClick={() => onSelectTab('historico')}
            className="text-[11px] font-black text-[#2563EB] hover:underline cursor-pointer"
          >
            Ver Histórico Completo de Incidentes →
          </button>
        </div>

      </div>

    </div>
  );
}
