import React, { useState } from 'react';
import { 
  Lightbulb, 
  Thermometer, 
  Lock, 
  Unlock, 
  Blinds, 
  Coffee, 
  Sparkles, 
  Speaker, 
  Camera, 
  Power, 
  Volume2, 
  Play, 
  Pause, 
  Flame, 
  Snowflake, 
  Leaf, 
  RotateCw,
  Plus,
  Tv
} from 'lucide-react';
import { SmartDevice, Room, DeviceType } from '../types';

interface HomeAutomationViewProps {
  devices: SmartDevice[];
  onUpdateDevice: (deviceId: string, updates: Partial<SmartDevice>) => void;
  onBrewCoffee: (deviceId: string, mode: 'espresso' | 'americano' | 'latte' | 'cappuccino') => void;
  onToggleAllLights: (turnOn: boolean) => void;
  highContrast: boolean;
}

const ROOMS: { id: Room | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Toda la casa' },
  { id: 'salon', label: 'Salón' },
  { id: 'dormitorio', label: 'Dormitorio' },
  { id: 'cocina', label: 'Cocina' },
  { id: 'estudio', label: 'Estudio' },
  { id: 'exterior', label: 'Exterior' },
];

export const HomeAutomationView: React.FC<HomeAutomationViewProps> = ({
  devices,
  onUpdateDevice,
  onBrewCoffee,
  onToggleAllLights,
  highContrast,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | 'todas'>('todas');

  const filteredDevices = devices.filter((d) => {
    if (selectedRoom === 'todas') return true;
    return d.room === selectedRoom;
  });

  const activeCount = devices.filter((d) => d.status).length;

  const renderDeviceIcon = (device: SmartDevice) => {
    switch (device.type) {
      case 'light':
        return <Lightbulb className={`w-5 h-5 ${device.status ? 'text-amber-500 fill-amber-400/20' : 'text-slate-400'}`} />;
      case 'thermostat':
        return <Thermometer className={`w-5 h-5 ${device.status ? 'text-rose-500' : 'text-slate-400'}`} />;
      case 'lock':
        return device.status ? <Lock className="w-5 h-5 text-emerald-500" /> : <Unlock className="w-5 h-5 text-rose-500" />;
      case 'blinds':
        return <Blinds className="w-5 h-5 text-indigo-500" />;
      case 'coffee':
        return <Coffee className={`w-5 h-5 ${device.coffeeBrewing ? 'text-amber-600 animate-bounce' : 'text-amber-500'}`} />;
      case 'vacuum':
        return <Sparkles className={`w-5 h-5 ${device.vacuumState === 'cleaning' ? 'text-teal-500 animate-spin' : 'text-slate-400'}`} />;
      case 'speaker':
        return <Speaker className={`w-5 h-5 ${device.speakerPlaying ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />;
      case 'camera':
        return <Camera className={`w-5 h-5 ${device.cameraActive ? 'text-emerald-500' : 'text-slate-400'}`} />;
      default:
        return <Lightbulb className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div id="home-automation-view" className="max-w-5xl mx-auto space-y-5">
      {/* Header & Quick All-Off/On */}
      <div className="bg-[#111318] rounded-2xl p-5 border border-[#1F242F] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Control de Dispositivos Conectados</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30">
              {activeCount} activos
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8490A0] mt-1">
            Control domótico en tiempo real con integración de voz personalizada
          </p>
        </div>

        {/* Global toggles */}
        <div className="flex items-center gap-2">
          <button
            id="btn-all-lights-on"
            onClick={() => onToggleAllLights(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#161922] hover:bg-amber-950/40 hover:text-amber-300 text-[#C5CED9] transition-colors border border-[#222834] active:scale-95"
          >
            💡 Encender Luces
          </button>
          <button
            id="btn-all-lights-off"
            onClick={() => onToggleAllLights(false)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#161922] hover:bg-rose-950/40 hover:text-rose-300 text-[#C5CED9] transition-colors border border-[#222834] active:scale-95"
          >
            Apagar Todo
          </button>
        </div>
      </div>

      {/* Room Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {ROOMS.map((room) => (
          <button
            key={room.id}
            id={`filter-room-${room.id}`}
            onClick={() => setSelectedRoom(room.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedRoom === room.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-[#111318] text-[#8490A0] border-[#1F242F] hover:bg-[#161922] hover:text-white'
            }`}
          >
            {room.label}
          </button>
        ))}
      </div>

      {/* Grid of smart devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => (
          <div
            key={device.id}
            id={`device-card-${device.id}`}
            className={`bg-[#111318] rounded-2xl p-5 border transition-all duration-200 shadow-sm flex flex-col justify-between ${
              device.status
                ? 'border-indigo-500/40 ring-1 ring-indigo-500/20'
                : 'border-[#1F242F] opacity-90'
            } ${highContrast ? 'border-2 border-white' : ''}`}
          >
            {/* Top Bar: Icon, Name, Room, Main Toggle */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${device.status ? 'bg-indigo-950/50 border border-indigo-500/30' : 'bg-[#161922] border border-[#222834]'}`}>
                  {renderDeviceIcon(device)}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">
                    {device.name}
                  </h3>
                  <span className="text-[11px] font-medium text-[#8490A0] capitalize">
                    {device.room}
                  </span>
                </div>
              </div>

              {/* Power Toggle Button (except for locks which toggle lock) */}
              <button
                id={`toggle-device-btn-${device.id}`}
                onClick={() => {
                  if (device.type === 'coffee') {
                    if (!device.coffeeBrewing) {
                      onBrewCoffee(device.id, device.coffeeMode || 'espresso');
                    } else {
                      onUpdateDevice(device.id, { coffeeBrewing: false, status: false });
                    }
                  } else if (device.type === 'vacuum') {
                    const nextState = device.vacuumState === 'cleaning' ? 'docked' : 'cleaning';
                    onUpdateDevice(device.id, { 
                      status: nextState === 'cleaning', 
                      vacuumState: nextState 
                    });
                  } else if (device.type === 'lock') {
                    onUpdateDevice(device.id, { status: !device.status });
                  } else {
                    onUpdateDevice(device.id, { status: !device.status });
                  }
                }}
                className={`p-2 rounded-xl transition-colors shrink-0 ${
                  device.status
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-[#161922] border border-[#222834] text-[#8490A0] hover:text-white'
                }`}
                title={device.status ? 'Desactivar' : 'Activar'}
                aria-label={`Alternar estado de ${device.name}`}
              >
                <Power className="w-4 h-4" />
              </button>
            </div>

            {/* Specific Device Controls */}
            <div className="pt-2 border-t border-[#1C202A] space-y-3">
              {/* 1. LIGHT CONTROLS */}
              {device.type === 'light' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#8490A0]">
                    <span>Brillo</span>
                    <span className="font-semibold text-white">
                      {device.status ? `${device.brightness || 0}%` : 'Apagado'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    disabled={!device.status}
                    value={device.brightness || 0}
                    onChange={(e) =>
                      onUpdateDevice(device.id, { brightness: Number(e.target.value), status: Number(e.target.value) > 0 })
                    }
                    className="w-full h-1.5 bg-[#181B24] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  {/* Color Temperature pills */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {(['warm', 'daylight', 'cool'] as const).map((temp) => (
                      <button
                        key={temp}
                        onClick={() => onUpdateDevice(device.id, { color: temp, status: true })}
                        className={`flex-1 py-1 text-[10px] font-semibold rounded-md transition-all ${
                          device.color === temp && device.status
                            ? temp === 'warm'
                              ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/50'
                              : temp === 'cool'
                                ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/50'
                                : 'bg-slate-700/60 text-white ring-1 ring-slate-400/50'
                            : 'bg-[#161922] text-[#8490A0] border border-[#222834]'
                        }`}
                      >
                        {temp === 'warm' ? 'Cálida' : temp === 'daylight' ? 'Neutra' : 'Fría'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. THERMOSTAT CONTROLS */}
              {device.type === 'thermostat' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#8490A0] block">Actual</span>
                      <span className="text-xl font-bold text-white">
                        {device.currentTemperature}°C
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onUpdateDevice(device.id, {
                            targetTemperature: Math.max(16, (device.targetTemperature || 21) - 0.5),
                          })
                        }
                        className="w-8 h-8 rounded-lg bg-[#161922] hover:bg-[#1C212D] border border-[#222834] font-bold text-sm text-white flex items-center justify-center active:scale-95"
                      >
                        -
                      </button>
                      <div className="text-center px-1">
                        <span className="text-xs text-[#8490A0] block">Objetivo</span>
                        <span className="text-lg font-bold text-indigo-400">
                          {device.targetTemperature}°C
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onUpdateDevice(device.id, {
                            targetTemperature: Math.min(30, (device.targetTemperature || 21) + 0.5),
                          })
                        }
                        className="w-8 h-8 rounded-lg bg-[#161922] hover:bg-[#1C212D] border border-[#222834] font-bold text-sm text-white flex items-center justify-center active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Modes */}
                  <div className="flex items-center gap-1">
                    {(['auto', 'cool', 'heat', 'eco'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => onUpdateDevice(device.id, { mode: m })}
                        className={`flex-1 py-1 text-[10px] font-semibold rounded-md capitalize transition-all ${
                          device.mode === m
                            ? 'bg-indigo-600 text-white'
                            : 'bg-[#161922] text-[#8490A0] border border-[#222834]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. BLINDS CONTROLS */}
              {device.type === 'blinds' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8490A0]">
                    <span>Apertura</span>
                    <span className="font-semibold text-white">
                      {device.position}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={device.position || 0}
                    onChange={(e) => onUpdateDevice(device.id, { position: Number(e.target.value) })}
                    className="w-full h-1.5 bg-[#181B24] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onUpdateDevice(device.id, { position: 0 })}
                      className="flex-1 py-1 text-[10px] font-medium bg-[#161922] border border-[#222834] text-[#8490A0] hover:text-white rounded-md"
                    >
                      Bajar (0%)
                    </button>
                    <button
                      onClick={() => onUpdateDevice(device.id, { position: 50 })}
                      className="flex-1 py-1 text-[10px] font-medium bg-[#161922] border border-[#222834] text-[#8490A0] hover:text-white rounded-md"
                    >
                      Media (50%)
                    </button>
                    <button
                      onClick={() => onUpdateDevice(device.id, { position: 100 })}
                      className="flex-1 py-1 text-[10px] font-medium bg-[#161922] border border-[#222834] text-[#8490A0] hover:text-white rounded-md"
                    >
                      Subir (100%)
                    </button>
                  </div>
                </div>
              )}

              {/* 4. COFFEE MAKER */}
              {device.type === 'coffee' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8490A0]">Modo de café:</span>
                    <span className="font-semibold text-amber-400 capitalize">
                      {device.coffeeMode}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['espresso', 'americano', 'latte', 'cappuccino'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => onUpdateDevice(device.id, { coffeeMode: mode })}
                        className={`py-1 text-[11px] font-medium rounded-md capitalize transition-all ${
                          device.coffeeMode === mode
                            ? 'bg-amber-500/20 text-amber-300 font-bold ring-1 ring-amber-400/50'
                            : 'bg-[#161922] text-[#8490A0] border border-[#222834]'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  <button
                    id="btn-brew-coffee-card"
                    onClick={() => onBrewCoffee(device.id, device.coffeeMode || 'espresso')}
                    disabled={device.coffeeBrewing}
                    className={`w-full py-1.5 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                      device.coffeeBrewing
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95 cursor-pointer'
                    }`}
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    <span>{device.coffeeBrewing ? '☕ Preparando café...' : 'Preparar taza'}</span>
                  </button>
                </div>
              )}

              {/* 5. VACUUM ROBOT */}
              {device.type === 'vacuum' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8490A0]">Estado:</span>
                    <span className="font-semibold text-white capitalize">
                      {device.vacuumState === 'cleaning' ? 'Limpiando casa' : device.vacuumState === 'docked' ? 'En estación de carga' : 'Pausado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#8490A0]">
                    <span>Batería</span>
                    <span className="font-medium text-emerald-400">
                      {device.vacuumBattery}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        onUpdateDevice(device.id, {
                          status: device.vacuumState !== 'cleaning',
                          vacuumState: device.vacuumState === 'cleaning' ? 'docked' : 'cleaning',
                        })
                      }
                      className="flex-1 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                    >
                      {device.vacuumState === 'cleaning' ? 'Volver a Base' : 'Iniciar Limpieza'}
                    </button>
                  </div>
                </div>
              )}

              {/* 6. SPEAKER */}
              {device.type === 'speaker' && (
                <div className="space-y-2">
                  <div className="text-xs text-[#8490A0] truncate">
                    🎵 {device.speakerTrack || 'Lofi & Ambient Focus'}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => onUpdateDevice(device.id, { speakerPlaying: !device.speakerPlaying })}
                      className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                    >
                      {device.speakerPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <div className="flex-1 flex items-center gap-2">
                      <Volume2 className="w-3.5 h-3.5 text-[#8490A0]" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={device.speakerVolume || 40}
                        onChange={(e) => onUpdateDevice(device.id, { speakerVolume: Number(e.target.value) })}
                        className="w-full h-1.5 bg-[#181B24] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 7. LOCK */}
              {device.type === 'lock' && (
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-[#8490A0]">Seguridad:</span>
                  <span className={`font-bold ${device.status ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {device.status ? '🔒 Cerrojo Asegurado' : '🔓 Puerta Abierta'}
                  </span>
                </div>
              )}

              {/* 8. CAMERA */}
              {device.type === 'camera' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8490A0]">Transmisión:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      En vivo HD
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onUpdateDevice(device.id, { motionDetected: true });
                      setTimeout(() => onUpdateDevice(device.id, { motionDetected: false }), 4000);
                    }}
                    className="w-full py-1 text-[11px] bg-[#161922] border border-[#222834] text-[#C5CED9] hover:text-white rounded-md"
                  >
                    {device.motionDetected ? '⚠️ ¡Movimiento detectado!' : 'Simular Sensor de Movimiento'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
