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
        <div className="bg-white rounded-xl border border-[#E0D8D0] p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8C7B70]">Total de Ocorrências</span>
            <div className="text-2xl font-black text-[#2C1810]">{total}</div>
            <p className="text-[9px] text-[#C8102E] font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>Plantão ativo 100%</span>
            </p>
          </div>
          <ThreeDIcon icon={Activity} color="coffee" size="md" />
        </div>

        {/* Acompanhar (Acompanhar) Card */}
        <div className="bg-white rounded-xl border border-[#E0D8D0] p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8C7B70]">Sob Monitoramento</span>
            <div className="text-2xl font-black text-[#d97706]">{statusStats.acompanhar}</div>
            <p className="text-[9px] text-amber-600 font-bold">Requer atenção imediata</p>
          </div>
          <ThreeDIcon icon={ShieldAlert} color="amber" size="md" />
        </div>

        {/* Resolvido Card */}
        <div className="bg-white rounded-xl border border-[#E0D8D0] p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8C7B70]">Ocorrências Resolvidas</span>
            <div className="text-2xl font-black text-[#059669]">{statusStats.resolvido}</div>
            <p className="text-[9px] text-emerald-600 font-bold">Mitigações concluídas</p>
          </div>
          <ThreeDIcon icon={CheckCircle} color="green" size="md" />
        </div>

        {/* Para Conhecimento Card */}
        <div className="bg-white rounded-xl border border-[#E0D8D0] p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8C7B70]">Para Conhecimento</span>
            <div className="text-2xl font-black text-[#1d4ed8]">{statusStats.paraConhecimento}</div>
            <p className="text-[9px] text-blue-600 font-bold">Cientificado para a equipe</p>
          </div>
          <ThreeDIcon icon={Info} color="blue" size="md" />
        </div>

      </div>

      {/* Main Charts Section - 4K High Definition Graphics (Vector-based Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Category Breakdown (Bar Chart) */}
        <div className="bg-white rounded-xl border border-[#E0D8D0] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-1.5 border-b border-[#F4F1EE]">
            <div>
              <h3 className="text-xs font-black text-[#2C1810] uppercase tracking-wider">Ocorrências por Categoria</h3>
              <p className="text-[10px] text-[#8C7B70]">Áreas operacionais sob fiscalização</p>
            </div>
            <span className="text-[9px] font-bold bg-[#C8102E]/10 text-[#C8102E] px-2 py-0.5 rounded uppercase">Métricas</span>
          </div>
          
          <div className="w-full h-64 flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="text-[#8C7B70] text-xs py-10">Nenhum dado registrado para gerar o gráfico de categorias.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0D8D0" />
                  <XAxis dataKey="name" tick={{ fill: '#5D4037', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5D4037', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#2C1810', borderRadius: '6px', border: 'none', color: '#fff' }}
                    labelStyle={{ fontWeight: 'bold', color: '#C8102E' }}
                  />
                  <Bar dataKey="Quantidade" fill="#C8102E" radius={[3, 3, 0, 0]} barSize={24}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#C8102E' : '#3D261C'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Risk Distribution (Pie Chart with Glossy Visuals) */}
        <div className="bg-white rounded-xl border border-[#E0D8D0] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-1.5 border-b border-[#F4F1EE]">
            <div>
              <h3 className="text-xs font-black text-[#2C1810] uppercase tracking-wider">Níveis de Risco do Plantão</h3>
              <p className="text-[10px] text-[#8C7B70]">Proporção de severidade dos riscos</p>
            </div>
            <span className="text-[9px] font-bold bg-[#3D261C]/10 text-[#2C1810] px-2 py-0.5 rounded uppercase">Nível Geral</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 items-center">
            <div className="sm:col-span-3 h-64 flex items-center justify-center">
              {riskStats.length === 0 ? (
                <div className="text-[#8C7B70] text-xs py-10">Nenhum risco registrado no plantão de hoje.</div>
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
                      contentStyle={{ backgroundColor: '#2C1810', borderRadius: '6px', border: 'none', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Premium Legend List */}
            <div className="sm:col-span-2 space-y-2 pr-2">
              {riskStats.map((risk, index) => (
                <div key={index} className="flex items-center justify-between bg-[#F4F1EE] p-2 rounded-lg border border-[#E0D8D0]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: risk.color }} />
                    <span className="text-[11px] font-bold text-[#5D4037]">{risk.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-[#2C1810] bg-white px-1.5 py-0.5 rounded border border-[#E0D8D0]">
                    {risk.value}
                  </span>
                </div>
              ))}
              {riskStats.length === 0 && (
                <div className="text-[11px] text-[#8C7B70] text-center py-4">Sem dados estatísticos.</div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Corporate Monitoring Tables - Mirroring the style in image.png */}
      <div className="bg-white rounded-xl border border-[#E0D8D0] shadow-sm overflow-hidden">
        
        {/* Table Header Section */}
        <div className="bg-[#2C1810] text-white p-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#3D261C]">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#C8102E]" />
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider">Escala e Monitoramento Ativo de Rodotrens</h3>
              <p className="text-[10px] text-[#A6897E]">Viagens registradas sob fiscalização para Café Três Corações</p>
            </div>
          </div>
          <button 
            onClick={() => onSelectTab('registrar')}
            className="text-[10px] font-bold bg-[#C8102E] text-white px-3 py-1.5 rounded-lg hover:bg-[#a80c24] transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <Plus className="w-3 h-3" /> Adicionar Ocorrência
          </button>
        </div>

        {/* Exact look-alike table layout from image.png */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#3D261C] text-white uppercase font-black tracking-wider text-[9px] border-b border-[#4D362C]">
                <th className="py-2.5 px-4 border-r border-[#4D362C]">Data / Plantão</th>
                <th className="py-2.5 px-4 border-r border-[#4D362C]">Líder do Registro</th>
                <th className="py-2.5 px-4 border-r border-[#4D362C]">Ocorrência / Título</th>
                <th className="py-2.5 px-4 border-r border-[#4D362C]">Categoria</th>
                <th className="py-2.5 px-4 border-r border-[#4D362C]">Nível Risco</th>
                <th className="py-2.5 px-4">Status / Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D8D0] text-[#2C1810]">
              {occurrences.slice(0, 5).map((occ) => (
                <tr key={occ.id} className="hover:bg-[#F4F1EE]/50 transition-colors">
                  <td className="py-2 px-4 font-bold text-[#2C1810] border-r border-[#E0D8D0] whitespace-nowrap bg-[#FAF9F7]">
                    {occ.shiftDate}
                  </td>
                  <td className="py-2 px-4 border-r border-[#E0D8D0] font-medium">
                    {occ.leaderName}
                  </td>
                  <td className="py-2 px-4 border-r border-[#E0D8D0] font-bold max-w-xs truncate">
                    {occ.title}
                  </td>
                  <td className="py-2 px-4 border-r border-[#E0D8D0] font-semibold whitespace-nowrap text-[#5D4037]">
                    {occ.category}
                  </td>
                  <td className="py-2 px-4 border-r border-[#E0D8D0] whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase border ${
                      occ.riskLevel === 'Crítico' ? 'bg-red-50 text-red-700 border-red-200' :
                      occ.riskLevel === 'Alto' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      occ.riskLevel === 'Médio' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {occ.riskLevel}
                    </span>
                  </td>
                  <td className="py-2 px-4 whitespace-nowrap">
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
                  <td colSpan={6} className="py-8 px-4 text-center text-[#8C7B70]">
                    Nenhuma ocorrência registrada no sistema. Clique em "Adicionar Ocorrência" para começar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* View history trigger button */}
        <div className="bg-[#FAF9F7] p-2.5 text-center border-t border-[#E0D8D0]">
          <button
            onClick={() => onSelectTab('historico')}
            className="text-[11px] font-black text-[#C8102E] hover:underline"
          >
            Ver Histórico Completo de Incidentes →
          </button>
        </div>

      </div>

    </div>
  );
}
