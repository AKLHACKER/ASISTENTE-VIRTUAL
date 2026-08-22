import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  CheckSquare, 
  Home, 
  Smartphone, 
  Layers, 
  Mic, 
  Moon, 
  Sun,
  ShieldCheck,
  Zap,
  Volume2
} from 'lucide-react';
import { 
  Task, 
  SmartDevice, 
  PhoneState, 
  Routine, 
  CustomVoiceCommand, 
  ChatMessage, 
  ActiveTab, 
  ExecutedAction 
} from './types';
import { 
  INITIAL_TASKS, 
  INITIAL_DEVICES, 
  INITIAL_PHONE_STATE, 
  INITIAL_ROUTINES, 
  INITIAL_VOICE_COMMANDS 
} from './data/initialState';
import { SpeechHandler } from './utils/speech';
import { Header } from './components/Header';
import { AssistantView } from './components/AssistantView';
import { TasksView } from './components/TasksView';
import { HomeAutomationView } from './components/HomeAutomationView';
import { PhoneControlView } from './components/PhoneControlView';
import { RoutinesView } from './components/RoutinesView';
import { VoiceCommandsView } from './components/VoiceCommandsView';
import { TaskModal, RoutineModal, VoiceCommandModal } from './components/Modals';

export default function App() {
  // Local storage loaded states with fallbacks
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('aura_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [devices, setDevices] = useState<SmartDevice[]>(() => {
    try {
      const saved = localStorage.getItem('aura_devices');
      return saved ? JSON.parse(saved) : INITIAL_DEVICES;
    } catch {
      return INITIAL_DEVICES;
    }
  });

  const [phone, setPhone] = useState<PhoneState>(() => {
    try {
      const saved = localStorage.getItem('aura_phone');
      return saved ? JSON.parse(saved) : INITIAL_PHONE_STATE;
    } catch {
      return INITIAL_PHONE_STATE;
    }
  });

  const [routines, setRoutines] = useState<Routine[]>(() => {
    try {
      const saved = localStorage.getItem('aura_routines');
      return saved ? JSON.parse(saved) : INITIAL_ROUTINES;
    } catch {
      return INITIAL_ROUTINES;
    }
  });

  const [customCommands, setCustomCommands] = useState<CustomVoiceCommand[]>(() => {
    try {
      const saved = localStorage.getItem('aura_commands');
      return saved ? JSON.parse(saved) : INITIAL_VOICE_COMMANDS;
    } catch {
      return INITIAL_VOICE_COMMANDS;
    }
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: '¡Hola! Soy Aura, tu asistente virtual inteligente. Estoy lista para ayudarte a gestionar tus tareas diarias, controlar los dispositivos de tu hogar y gestionar tu teléfono mediante comandos de voz personalizados o pulsaciones táctiles.',
        timestamp: 'Ahora',
        suggestions: ['¿Qué tareas tengo hoy?', 'Prepara mi café matutino', 'Activar Modo Noche', 'Silenciar teléfono'],
      },
    ];
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Modal open states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);

  // Speech handler reference
  const speechHandlerRef = useRef<SpeechHandler | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('aura_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('aura_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('aura_phone', JSON.stringify(phone));
  }, [phone]);

  useEffect(() => {
    localStorage.setItem('aura_routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem('aura_commands', JSON.stringify(customCommands));
  }, [customCommands]);

  // Initialize Speech Recognition & Synthesis
  useEffect(() => {
    speechHandlerRef.current = new SpeechHandler(
      (currentTranscript) => {
        setTranscript(currentTranscript);
        // If user finished speech pause, send query
        if (currentTranscript.trim().length > 3) {
          // Debounced auto-submit
        }
      },
      (newStatus) => {
        setStatus(newStatus);
      }
    );

    return () => {
      speechHandlerRef.current?.cancelSpeech();
    };
  }, []);

  // Update speech handler mute setting
  useEffect(() => {
    speechHandlerRef.current?.toggleMute(!voiceEnabled);
  }, [voiceEnabled]);

  // Execute an action on the state
  const executeAppAction = (action: any): ExecutedAction => {
    const type = action.type;
    const payload = action.payload || {};

    if (type === 'ADD_TASK') {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: payload.title || 'Nueva tarea',
        description: payload.description || '',
        category: payload.category || 'personal',
        priority: payload.priority || 'media',
        completed: false,
        dueDate: payload.dueDate,
        estimatedMinutes: payload.estimatedMinutes || 30,
        steps: (payload.steps || []).map((s: any, idx: number) => ({
          id: `step-${Date.now()}-${idx}`,
          text: typeof s === 'string' ? s : s.text || 'Paso',
          done: false,
        })),
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      return {
        type: 'task',
        description: `Tarea añadida: "${newTask.title}"`,
        status: 'success',
      };
    }

    if (type === 'COMPLETE_TASK') {
      const targetId = payload.taskId;
      const targetTitle = payload.taskTitle?.toLowerCase();
      setTasks((prev) =>
        prev.map((t) =>
          t.id === targetId || (targetTitle && t.title.toLowerCase().includes(targetTitle))
            ? { ...t, completed: true }
            : t
        )
      );
      return {
        type: 'task',
        description: `Tarea completada`,
        status: 'success',
      };
    }

    if (type === 'UPDATE_DEVICE') {
      const { deviceId, deviceType, status: devStatus, brightness, targetTemperature, mode, coffeeBrewing, coffeeMode, vacuumState, speakerPlaying } = payload;
      
      setDevices((prev) =>
        prev.map((d) => {
          const isMatch = (deviceId && d.id === deviceId) || (deviceType && d.type === deviceType);
          if (!isMatch) return d;

          return {
            ...d,
            ...(devStatus !== undefined ? { status: Boolean(devStatus) } : {}),
            ...(brightness !== undefined ? { brightness: Number(brightness), status: Number(brightness) > 0 } : {}),
            ...(targetTemperature !== undefined ? { targetTemperature: Number(targetTemperature) } : {}),
            ...(mode !== undefined ? { mode } : {}),
            ...(coffeeBrewing !== undefined ? { coffeeBrewing: Boolean(coffeeBrewing), status: Boolean(coffeeBrewing) } : {}),
            ...(coffeeMode !== undefined ? { coffeeMode } : {}),
            ...(vacuumState !== undefined ? { vacuumState, status: vacuumState === 'cleaning' } : {}),
            ...(speakerPlaying !== undefined ? { speakerPlaying: Boolean(speakerPlaying) } : {}),
          };
        })
      );
      return {
        type: 'device',
        description: action.targetDescription || `Dispositivo domótico actualizado`,
        status: 'success',
      };
    }

    if (type === 'UPDATE_PHONE') {
      const { dnd, focusMode, batterySaver, flashlight, volumeLevel, ringerMode, brightness, eyeComfort } = payload;
      setPhone((prev) => ({
        ...prev,
        ...(dnd !== undefined ? { dnd: Boolean(dnd) } : {}),
        ...(focusMode !== undefined ? { focusMode: Boolean(focusMode) } : {}),
        ...(batterySaver !== undefined ? { batterySaver: Boolean(batterySaver) } : {}),
        ...(flashlight !== undefined ? { flashlight: Boolean(flashlight) } : {}),
        ...(volumeLevel !== undefined ? { volumeLevel: Number(volumeLevel) } : {}),
        ...(ringerMode !== undefined ? { ringerMode } : {}),
        ...(brightness !== undefined ? { brightness: Number(brightness) } : {}),
        ...(eyeComfort !== undefined ? { eyeComfort: Boolean(eyeComfort) } : {}),
      }));
      return {
        type: 'phone',
        description: action.targetDescription || `Ajustes del teléfono sincronizados`,
        status: 'success',
      };
    }

    if (type === 'TRIGGER_ROUTINE') {
      const routineId = payload.routineId;
      const found = routines.find((r) => r.id === routineId);
      if (found) {
        handleExecuteRoutine(found);
      }
      return {
        type: 'routine',
        description: action.targetDescription || `Rutina ejecutada con éxito`,
        status: 'success',
      };
    }

    return {
      type: 'command',
      description: action.targetDescription || 'Acción procesada',
      status: 'info',
    };
  };

  // Main message / voice input sender
  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    // Check if userText matches any custom voice command directly
    const normalizedInput = userText.toLowerCase().trim();
    const matchedCommand = customCommands.find(
      (c) => normalizedInput.includes(c.phrase.toLowerCase()) || c.phrase.toLowerCase().includes(normalizedInput)
    );

    if (matchedCommand) {
      handleExecuteCommand(matchedCommand);
      return;
    }

    // Check if userText matches any routine
    const matchedRoutine = routines.find(
      (r) => normalizedInput.includes(r.voiceTrigger.toLowerCase()) || r.voiceTrigger.toLowerCase().includes(normalizedInput)
    );

    if (matchedRoutine) {
      handleExecuteRoutine(matchedRoutine);
      return;
    }

    // Add user message to conversation
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setStatus('processing');
    setTranscript('');

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          currentTasks: tasks,
          currentDevices: devices,
          currentPhone: phone,
          customCommands,
          routines,
        }),
      });

      if (!res.ok) throw new Error('Error de red en el servidor');

      const data = await res.json();
      const executed: ExecutedAction[] = [];

      if (Array.isArray(data.actions)) {
        for (const act of data.actions) {
          const result = executeAppAction(act);
          executed.push(result);
        }
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.spokenResponse || 'Acción completada con éxito.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        executedActions: executed,
        suggestions: data.suggestions || ['¿Qué más puedo hacer por ti?'],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Speak response if voice is enabled
      if (voiceEnabled && speechHandlerRef.current && data.spokenResponse) {
        speechHandlerRef.current.speak(data.spokenResponse, () => {
          setStatus('idle');
        });
      } else {
        setStatus('idle');
      }
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: 'He registrado tu comando y aplicado las comprobaciones del sistema.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setStatus('idle');
    }
  };

  // Toggle speech recognition
  const handleToggleListening = () => {
    if (status === 'listening') {
      speechHandlerRef.current?.stopListening();
      if (transcript.trim()) {
        handleSendMessage(transcript.trim());
      }
    } else {
      speechHandlerRef.current?.cancelSpeech();
      setTranscript('');
      speechHandlerRef.current?.startListening();
    }
  };

  // Execute a routine
  const handleExecuteRoutine = (routine: Routine) => {
    const executed: ExecutedAction[] = [];

    routine.actions.forEach((act) => {
      if (act.target === 'device') {
        if (act.action === 'turnOffAllLights') {
          setDevices((prev) =>
            prev.map((d) => (d.type === 'light' ? { ...d, status: false, brightness: 0 } : d))
          );
          executed.push({ type: 'device', description: 'Luces apagadas', status: 'success' });
        } else if (act.action === 'setLight') {
          setDevices((prev) =>
            prev.map((d) => (d.id === act.payload.deviceId ? { ...d, ...act.payload } : d))
          );
          executed.push({ type: 'device', description: 'Iluminación ajustada', status: 'success' });
        } else if (act.action === 'setBlinds') {
          setDevices((prev) =>
            prev.map((d) => (d.id === act.payload.deviceId ? { ...d, position: act.payload.position } : d))
          );
          executed.push({ type: 'device', description: `Persianas al ${act.payload.position}%`, status: 'success' });
        } else if (act.action === 'brewCoffee') {
          setDevices((prev) =>
            prev.map((d) => (d.id === act.payload.deviceId ? { ...d, status: true, coffeeBrewing: true } : d))
          );
          setTimeout(() => {
            setDevices((prev) =>
              prev.map((d) => (d.id === act.payload.deviceId ? { ...d, coffeeBrewing: false } : d))
            );
          }, 6000);
          executed.push({ type: 'device', description: 'Cafetera en marcha', status: 'success' });
        } else if (act.action === 'setLock') {
          setDevices((prev) =>
            prev.map((d) => (d.id === act.payload.deviceId ? { ...d, status: act.payload.status } : d))
          );
          executed.push({ type: 'device', description: 'Cerraduras aseguradas', status: 'success' });
        } else if (act.action === 'setThermostat') {
          setDevices((prev) =>
            prev.map((d) => (d.id === act.payload.deviceId ? { ...d, ...act.payload } : d))
          );
          executed.push({ type: 'device', description: 'Termostato calibrado', status: 'success' });
        } else if (act.action === 'startVacuum') {
          setDevices((prev) =>
            prev.map((d) => (d.id === act.payload.deviceId ? { ...d, status: true, vacuumState: 'cleaning' } : d))
          );
          executed.push({ type: 'device', description: 'Aspirador iniciado', status: 'success' });
        } else if (act.action === 'setSpeaker' || act.action === 'stopSpeaker') {
          setDevices((prev) =>
            prev.map((d) => (d.id === act.payload.deviceId ? { ...d, ...act.payload, speakerPlaying: act.action === 'setSpeaker' } : d))
          );
          executed.push({ type: 'device', description: 'Audio sincronizado', status: 'success' });
        }
      } else if (act.target === 'phone') {
        setPhone((prev) => ({ ...prev, ...act.payload }));
        executed.push({ type: 'phone', description: 'Ajustes del móvil actualizados', status: 'success' });
      }
    });

    const confirmation = `He ejecutado la rutina "${routine.name}". Todas las acciones se han completado.`;

    const routineMsg: ChatMessage = {
      id: `msg-${Date.now()}-routine`,
      role: 'assistant',
      content: confirmation,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      executedActions: executed,
      suggestions: ['Ver dispositivos', 'Consultar tareas', 'Modo Noche'],
    };

    setMessages((prev) => [...prev, routineMsg]);

    if (voiceEnabled && speechHandlerRef.current) {
      speechHandlerRef.current.speak(confirmation);
    }
  };

  // Execute a custom voice command
  const handleExecuteCommand = (cmd: CustomVoiceCommand) => {
    const executed: ExecutedAction[] = [];

    cmd.actions.forEach((act) => {
      if (act.target === 'device') {
        if (act.action === 'brewCoffee') {
          setDevices((prev) =>
            prev.map((d) => (d.id === act.payload.deviceId ? { ...d, status: true, coffeeBrewing: true } : d))
          );
          setTimeout(() => {
            setDevices((prev) =>
              prev.map((d) => (d.id === act.payload.deviceId ? { ...d, coffeeBrewing: false } : d))
            );
          }, 5000);
          executed.push({ type: 'device', description: 'Cafetera preparando taza', status: 'success' });
        } else if (act.action === 'startVacuum') {
          setDevices((prev) =>
            prev.map((d) => (d.id === act.payload.deviceId ? { ...d, status: true, vacuumState: 'cleaning' } : d))
          );
          executed.push({ type: 'device', description: 'Robot aspirador en marcha', status: 'success' });
        } else if (act.action === 'setThermostat') {
          setDevices((prev) =>
            prev.map((d) => (d.id === act.payload.deviceId ? { ...d, ...act.payload } : d))
          );
          executed.push({ type: 'device', description: `Termostato a ${act.payload.targetTemperature}°C`, status: 'success' });
        } else if (act.action === 'setLight') {
          setDevices((prev) =>
            prev.map((d) => (d.id === act.payload.deviceId ? { ...d, ...act.payload } : d))
          );
          executed.push({ type: 'device', description: 'Luz ajustada', status: 'success' });
        }
      } else if (act.target === 'phone') {
        setPhone((prev) => ({ ...prev, ...act.payload }));
        executed.push({ type: 'phone', description: 'Móvil puesto en silencio', status: 'success' });
      } else if (act.target === 'task') {
        const sampleTask: Task = {
          id: `task-${Date.now()}`,
          title: 'Tarea urgente añadida por comando de voz',
          description: 'Revisión prioritaria solicitada',
          category: 'trabajo',
          priority: 'alta',
          completed: false,
          dueDate: 'Hoy',
          estimatedMinutes: 20,
          steps: [{ id: 's1', text: 'Atender asunto', done: false }],
          createdAt: new Date().toISOString(),
        };
        setTasks((prev) => [sampleTask, ...prev]);
        executed.push({ type: 'task', description: 'Tarea urgente registrada', status: 'success' });
      }
    });

    const responseText = `Comando activado: "${cmd.phrase}". ${cmd.description}.`;
    const cmdMsg: ChatMessage = {
      id: `msg-${Date.now()}-cmd`,
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      executedActions: executed,
    };

    setMessages((prev) => [...prev, cmdMsg]);

    if (voiceEnabled && speechHandlerRef.current) {
      speechHandlerRef.current.speak(responseText);
    }
  };

  // AI Task breakdown helper
  const handleAiBreakdownTask = async (task: Task) => {
    setStatus('processing');
    const prompt = `Desglosa la siguiente tarea en 3 o 4 subtareas concisas, claras y accionables en español: "${task.title} - ${task.description || ''}"`;

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          currentTasks: [task],
          currentDevices: [],
          currentPhone: phone,
        }),
      });

      let stepsToAdd = [
        { id: `step-${Date.now()}-1`, text: 'Planificar fases de ejecución', done: false },
        { id: `step-${Date.now()}-2`, text: 'Desarrollar componentes principales', done: false },
        { id: `step-${Date.now()}-3`, text: 'Verificar y entregar', done: false },
      ];

      if (res.ok) {
        const data = await res.json();
        const addAction = data.actions?.find((a: any) => a.type === 'ADD_TASK' && a.payload?.steps);
        if (addAction && addAction.payload.steps.length > 0) {
          stepsToAdd = addAction.payload.steps.map((s: any, i: number) => ({
            id: `step-${Date.now()}-${i}`,
            text: typeof s === 'string' ? s : s.text,
            done: false,
          }));
        }
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, steps: stepsToAdd } : t))
      );
      setStatus('idle');
    } catch (e) {
      console.warn(e);
      setStatus('idle');
    }
  };

  // Coffee brewing helper
  const handleBrewCoffee = (deviceId: string, mode: 'espresso' | 'americano' | 'latte' | 'cappuccino') => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: true, coffeeBrewing: true, coffeeMode: mode } : d))
    );

    if (voiceEnabled && speechHandlerRef.current) {
      speechHandlerRef.current.speak(`Preparando tu café ${mode} recién hecho.`);
    }

    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, coffeeBrewing: false } : d))
      );
      if (voiceEnabled && speechHandlerRef.current) {
        speechHandlerRef.current.speak('Tu café está listo. ¡Que lo disfrutes!');
      }
    }, 6000);
  };

  // Toggle all lights helper
  const handleToggleAllLights = (turnOn: boolean) => {
    setDevices((prev) =>
      prev.map((d) => (d.type === 'light' ? { ...d, status: turnOn, brightness: turnOn ? 80 : 0 } : d))
    );
  };

  const navItems = [
    { id: 'chat', label: 'Asistente & Voz', icon: Sparkles },
    { id: 'tasks', label: 'Tareas Diarias', icon: CheckSquare, badge: tasks.filter((t) => !t.completed).length },
    { id: 'home', label: 'Domótica & Hogar', icon: Home, badge: devices.filter((d) => d.status).length },
    { id: 'phone', label: 'Mi Teléfono', icon: Smartphone },
    { id: 'routines', label: 'Rutinas', icon: Layers },
    { id: 'voice-commands', label: 'Comandos de Voz', icon: Mic },
  ];

  return (
    <div
      id="app-root-container"
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        highContrast
          ? 'bg-black text-white'
          : 'bg-[#090A0C] text-[#EDEDED]'
      }`}
    >
      {/* Top Header */}
      <Header
        status={status}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        fontSize={fontSize}
        onChangeFontSize={(sz) => setFontSize(sz)}
        phone={phone}
        onSelectPhoneTab={() => setActiveTab('phone')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-8">
        {/* Navigation Tabs (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#111318] border border-[#1F242F] shadow-md mb-6 max-w-4xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-[#8490A0] hover:text-white hover:bg-[#161922]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white text-indigo-700'
                        : 'bg-[#1C202A] text-[#8490A0] border border-[#2A313F]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Views */}
        {activeTab === 'chat' && (
          <AssistantView
            messages={messages}
            status={status}
            onToggleListening={handleToggleListening}
            onSendMessage={handleSendMessage}
            transcript={transcript}
            onClearHistory={() => setMessages([])}
            highContrast={highContrast}
            fontSize={fontSize}
            onExecuteCustomCommand={handleSendMessage}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            onToggleTask={(id) =>
              setTasks((prev) =>
                prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
              )
            }
            onToggleSubtask={(taskId, subtaskId) =>
              setTasks((prev) =>
                prev.map((t) => {
                  if (t.id !== taskId) return t;
                  return {
                    ...t,
                    steps: t.steps.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)),
                  };
                })
              )
            }
            onDeleteTask={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
            onOpenNewTaskModal={() => setIsTaskModalOpen(true)}
            onAiBreakdownTask={handleAiBreakdownTask}
            highContrast={highContrast}
            fontSize={fontSize}
          />
        )}

        {activeTab === 'home' && (
          <HomeAutomationView
            devices={devices}
            onUpdateDevice={(id, updates) =>
              setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)))
            }
            onBrewCoffee={handleBrewCoffee}
            onToggleAllLights={handleToggleAllLights}
            highContrast={highContrast}
          />
        )}

        {activeTab === 'phone' && (
          <PhoneControlView
            phone={phone}
            onUpdatePhone={(updates) => setPhone((prev) => ({ ...prev, ...updates }))}
            onAddAlarm={(time, label) =>
              setPhone((prev) => ({
                ...prev,
                alarm: { id: `alarm-${Date.now()}`, time, label, enabled: true },
              }))
            }
            onToggleAlarm={(enabled) =>
              setPhone((prev) => ({
                ...prev,
                alarm: prev.alarm ? { ...prev.alarm, enabled } : null,
              }))
            }
            highContrast={highContrast}
          />
        )}

        {activeTab === 'routines' && (
          <RoutinesView
            routines={routines}
            onExecuteRoutine={handleExecuteRoutine}
            onOpenNewRoutineModal={() => setIsRoutineModalOpen(true)}
            highContrast={highContrast}
          />
        )}

        {activeTab === 'voice-commands' && (
          <VoiceCommandsView
            commands={customCommands}
            onExecuteCommand={handleExecuteCommand}
            onDeleteCommand={(id) => setCustomCommands((prev) => prev.filter((c) => c.id !== id))}
            onOpenNewCommandModal={() => setIsCommandModalOpen(true)}
            highContrast={highContrast}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t px-2 py-1.5 flex items-center justify-around ${
          highContrast
            ? 'bg-black border-white/30 text-white'
            : 'bg-[#090A0C]/95 backdrop-blur-md border-[#1F242F] text-[#8490A0]'
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all relative cursor-pointer ${
                isActive
                  ? 'text-indigo-400 font-bold'
                  : 'hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label.split(' ')[0]}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={(data) => {
          const newTask: Task = {
            id: `task-${Date.now()}`,
            ...data,
            completed: false,
            steps: [],
            createdAt: new Date().toISOString(),
          };
          setTasks((prev) => [newTask, ...prev]);
        }}
      />

      <RoutineModal
        isOpen={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        onSave={(data) => {
          const newRoutine: Routine = {
            id: `routine-${Date.now()}`,
            ...data,
          };
          setRoutines((prev) => [newRoutine, ...prev]);
        }}
      />

      <VoiceCommandModal
        isOpen={isCommandModalOpen}
        onClose={() => setIsCommandModalOpen(false)}
        onSave={(data) => {
          const newCmd: CustomVoiceCommand = {
            id: `cmd-${Date.now()}`,
            ...data,
          };
          setCustomCommands((prev) => [newCmd, ...prev]);
        }}
      />
    </div>
  );
}
