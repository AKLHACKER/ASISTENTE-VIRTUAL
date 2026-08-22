import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Clock, 
  Sparkles, 
  AlertCircle,
  Tag,
  CheckSquare,
  ListOrdered,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Task, TaskCategory, Priority } from '../types';

interface TasksViewProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTaskModal: () => void;
  onAiBreakdownTask: (task: Task) => void;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
}

const CATEGORIES: { id: TaskCategory | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'trabajo', label: 'Trabajo' },
  { id: 'hogar', label: 'Hogar' },
  { id: 'personal', label: 'Personal' },
  { id: 'salud', label: 'Salud' },
  { id: 'compras', label: 'Compras' },
];

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTask,
  onToggleSubtask,
  onDeleteTask,
  onOpenNewTaskModal,
  onAiBreakdownTask,
  highContrast,
  fontSize,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'todas'>('todas');
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory === 'todas') return true;
    return t.category === selectedCategory;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'alta':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'media':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'baja':
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  const getCategoryColor = (cat: TaskCategory) => {
    switch (cat) {
      case 'trabajo':
        return 'text-blue-400 bg-blue-500/10 border border-blue-500/20';
      case 'hogar':
        return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
      case 'salud':
        return 'text-teal-400 bg-teal-500/10 border border-teal-500/20';
      case 'compras':
        return 'text-purple-400 bg-purple-500/10 border border-purple-500/20';
      case 'personal':
      default:
        return 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20';
    }
  };

  const getTextClass = () => {
    if (fontSize === 'large') return 'text-lg';
    if (fontSize === 'xlarge') return 'text-xl';
    return 'text-sm';
  };

  return (
    <div id="tasks-view" className="max-w-4xl mx-auto space-y-5">
      {/* Header & Progress Card */}
      <div className="bg-[#111318] rounded-2xl p-5 border border-[#1F242F] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">
              Gestor Inteligente de Tareas
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#8490A0] mt-1">
            {completedCount} de {tasks.length} tareas completadas hoy ({progressPercent}%)
          </p>
          <div className="w-full sm:w-64 h-2 rounded-full bg-[#181B24] mt-3 overflow-hidden border border-[#222834]">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <button
          id="btn-add-task"
          onClick={onOpenNewTaskModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-md shrink-0 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Tarea</span>
        </button>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            id={`filter-cat-${cat.id}`}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-[#111318] text-[#8490A0] border-[#1F242F] hover:bg-[#161922] hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#111318] rounded-2xl p-8 text-center border border-[#1F242F]">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h3 className="font-semibold text-white">No hay tareas en esta categoría</h3>
            <p className="text-xs text-[#8490A0] mt-1">
              Pídele a Aura por voz "Añade una tarea..." o pulsa en Nueva Tarea.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isExpanded = expandedTasks[task.id] ?? true;
            return (
              <div
                key={task.id}
                id={`task-card-${task.id}`}
                className={`bg-[#111318] rounded-2xl p-4 sm:p-5 border transition-all duration-200 shadow-sm ${
                  task.completed
                    ? 'border-[#1F242F] opacity-60'
                    : highContrast
                      ? 'border-2 border-white'
                      : 'border-[#1F242F] hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left checkbox & Title */}
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      id={`toggle-task-${task.id}`}
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 text-[#8490A0] hover:text-indigo-400 transition-colors shrink-0"
                      aria-label={task.completed ? 'Marcar tarea como pendiente' : 'Marcar tarea como completada'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-semibold ${getTextClass()} ${
                            task.completed
                              ? 'line-through text-[#64748B]'
                              : 'text-white'
                          }`}
                        >
                          {task.title}
                        </span>

                        {/* Priority Badge */}
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>

                        {/* Category badge */}
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md capitalize ${getCategoryColor(task.category)}`}>
                          {task.category}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-[#8490A0] mt-1">
                          {task.description}
                        </p>
                      )}

                      {/* Time & Steps summary */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#8490A0]">
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {task.dueDate}
                          </span>
                        )}
                        {task.estimatedMinutes && (
                          <span>~{task.estimatedMinutes} min</span>
                        )}
                        {task.steps.length > 0 && (
                          <span className="flex items-center gap-1">
                            <ListOrdered className="w-3.5 h-3.5" />
                            {task.steps.filter((s) => s.done).length}/{task.steps.length} subtareas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions right */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* AI Breakdown button if no steps or wanting more */}
                    {task.steps.length === 0 && !task.completed && (
                      <button
                        id={`ai-breakdown-${task.id}`}
                        onClick={() => onAiBreakdownTask(task)}
                        title="Desglosar en subtareas inteligentes con IA"
                        className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/30 transition-colors text-xs font-medium flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Desglosar IA</span>
                      </button>
                    )}

                    {task.steps.length > 0 && (
                      <button
                        onClick={() => toggleExpand(task.id)}
                        className="p-1.5 text-[#8490A0] hover:text-white rounded-lg hover:bg-[#161922] transition-colors"
                        title={isExpanded ? 'Ocultar subtareas' : 'Mostrar subtareas'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}

                    <button
                      id={`delete-task-${task.id}`}
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-[#8490A0] hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors"
                      title="Eliminar tarea"
                      aria-label="Eliminar tarea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtasks checklist section */}
                {task.steps.length > 0 && isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#1C202A] pl-8 space-y-2">
                    <div className="text-[11px] font-semibold text-[#8490A0] uppercase tracking-wider">
                      Subtareas paso a paso:
                    </div>
                    {task.steps.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-2.5 text-xs text-[#C5CED9] hover:text-white"
                      >
                        <button
                          onClick={() => onToggleSubtask(task.id, step.id)}
                          className="text-[#8490A0] hover:text-emerald-400 transition-colors"
                        >
                          {step.done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <span className={step.done ? 'line-through text-[#64748B]' : ''}>
                          {step.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
