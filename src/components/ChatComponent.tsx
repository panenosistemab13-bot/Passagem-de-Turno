import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Leader } from '../types';
import { MessageSquare, Send, Shield, Trash2, Bot } from 'lucide-react';
import ThreeDIcon from './ThreeDIcon';

interface ChatComponentProps {
  messages: ChatMessage[];
  leaders: Leader[];
  selectedLeaderId: string;
  isAdmin: boolean;
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  onSimulateReply: (senderName: string, senderRole: string, message: string) => void;
}

export default function ChatComponent({
  messages,
  leaders,
  selectedLeaderId,
  isAdmin,
  onSendMessage,
  onClearChat,
  onSimulateReply
}: ChatComponentProps) {
  
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentLeader = leaders.find(l => l.id === selectedLeaderId) || leaders[0];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim());
    setInputText('');

    // Simulate smart replies depending on keywords! This is extremely cool and highly premium.
    const textLower = inputText.toLowerCase();
    
    setTimeout(() => {
      if (textLower.includes('placa') || textLower.includes('rodotrem') || textLower.includes('viagem')) {
        onSimulateReply(
          'Jonatas Silva Matias',
          'Supervisor de Riscos',
          'Atenção, equipe. O veículo rodotrem placa SAS2D02 já passou pelo trecho MOC sem sinalizações de anormalidade. Telemetria saudável.'
        );
      } else if (textLower.includes('ajuda') || textLower.includes('erro') || textLower.includes('problema')) {
        onSimulateReply(
          'Paulo Pereira de Sousa',
          'Líder Turno C',
          'Entendido. Estou de prontidão caso precisem de apoio de campo ou suporte técnico imediato com os rastreadores.'
        );
      } else if (textLower.includes('boa noite') || textLower.includes('plantão') || textLower.includes('olá')) {
        onSimulateReply(
          'Wendel Polozzi Reis Maia',
          'Líder Turno B',
          'Boa noite! Plantão B assumido e pronto. Seguimos acompanhando os trechos!'
        );
      }
    }, 1500);

  };

  const formatMessageTime = (msgTime: string) => {
    return msgTime;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Intro Header */}
      <div className="bg-[#2C1810] text-white p-4 rounded-lg shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase text-[#C8102E] tracking-wider">Chat Operacional em Tempo Real</h2>
          <p className="text-xs text-slate-300">Canal direto de comunicação entre líderes de plantão e equipe de segurança.</p>
        </div>
        <ThreeDIcon icon={MessageSquare} color="coffee" size="md" />
      </div>

      <div className="bg-white rounded-lg border border-[#E0D8D0] overflow-hidden shadow-sm flex flex-col h-[480px]">
        
        {/* Chat Control Bar */}
        <div className="bg-[#FAF9F7] px-4 py-2.5 border-b border-[#E0D8D0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-[#2C1810]">Sala de Passagem Geral</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[#8C7B70] text-[10px] font-bold">
              Enviando como: <span className="text-[#2C1810] font-extrabold">{currentLeader.name}</span>
            </div>
            
            {/* Admin Clear Chat */}
            {isAdmin && (
              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja limpar todo o histórico do chat de turno?')) {
                    onClearChat();
                  }
                }}
                className="text-[#C8102E] hover:underline p-1 rounded transition-colors text-[10px] font-black flex items-center gap-1 cursor-pointer"
                title="Limpar Chat"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpar Histórico
              </button>
            )}
          </div>
        </div>

        {/* Message stream */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#FAF9F7]/40 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-[#8C7B70] text-xs py-16">
              Nenhuma mensagem nesta sala. Comece digitando algo abaixo!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderName === currentLeader.name;

              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col max-w-[85%] ${
                    isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  {/* Sender Metadata */}
                  <div className="flex items-center gap-1.5 mb-0.5 px-1">
                    <span className="text-[10px] font-black text-[#2C1810]">{msg.senderName}</span>
                    <span className="text-[9px] text-[#8C7B70]">({msg.senderRole})</span>
                  </div>

                  {/* Bubble body */}
                  <div 
                    className={`rounded-lg px-3 py-2 text-xs font-medium leading-relaxed shadow-sm border ${
                      isMe 
                        ? 'bg-[#C8102E] text-white border-[#a80c24] rounded-tr-none' 
                        : 'bg-white text-[#2C1810] border-[#E0D8D0] rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>

                  {/* Timestamp */}
                  <span className="text-[9px] text-[#8C7B70] mt-0.5 px-1">{formatMessageTime(msg.timestamp)}</span>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Text Input area */}
        <div className="bg-white p-3 border-t border-[#E0D8D0]">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua mensagem de plantão (digite 'placa' ou 'ajuda' para respostas rápidas)..."
              className="flex-1 bg-[#F4F1EE] border border-[#E0D8D0] rounded px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#C8102E] font-medium"
              required
            />
            <button
              type="submit"
              className="p-2.5 bg-[#C8102E] text-white rounded hover:bg-[#a80c24] transition-colors shadow-sm flex items-center justify-center cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex items-center gap-1 mt-1 text-[9px] text-[#8C7B70] font-medium">
            <Bot className="w-3 h-3 text-[#C8102E]" />
            <span>Simulador de Respostas Ativas habilitado! Tente enviar dúvidas sobre "placas" ou "erros".</span>
          </div>
        </div>

      </div>

    </div>
  );
}
