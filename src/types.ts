export type Priority = 'alta' | 'media' | 'baja';
export type TaskCategory = 'trabajo' | 'hogar' | 'personal' | 'salud' | 'compras';

export interface SubTask {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  completed: boolean;
  dueDate?: string; // "14:30" or "Hoy a las 18:00" or ISO
  estimatedMinutes?: number;
  steps: SubTask[];
  createdAt: string;
}

export type DeviceType = 
  | 'light' 
  | 'thermostat' 
  | 'lock' 
  | 'blinds' 
  | 'coffee' 
  | 'vacuum' 
  | 'speaker' 
  | 'camera';

export type Room = 'salon' | 'dormitorio' | 'cocina' | 'estudio' | 'bano' | 'exterior';

export interface SmartDevice {
  id: string;
  name: string;
  room: Room;
  type: DeviceType;
  status: boolean; // on/off, unlocked/locked, etc.
  brightness?: number; // 0-100
  color?: string; // warm, cool, daylight, or hex
  targetTemperature?: number; // °C
  currentTemperature?: number; // °C
  humidity?: number; // %
  mode?: 'cool' | 'heat' | 'eco' | 'auto' | 'off';
  position?: number; // 0-100% for blinds (0 = closed, 100 = open)
  coffeeMode?: 'espresso' | 'americano' | 'latte' | 'cappuccino';
  coffeeBrewing?: boolean;
  vacuumState?: 'cleaning' | 'docked' | 'paused' | 'returning';
  vacuumBattery?: number;
  speakerPlaying?: boolean;
  speakerVolume?: number;
  speakerTrack?: string;
  cameraActive?: boolean;
  motionDetected?: boolean;
}

export interface PhoneAlarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
}

export interface PhoneNotification {
  id: string;
  app: string;
  title: string;
  body: string;
  time: string;
}

export interface PhoneState {
  model: string;
  dnd: boolean; // Do Not Disturb
  focusMode: boolean;
  batterySaver: boolean;
  batteryLevel: number;
  isCharging: boolean;
  flashlight: boolean;
  volumeLevel: number; // 0-100
  ringerMode: 'normal' | 'vibrate' | 'silent';
  brightness: number; // 0-100
  eyeComfort: boolean; // Luz nocturna
  alarm?: PhoneAlarm | null;
  notifications: PhoneNotification[];
}

export interface ExecutedAction {
  type: 'task' | 'device' | 'phone' | 'routine' | 'command';
  description: string;
  icon?: string;
  status: 'success' | 'warning' | 'info';
}

export interface CustomVoiceCommand {
  id: string;
  phrase: string;
  description: string;
  icon: string;
  isCustom?: boolean;
  actions: {
    target: 'task' | 'device' | 'phone' | 'routine';
    action: string;
    payload: any;
  }[];
}

export interface Routine {
  id: string;
  name: string;
  icon: string;
  description: string;
  timeTrigger?: string;
  voiceTrigger: string;
  isActive?: boolean;
  actionsCount: number;
  actions: {
    target: 'task' | 'device' | 'phone';
    action: string;
    payload: any;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  executedActions?: ExecutedAction[];
  suggestions?: string[];
  audioBase64?: string;
}

export type ActiveTab = 'chat' | 'tasks' | 'home' | 'phone' | 'routines' | 'voice-commands';
