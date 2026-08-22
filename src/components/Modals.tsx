import React, { useState } from 'react';
import { X, Sparkles, Plus, CheckSquare, Layers, Mic } from 'lucide-react';
import { Task, TaskCategory, Priority, Routine, CustomVoiceCommand, SmartDevice, PhoneState } from '../types';

// TASK MODAL
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'steps'>) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('trabajo');
  const [priority, setPriority] = useState<Priority>('media');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate: dueDate || undefined,
      estimatedMinutes: estimatedMinutes || undefined,
    });
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#111318] rounded-2xl w-full max-w-lg p-6 border border-[#1F242F] shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#1C202A] mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">Nueva Tarea Diaria</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8490A0] hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#C5CED9] mb-1">
              Título de la tarea *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Enviar propuesta de proyecto"
              className="w-full px-3.5 py-2 rounded-xl bg-[#161922] border border-[#222834] text-white placeholder:text-[#525B6C] text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C5CED9] mb-1">
              Descripción o notas
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles adicionales..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#161922] border border-[#222834] text-white placeholder:text-[#525B6C] text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#C5CED9] mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#222834] text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="trabajo" className="bg-[#111318]">Trabajo</option>
                <option value="hogar" className="bg-[#111318]">Hogar</option>
                <option value="personal" className="bg-[#111318]">Personal</option>
                <option value="salud" className="bg-[#111318]">Salud</option>
                <option value="compras" className="bg-[#111318]">Compras</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C5CED9] mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#222834] text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="alta" className="bg-[#111318]">Alta</option>
                <option value="media" className="bg-[#111318]">Media</option>
                <option value="baja" className="bg-[#111318]">Baja</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#C5CED9] mb-1">
                Hora límite (Opcional)
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="ej. 15:30"
                className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#222834] text-white placeholder:text-[#525B6C] text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C5CED9] mb-1">
                Tiempo estimado (min)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#222834] text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#1C202A] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#161922] hover:bg-[#1E232E] border border-[#222834] text-[#C5CED9] hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Guardar Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ROUTINE MODAL
interface RoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (routineData: Omit<Routine, 'id'>) => void;
}

export const RoutineModal: React.FC<RoutineModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [voiceTrigger, setVoiceTrigger] = useState('');
  const [description, setDescription] = useState('');
  const [timeTrigger, setTimeTrigger] = useState('');
  const [presetType, setPresetType] = useState('relax');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !voiceTrigger.trim()) return;

    let actions: any[] = [];
    if (presetType === 'relax') {
      actions = [
        { target: 'device', action: 'setLight', payload: { deviceId: 'dev-light-living', status: true, brightness: 25, color: 'warm' } },
        { target: 'phone', action: 'setDnd', payload: { dnd: true } },
        { target: 'device', action: 'setSpeaker', payload: { deviceId: 'dev-speaker-living', speakerPlaying: true, speakerVolume: 30 } },
      ];
    } else {
      actions = [
        { target: 'device', action: 'turnOffAllLights', payload: {} },
        { target: 'phone', action: 'setDnd', payload: { dnd: true } },
      ];
    }

    onSave({
      name: name.trim(),
      voiceTrigger: voiceTrigger.trim(),
      description: description.trim() || 'Rutina personalizada automatizada',
      timeTrigger: timeTrigger || undefined,
      icon: 'Sparkles',
      actionsCount: actions.length,
      actions,
    });
    setName('');
    setVoiceTrigger('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#111318] rounded-2xl w-full max-w-lg p-6 border border-[#1F242F] shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#1C202A] mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">Crear Rutina Automatizada</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8490A0] hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#C5CED9] mb-1">
              Nombre de la Rutina *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. Modo Lectura Nocturna"
              className="w-full px-3.5 py-2 rounded-xl bg-[#161922] border border-[#222834] text-white placeholder:text-[#525B6C] text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C5CED9] mb-1">
              Frase de Activación por Voz *
            </label>
            <input
              type="text"
              required
              value={voiceTrigger}
              onChange={(e) => setVoiceTrigger(e.target.value)}
              placeholder="ej. Hora de leer"
              className="w-full px-3.5 py-2 rounded-xl bg-[#161922] border border-[#222834] text-white placeholder:text-[#525B6C] text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C5CED9] mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajusta luces tenues y activa modo no molestar..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#161922] border border-[#222834] text-white placeholder:text-[#525B6C] text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C5CED9] mb-1">
              Paquete de acciones coordinadas
            </label>
            <select
              value={presetType}
              onChange={(e) => setPresetType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#222834] text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="relax" className="bg-[#111318]">Luces cálidas al 25% + Silenciar teléfono + Música suave</option>
              <option value="all-off" className="bg-[#111318]">Apagar todo el hogar + No molestar en teléfono</option>
            </select>
          </div>

          <div className="pt-3 border-t border-[#1C202A] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#161922] hover:bg-[#1E232E] border border-[#222834] text-[#C5CED9] hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Crear Rutina
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// VOICE COMMAND MODAL
interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (commandData: Omit<CustomVoiceCommand, 'id'>) => void;
}

export const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({ isOpen, onClose, onSave }) => {
  const [phrase, setPhrase] = useState('');
  const [description, setDescription] = useState('');
  const [actionType, setActionType] = useState('coffee');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phrase.trim()) return;

    let actions: any[] = [];
    let icon = 'Sparkles';

    if (actionType === 'coffee') {
      icon = 'Coffee';
      actions = [{ target: 'device', action: 'brewCoffee', payload: { deviceId: 'dev-coffee-maker', mode: 'espresso' } }];
    } else if (actionType === 'silence') {
      icon = 'VolumeX';
      actions = [{ target: 'phone', action: 'setVolume', payload: { volumeLevel: 0, ringerMode: 'silent', dnd: true } }];
    } else if (actionType === 'vacuum') {
      icon = 'Sparkles';
      actions = [{ target: 'device', action: 'startVacuum', payload: { deviceId: 'dev-vacuum-robot' } }];
    } else {
      icon = 'Thermometer';
      actions = [{ target: 'device', action: 'setThermostat', payload: { deviceId: 'dev-thermostat', targetTemperature: 21 } }];
    }

    onSave({
      phrase: phrase.trim(),
      description: description.trim() || 'Comando de voz personalizado',
      icon,
      isCustom: true,
      actions,
    });
    setPhrase('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#111318] rounded-2xl w-full max-w-lg p-6 border border-[#1F242F] shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#1C202A] mb-4">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">Nuevo Comando de Voz</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8490A0] hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#C5CED9] mb-1">
              Frase de activación personalizada *
            </label>
            <input
              type="text"
              required
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="ej. Prepara mi café doble y apaga el salón"
              className="w-full px-3.5 py-2 rounded-xl bg-[#161922] border border-[#222834] text-white placeholder:text-[#525B6C] text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C5CED9] mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Inicia cafetera y ajusta iluminación..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#161922] border border-[#222834] text-white placeholder:text-[#525B6C] text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C5CED9] mb-1">
              Acción a desencadenar
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#161922] border border-[#222834] text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="coffee" className="bg-[#111318]">☕ Preparar Café Espresso</option>
              <option value="silence" className="bg-[#111318]">🔕 Silencio total en teléfono</option>
              <option value="vacuum" className="bg-[#111318]">🧹 Iniciar robot aspirador</option>
              <option value="thermostat" className="bg-[#111318]">🌡️ Ajustar climatizador a 21°C</option>
            </select>
          </div>

          <div className="pt-3 border-t border-[#1C202A] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#161922] hover:bg-[#1E232E] border border-[#222834] text-[#C5CED9] hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Guardar Comando
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
