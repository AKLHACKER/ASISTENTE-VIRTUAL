import React from 'react';
import { Mic, MicOff, Sparkles, Volume2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AuraOrbProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  onToggleListening: () => void;
  transcript?: string;
  highContrast?: boolean;
}

export const AuraOrb: React.FC<AuraOrbProps> = ({
  status,
  onToggleListening,
  transcript,
  highContrast,
}) => {
  const isListening = status === 'listening';
  const isProcessing = status === 'processing';
  const isSpeaking = status === 'speaking';

  return (
    <div id="aura-orb-container" className="flex flex-col items-center justify-center text-center py-6 select-none">
      {/* Orb Visualization Area */}
      <div className="relative flex items-center justify-center mb-5 w-44 h-44 sm:w-52 sm:h-52">
        {/* Outer Ripple Rings */}
        {isListening && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full bg-emerald-500/20 dark:bg-emerald-400/20"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full bg-teal-500/20 dark:bg-teal-400/20"
            />
          </>
        )}

        {isProcessing && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="absolute inset-[-12px] rounded-full border-2 border-dashed border-indigo-500/60 dark:border-indigo-400/60"
          />
        )}

        {isSpeaking && (
          <motion.div
            animate={{ scale: [1, 1.15, 0.98, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-[-8px] rounded-full bg-amber-400/15 dark:bg-amber-400/20 blur-md"
          />
        )}

        {/* Core Glowing Orb Button */}
        <motion.button
          id="main-voice-orb-btn"
          onClick={onToggleListening}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          aria-label={
            isListening 
              ? 'Detener escucha por voz' 
              : 'Activar micrófono y hablar con Aura'
          }
          className={`relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl focus:outline-none focus:ring-4 ${
            highContrast
              ? isListening
                ? 'bg-white text-black ring-4 ring-emerald-400 font-black'
                : 'bg-black text-white border-2 border-white ring-4 ring-white'
              : isListening
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/30 ring-4 ring-emerald-400/50'
                : isProcessing
                  ? 'bg-gradient-to-tr from-indigo-700 via-purple-700 to-[#12151D] text-white shadow-indigo-500/30 ring-4 ring-indigo-400/50'
                  : isSpeaking
                    ? 'bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-amber-500/30 ring-4 ring-amber-400/50'
                    : 'bg-gradient-to-b from-[#222735] via-[#151821] to-[#0E1015] text-white shadow-indigo-950/40 ring-1 ring-[#2D3546] hover:ring-indigo-500/50 hover:shadow-indigo-900/20'
          }`}
        >
          {/* Visual waveform bars inside orb */}
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((bar) => (
              <motion.div
                key={bar}
                animate={
                  isListening
                    ? { height: [8, 24, 12, 30, 8][bar - 1], opacity: 1 }
                    : isSpeaking
                      ? { height: [6, 18, 28, 16, 6][bar - 1], opacity: 0.9 }
                      : isProcessing
                        ? { height: [12, 12, 12, 12, 12], opacity: 0.6 }
                        : { height: 4, opacity: 0.4 }
                }
                transition={{
                  repeat: Infinity,
                  duration: isListening ? 0.7 + bar * 0.1 : 0.8,
                  ease: 'easeInOut',
                  repeatType: 'reverse',
                }}
                className="w-1 rounded-full bg-white"
              />
            ))}
          </div>

          {/* Icon state */}
          <div className="flex items-center justify-center">
            {isListening ? (
              <Mic className="w-7 h-7 animate-pulse text-white" />
            ) : isProcessing ? (
              <Loader2 className="w-7 h-7 animate-spin text-white" />
            ) : isSpeaking ? (
              <Volume2 className="w-7 h-7 text-white" />
            ) : (
              <Mic className="w-7 h-7 text-white/90" />
            )}
          </div>

          <span className="text-[11px] font-medium tracking-wide mt-1.5 opacity-90">
            {isListening ? 'Escuchando' : isProcessing ? 'Analizando' : isSpeaking ? 'Hablando' : 'Toca para hablar'}
          </span>
        </motion.button>
      </div>

      {/* Transcript or Prompt Hint */}
      <div className="max-w-md px-4 min-h-[44px] flex items-center justify-center">
        {transcript ? (
          <p className="text-sm sm:text-base font-medium text-[#EDEDED] italic bg-[#151922] px-4 py-2 rounded-xl border border-[#222834] shadow-sm">
            "{transcript}"
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-[#8490A0]">
            {isListening 
              ? 'Habla con naturalidad: "Apaga el salón", "Crea una tarea", "Modo noche"...' 
              : 'Presiona el orbe o escribe un comando abajo para interactuar.'}
          </p>
        )}
      </div>
    </div>
  );
};
