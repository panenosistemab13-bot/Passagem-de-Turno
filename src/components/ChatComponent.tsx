import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Leader } from '../types';
import { Send, Hash, MoreVertical, Search, Paperclip, Smile } from 'lucide-react';

export default function ChatComponent({ messages, leaders, selectedLeaderId, isAdmin, onSendMessage, onSimulateReply, onClearChat }: any) {
  const [msg, setMsg] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const currentLeader = leaders.find((l: any) => l.id === selectedLeaderId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    onSendMessage({
      id: crypto.randomUUID(),
      senderId: currentLeader?.id || 'admin',
      senderName: currentLeader?.name || 'Administrador',
      content: msg.trim(),
      timestamp: new Date().toISOString(),
      isSystem: false
    });
    setMsg('');
    onSimulateReply();
  };

  return (
    <div className="h-[calc(100vh-120px)] max-w-6xl mx-auto flex bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Sidebar Channels */}
      <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-wider mb-3">Comunicação</h2>
          <div className="relative">
            <input type="text" placeholder="Buscar canal..." className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500" />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Canais Oficiais</div>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs">
            <Hash className="w-4 h-4" /> Operação Central
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-xs">
            <Hash className="w-4 h-4" /> Logística Frota
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-xs">
            <Hash className="w-4 h-4" /> Gestão de Riscos
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-black text-lg">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0F172A]">Operação Central</h3>
              <p className="text-[10px] text-slate-500 font-medium">Equipe de apoio e registro de turnos.</p>
            </div>
          </div>
          {isAdmin && (
            <button onClick={onClearChat} className="text-[10px] uppercase font-bold text-slate-400 hover:text-red-600 transition-colors">Limpar Histórico</button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full">Início da Conversa</span>
          </div>
          {messages.map((m: any) => {
            const isMe = m.senderId === (currentLeader?.id || 'admin');
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-700">{m.senderName}</span>
                  <span className="text-[9px] text-slate-400 font-medium">{new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
                  m.isSystem ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                  isMe ? 'bg-[#1E40AF] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 shadow-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSend} className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <button type="button" className="p-2 text-slate-400 hover:text-blue-600"><Paperclip className="w-5 h-5" /></button>
            <textarea
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder="Digite sua mensagem corporativa..."
              className="flex-1 bg-transparent border-none resize-none focus:outline-none text-sm py-2 max-h-32 text-slate-700 font-medium"
              rows={1}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <button type="submit" disabled={!msg.trim()} className="p-2 bg-[#1E40AF] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
