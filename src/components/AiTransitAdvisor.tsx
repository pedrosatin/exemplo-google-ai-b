import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  MessageSquare,
  Compass,
  Lightbulb,
  Clock,
  Shield,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { CityTransitData, TransitRoute } from '../types';

interface AiTransitAdvisorProps {
  city: CityTransitData;
  activeRoute: TransitRoute | null;
  originText: string;
  destText: string;
  onClose: () => void;
}

export const AiTransitAdvisor: React.FC<AiTransitAdvisorProps> = ({
  city,
  activeRoute,
  originText,
  destText,
  onClose,
}) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; timestamp: string }[]
  >([
    {
      role: 'assistant',
      text: `Olá! Sou seu assistente de mobilidade urbana para **${city.name}** 🚇. \n\nPosso te ajudar com dicas para evitar lotação no horário de pico, regras de integração do **${city.cardName}**, melhor vagão para baldeação rápida ou rotas alternativas com malas e bicicletas. Como posso ajudar?`,
      timestamp: 'Agora',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    { label: 'Como evitar lotação às 18h?', icon: <Clock className="w-3.5 h-3.5" /> },
    { label: 'Melhor vagão para baldeação?', icon: <Compass className="w-3.5 h-3.5" /> },
    { label: 'Como funciona a integração tarifária?', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { label: 'Dicas de segurança e malas no trajeto?', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  const handleSend = async (customQuery?: string) => {
    const q = (customQuery || question).trim();
    if (!q || isLoading) return;

    const userMsg = {
      role: 'user' as const,
      text: q,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/transit-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: city.name,
          origin: originText || activeRoute?.legs[0]?.fromStation?.name || 'Origem',
          destination: destText || activeRoute?.legs[activeRoute.legs.length - 1]?.toStation?.name || 'Destino',
          routeSummary: activeRoute ? {
            title: activeRoute.title,
            duration: activeRoute.totalDurationMinutes,
            modes: activeRoute.summaryModes.map(m => m.name),
            fare: activeRoute.totalFare
          } : undefined,
          userQuestion: q
        })
      });

      const data = await res.json();
      const assistantMsg = {
        role: 'assistant' as const,
        text: data.advice || 'Desculpe, não consegui obter informações no momento.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: '💡 Dica Geral: Para baldeações mais rápidas nesta linha, embarque nos vagões centrais e mantenha o cartão de transporte recarregado para evitar filas nos bloqueios.',
          timestamp: 'Agora'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Assistente de Transporte IA
              </h3>
              <p className="text-xs text-slate-400">
                Estratégias inteligentes de viagem para {city.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-800/90 border border-slate-700/70 text-slate-200 rounded-bl-none shadow'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[10px] mt-1.5 ${
                    msg.role === 'user' ? 'text-cyan-100/70 text-right' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3 text-xs text-slate-300 flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span>Consultando informações de trânsito em tempo real...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggested Questions */}
        <div className="px-4 py-2 bg-slate-950/50 border-t border-slate-800 flex gap-2 overflow-x-auto text-xs">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q.label)}
              className="shrink-0 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 flex items-center gap-1.5 text-[11px] transition-all"
            >
              {q.icon}
              <span>{q.label}</span>
            </button>
          ))}
        </div>

        {/* Question Input */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Pergunte sobre horários, melhor vagão, tarifas ou rotas..."
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!question.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-all shadow cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
