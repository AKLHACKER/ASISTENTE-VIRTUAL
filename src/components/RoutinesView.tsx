import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  DoorClosed, 
  Brain, 
  Film, 
  Play, 
  CheckCircle2, 
  Plus, 
  Clock, 
  Mic, 
  Sparkles,
  Layers
} from 'lucide-react';
import { Routine } from '../types';

interface RoutinesViewProps {
  routines: Routine[];
  onExecuteRoutine: (routine: Routine) => void;
  onOpenNewRoutineModal: () => void;
  highContrast: boolean;
}

export const RoutinesView: React.FC<RoutinesViewProps> = ({
  routines,
  onExecuteRoutine,
  onOpenNewRoutineModal,
  highContrast,
}) => {
  const [executingId, setExecutingId] = useState<string | null>(null);

  const handleRun = (routine: Routine) => {
    setExecutingId(routine.id);
    onExecuteRoutine(routine);
    setTimeout(() => {
      setExecutingId(null);
    }, 2000);
  };

  const getRoutineIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('buenos') || lower.includes('mañana') || lower.includes('días')) {
      return <Sun className="w-6 h-6 text-amber-500" />;
    }
    if (lower.includes('noche') || lower.includes('descanso') || lower.includes('dormir')) {
      return <Moon className="w-6 h-6 text-indigo-400" />;
    }
    if (lower.includes('salida') || lower.includes('fuera') || lower.includes('casa')) {
      return <DoorClosed className="w-6 h-6 text-emerald-500" />;
    }
    if (lower.includes('concentración') || lower.includes('enfoque') || lower.includes('trabajo')) {
      return <Brain className="w-6 h-6 text-purple-500" />;
    }
    if (lower.includes('cine') || lower.includes('relax') || lower.includes('película')) {
      return <Film className="w-6 h-6 text-rose-500" />;
    }
    return <Sparkles className="w-6 h-6 text-indigo-500" />;
  };

  return (
    <div id="routines-view" className="max-w-5xl mx-auto space-y-5">
      {/* Header card */}
      <div className="bg-[#111318] rounded-2xl p-5 border border-[#1F242F] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Automatizaciones y Rutinas Inteligentes</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8490A0] mt-1">
            Ejecuta múltiples acciones coordinadas en el hogar, teléfono y tareas con un solo comando
          </p>
        </div>

        <button
          id="btn-create-routine"
          onClick={onOpenNewRoutineModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shrink-0 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Rutina</span>
        </button>
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routines.map((routine) => {
          const isRunning = executingId === routine.id;
          return (
            <div
              key={routine.id}
              id={`routine-card-${routine.id}`}
              className={`bg-[#111318] rounded-2xl p-5 border transition-all duration-200 shadow-sm flex flex-col justify-between ${
                isRunning
                  ? 'border-emerald-500 ring-1 ring-emerald-500/30 bg-emerald-950/20'
                  : 'border-[#1F242F] hover:border-indigo-500/50'
              } ${highContrast ? 'border-2 border-white' : ''}`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-[#161922] border border-[#222834] shrink-0">
                      {getRoutineIcon(routine.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">
                        {routine.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                          <Mic className="w-3 h-3" />
                          "{routine.voiceTrigger}"
                        </span>
                        {routine.timeTrigger && (
                          <span className="text-[11px] text-[#8490A0] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {routine.timeTrigger}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#8490A0] leading-relaxed mb-4">
                  {routine.description}
                </p>
              </div>

              {/* Bottom bar with action count & trigger button */}
              <div className="pt-3 border-t border-[#1C202A] flex items-center justify-between">
                <span className="text-xs text-[#8490A0] font-medium">
                  ⚡ {routine.actionsCount} acciones simultáneas
                </span>

                <button
                  id={`run-routine-btn-${routine.id}`}
                  onClick={() => handleRun(routine)}
                  disabled={isRunning}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                    isRunning
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 animate-spin" />
                      <span>Ejecutando...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Ejecutar Rutina</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
