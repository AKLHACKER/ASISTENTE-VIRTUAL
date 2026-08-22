import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  Eye, 
  Smartphone, 
  BatteryMedium, 
  BatteryCharging, 
  Sparkles,
  Type
} from 'lucide-react';
import { PhoneState } from '../types';

interface HeaderProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onChangeFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  phone: PhoneState;
  onSelectPhoneTab: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  voiceEnabled,
  onToggleVoice,
  highContrast,
  onToggleHighContrast,
  fontSize,
  onChangeFontSize,
  phone,
  onSelectPhoneTab,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'listening':
        return {
          text: 'Escuchando tu voz...',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 ring-1 ring-emerald-500/20',
          dot: 'bg-emerald-400 animate-ping',
        };
      case 'processing':
        return {
          text: 'Pensando con IA...',
          color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 ring-1 ring-indigo-500/20',
          dot: 'bg-indigo-400 animate-pulse',
        };
      case 'speaking':
        return {
          text: 'Respondiendo...',
          color: 'bg-amber-500/15 text-amber-300 border-amber-500/30 ring-1 ring-amber-500/20',
          dot: 'bg-amber-400 animate-pulse',
        };
      default:
        return {
          text: 'Aura lista',
          color: 'bg-[#151922] text-[#9AA5B5] border-[#222834]',
          dot: 'bg-emerald-400',
        };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <header 
      id="app-header" 
      className={`w-full border-b transition-colors duration-200 ${
        highContrast 
          ? 'bg-black text-white border-white/30' 
          : 'bg-[#0D0F14]/90 backdrop-blur-md border-[#1F242F] text-[#EDEDED]'
      } sticky top-0 z-40 px-4 sm:px-6 py-3.5`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-[#1E2235] to-[#12151D] text-white shadow-md ring-1 ring-indigo-500/30">
            <Sparkles className="w-5 h-5 text-indigo-300" />
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0D0F14] ${statusInfo.dot}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Aura</h1>
              <span className="text-[11px] px-2 py-0.5 font-medium rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                IA Asistente
              </span>
            </div>
            <p className="text-xs text-[#8490A0] font-normal hidden sm:block">
              Gestión de Tareas, Domótica y Teléfono
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="hidden md:flex items-center">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
            <span>{statusInfo.text}</span>
          </div>
        </div>

        {/* Accessibility & Quick Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Phone Sync Pill */}
          <button
            id="header-phone-sync-btn"
            onClick={onSelectPhoneTab}
            title="Estado del teléfono conectado"
            aria-label="Abrir panel de control del teléfono"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[#151922] hover:bg-[#1C212D] border border-[#222834] transition-colors text-[#C5CED9] hover:text-white"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden lg:inline">{phone.model.replace('Google ', '')}</span>
            <div className="flex items-center gap-0.5 text-[#8490A0]">
              {phone.isCharging ? (
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <BatteryMedium className="w-3.5 h-3.5" />
              )}
              <span className="text-[#AAB5C4]">{phone.batteryLevel}%</span>
            </div>
            {phone.dnd && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Modo No Molestar activo" />
            )}
          </button>

          {/* Voice Speech Toggle */}
          <button
            id="header-voice-toggle-btn"
            onClick={onToggleVoice}
            title={voiceEnabled ? 'Desactivar respuestas por voz' : 'Activar respuestas por voz'}
            aria-label={voiceEnabled ? 'Desactivar respuestas por voz' : 'Activar respuestas por voz'}
            className={`p-2 rounded-lg transition-colors text-xs font-medium flex items-center gap-1 border ${
              voiceEnabled
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-[#151922] text-[#8490A0] hover:text-white border-[#222834] hover:bg-[#1C212D]'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline text-xs">{voiceEnabled ? 'Voz On' : 'Voz Off'}</span>
          </button>

          {/* Font Size Selector */}
          <button
            id="header-font-size-btn"
            onClick={() => {
              const next = fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'xlarge' : 'normal';
              onChangeFontSize(next);
            }}
            title="Cambiar tamaño de texto accesible"
            aria-label="Cambiar tamaño de texto"
            className="p-2 rounded-lg bg-[#151922] hover:bg-[#1C212D] text-[#AAB5C4] hover:text-white border border-[#222834] transition-colors flex items-center gap-1 text-xs"
          >
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline capitalize font-semibold">
              {fontSize === 'normal' ? '1x' : fontSize === 'large' ? '1.2x' : '1.4x'}
            </span>
          </button>

          {/* High Contrast Mode Toggle */}
          <button
            id="header-contrast-btn"
            onClick={onToggleHighContrast}
            title={highContrast ? 'Desactivar alto contraste' : 'Activar modo alto contraste accesible'}
            aria-label={highContrast ? 'Desactivar alto contraste' : 'Activar modo alto contraste accesible'}
            className={`p-2 rounded-lg transition-colors text-xs border ${
              highContrast
                ? 'bg-white text-black ring-2 ring-white font-bold border-white'
                : 'bg-[#151922] text-[#AAB5C4] hover:text-white border-[#222834] hover:bg-[#1C212D]'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
