import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Lightbulb, 
  Smartphone, 
  Home, 
  ListTodo, 
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types';
import { AuraOrb } from './AuraOrb';

interface AssistantViewProps {
  messages: ChatMessage[];
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  onToggleListening: () => void;
  onSendMessage: (text: string) => void;
  transcript: string;
  onClearHistory: () => void;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  onExecuteCustomCommand: (phrase: string) => void;
}

const QUICK_PROMPTS = [
  { text: '🌅 Buenos Días', action: 'Buenos días' },
  { text: '☕ Preparar café', action: 'Prepara mi café matutino' },
  { text: '🌙 Modo Noche', action: 'Activar modo noche' },
  { text: '📋 Añadir tarea', action: 'Añadir tarea: Revisar informe de clientes a las 16:00' },
  { text: '📱 Silenciar teléfono', action: 'Poner el teléfono en modo silencio y no molestar' },
  { text: '🧹 Aspirar la casa', action: 'Pon a limpiar el robot aspirador' },
];

export const AssistantView: React.FC<AssistantViewProps> = ({
  messages,
  status,
  onToggleListening,
  onSendMessage,
  transcript,
  onClearHistory,
  highContrast,
  fontSize,
  onExecuteCustomCommand,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const getFontSizeClass = () => {
    if (fontSize === 'large') return 'text-lg';
    if (fontSize === 'xlarge') return 'text-xl';
    return 'text-sm';
  };

  return (
    <div id="assistant-view" className="flex flex-col h-full max-w-4xl mx-auto space-y-4">
      {/* Central Visualizer */}
      <div className="bg-[#111318] rounded-2xl p-4 sm:p-6 border border-[#1F242F] shadow-md">
        <AuraOrb
          status={status}
          onToggleListening={onToggleListening}
          transcript={transcript}
          highContrast={highContrast}
        />

        {/* Quick Suggestion Chips */}
        <div className="mt-2 pt-4 border-t border-[#1C202A]">
          <div className="flex items-center gap-1.5 text-xs text-[#8490A0] mb-2 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Acciones rápidas por voz o clic:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                id={`quick-prompt-${idx}`}
                onClick={() => onExecuteCustomCommand(prompt.action)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-[#161922] hover:bg-indigo-950/40 hover:text-indigo-300 text-[#C5CED9] transition-all border border-[#222834] hover:border-indigo-500/30 active:scale-95"
              >
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conversation & Action Timeline */}
      <div className="bg-[#111318] rounded-2xl p-4 sm:p-6 border border-[#1F242F] shadow-md flex-1 flex flex-col min-h-[320px]">
        <div className="flex items-center justify-between pb-3 border-b border-[#1C202A] mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="font-semibold text-sm sm:text-base text-white">
              Registro de Interacciones & Respuestas
            </h2>
          </div>
          {messages.length > 0 && (
            <button
              id="clear-history-btn"
              onClick={onClearHistory}
              title="Limpiar registro de conversación"
              className="text-xs text-[#8490A0] hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161922] hover:bg-[#1C212D] border border-[#222834] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto max-h-[380px] space-y-3.5 pr-1">
          {messages.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center text-[#8490A0]">
              <Lightbulb className="w-8 h-8 mb-2 opacity-50 text-indigo-400" />
              <p className="text-sm font-medium text-[#C5CED9]">Aún no hay mensajes recientes</p>
              <p className="text-xs max-w-xs mt-1 text-[#8490A0]">
                Di "Hola Aura", usa el micrófono arriba o escribe tu orden cotidiana.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : highContrast
                          ? 'bg-black text-white border-2 border-white rounded-bl-xs'
                          : 'bg-[#161922] text-[#EDEDED] border border-[#222834] rounded-bl-xs'
                    }`}
                  >
                    <p className={`${getFontSizeClass()} leading-relaxed`}>{msg.content}</p>

                    {/* Render executed actions badges */}
                    {msg.executedActions && msg.executedActions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#222834] space-y-1.5">
                        <span className="text-[11px] font-semibold tracking-wider uppercase text-[#8490A0] block">
                          Acciones ejecutadas:
                        </span>
                        {msg.executedActions.map((act, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs bg-[#111318] px-2.5 py-1.5 rounded-lg border border-[#1F242F] text-emerald-400 font-medium"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{act.description}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Render follow-up suggestions */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 pt-2 flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => onSendMessage(sug)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 transition-colors font-medium border border-indigo-500/30 text-left"
                          >
                            💡 {sug}
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="text-[10px] text-[#8490A0] block text-right mt-1 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Text message input form */}
        <form onSubmit={handleSubmit} className="mt-4 pt-3 border-t border-[#1C202A] flex items-center gap-2">
          <input
            id="assistant-text-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe una orden o pregunta a Aura..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#151922] border border-[#222834] text-[#EDEDED] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
          <button
            id="assistant-send-text-btn"
            type="submit"
            disabled={!inputText.trim() || status === 'processing'}
            aria-label="Enviar mensaje a Aura"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium text-sm flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer active:scale-95"
          >
            <span>Enviar</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
