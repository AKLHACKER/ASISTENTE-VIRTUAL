import React from 'react';
import { 
  Mic, 
  Plus, 
  Play, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Coffee, 
  VolumeX, 
  Thermometer, 
  CheckSquare,
  MessageSquareCode
} from 'lucide-react';
import { CustomVoiceCommand } from '../types';

interface VoiceCommandsViewProps {
  commands: CustomVoiceCommand[];
  onExecuteCommand: (command: CustomVoiceCommand) => void;
  onDeleteCommand: (commandId: string) => void;
  onOpenNewCommandModal: () => void;
  highContrast: boolean;
}

export const VoiceCommandsView: React.FC<VoiceCommandsViewProps> = ({
  commands,
  onExecuteCommand,
  onDeleteCommand,
  onOpenNewCommandModal,
  highContrast,
}) => {
  const getCommandIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-amber-500" />;
      case 'VolumeX':
        return <VolumeX className="w-5 h-5 text-indigo-500" />;
      case 'Thermometer':
        return <Thermometer className="w-5 h-5 text-rose-500" />;
      case 'CheckSquare':
        return <CheckSquare className="w-5 h-5 text-emerald-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-teal-500" />;
    }
  };

  return (
    <div id="voice-commands-view" className="max-w-4xl mx-auto space-y-5">
      {/* Header Card */}
      <div className="bg-[#111318] rounded-2xl p-5 border border-[#1F242F] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-400" />
            <span>Comandos de Voz Personalizados</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8490A0] mt-1">
            Configura frases clave exclusivas para desencadenar acciones personalizadas con Aura
          </p>
        </div>

        <button
          id="btn-create-voice-command"
          onClick={onOpenNewCommandModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shrink-0 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Comando</span>
        </button>
      </div>

      {/* Voice commands list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {commands.map((cmd) => (
          <div
            key={cmd.id}
            id={`voice-command-card-${cmd.id}`}
            className={`bg-[#111318] rounded-2xl p-5 border transition-all duration-200 shadow-sm flex flex-col justify-between ${
              highContrast ? 'border-2 border-white' : 'border-[#1F242F] hover:border-indigo-500/50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#161922] border border-[#222834] shrink-0">
                    {getCommandIcon(cmd.icon)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>"{cmd.phrase}"</span>
                    </h3>
                  </div>
                </div>

                {cmd.isCustom && (
                  <button
                    onClick={() => onDeleteCommand(cmd.id)}
                    className="p-1.5 text-[#8490A0] hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Eliminar comando"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-[#8490A0] mt-1 mb-3">
                {cmd.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#1C202A] flex items-center justify-between">
              <span className="text-[11px] text-[#8490A0] font-mono">
                {cmd.actions.length} acción(es)
              </span>

              <button
                id={`test-command-btn-${cmd.id}`}
                onClick={() => onExecuteCommand(cmd)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Play className="w-3 h-3" />
                <span>Probar Comando</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
