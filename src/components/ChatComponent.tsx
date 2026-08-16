import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Leader } from '../types';
import { Send, Hash, MoreVertical, Search, Paperclip, Smile, Coffee, Shield } from 'lucide-react';

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
    <div className="h-[calc(100vh-140px)] max-w-6xl mx-auto flex bg-[#121620] border border-[#222B3B] rounded-3xl shadow-2xl overflow-hidden text-[#E2E8F0]">
      
      {/* Sidebar Channels */}
      <div className="w-72 bg-[#0E1218] border-r border-[#1E2838] flex flex-col hidden md:flex">
        <div className="p-5 border-b border-[#1E2838]">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A373]">
            COMUNICAÇÃO SEGURA
          </span>
          <h2 className="text-sm font-black text-white uppercase tracking-wider mb-3 font-serif">Canais de Rádio</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar canal..." 
              className="w-full bg-[#1A2230] border border-[#2A374C] rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A373]" 
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 tracking-wider">Canais de Plantão</div>
          <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#C68A4C] to-[#E2B170] text-black font-bold text-xs shadow-md cursor-pointer text-left">
            <Hash className="w-4 h-4 shrink-0 text-black" /> Operação & Portaria
          </button>
          <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#161D27] font-medium text-xs transition-colors cursor-pointer text-left">
            <Hash className="w-4 h-4 shrink-0 text-slate-500" /> Logística & Frota
          </button>
          <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#161D27] font-medium text-xs transition-colors cursor-pointer text-left">
            <Hash className="w-4 h-4 shrink-0 text-slate-500" /> Gestão de Riscos & TI
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#121620]">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-[#1E2838] flex items-center justify-between bg-[#0E1218]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A2230] border border-[#2A374C] text-[#E2B170] flex items-center justify-center font-black">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-serif">Operação & Portaria Matriz</h3>
              <p className="text-[10px] text-[#D4A373] font-medium">Comunicação criptografada com a equipe em tempo real.</p>
            </div>
          </div>
          {isAdmin && (
            <button 
              onClick={onClearChat} 
              className="text-[10px] uppercase font-bold text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              Limpar Histórico
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#121620]/60">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 bg-[#1A2230] border border-[#2A374C] px-3.5 py-1 rounded-full">
              Início do Canal de Plantão
            </span>
          </div>
          {messages.map((m: any) => {
            const isMe = m.senderId === (currentLeader?.id || 'admin');
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1 px-1">
                  <span className="text-xs font-bold text-slate-300">{m.senderName}</span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                  m.isSystem ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  isMe ? 'bg-gradient-to-r from-[#C68A4C] to-[#E2B170] text-black font-medium shadow-lg' : 'bg-[#1A2230] border border-[#2A374C] text-slate-200 shadow-md'
                }`}>
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-[#0E1218] border-t border-[#1E2838]">
          <form onSubmit={handleSend} className="flex items-center gap-2 bg-[#1A2230] border border-[#2A374C] rounded-2xl p-2 focus-within:border-[#D4A373] transition-all">
            <button type="button" className="p-2 text-slate-400 hover:text-[#E2B170] transition-colors cursor-pointer">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder="Digite sua mensagem corporativa..."
              className="flex-1 bg-transparent border-none focus:outline-none text-xs py-1 text-white placeholder:text-slate-500"
            />
            <button 
              type="submit" 
              disabled={!msg.trim()} 
              className="p-2 bg-gradient-to-r from-[#C68A4C] to-[#E2B170] text-black font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
