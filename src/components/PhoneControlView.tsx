import React from 'react';
import { 
  Smartphone, 
  Moon, 
  Volume2, 
  VolumeX, 
  Volume1,
  Flashlight, 
  Sun, 
  BatteryMedium, 
  BatteryCharging, 
  BatteryWarning,
  AlarmClock, 
  Bell, 
  Eye, 
  ShieldAlert, 
  Sparkles,
  Vibrate,
  Plus
} from 'lucide-react';
import { PhoneState } from '../types';

interface PhoneControlViewProps {
  phone: PhoneState;
  onUpdatePhone: (updates: Partial<PhoneState>) => void;
  onAddAlarm: (time: string, label: string) => void;
  onToggleAlarm: (enabled: boolean) => void;
  highContrast: boolean;
}

export const PhoneControlView: React.FC<PhoneControlViewProps> = ({
  phone,
  onUpdatePhone,
  onAddAlarm,
  onToggleAlarm,
  highContrast,
}) => {
  return (
    <div id="phone-control-view" className="max-w-4xl mx-auto space-y-5">
      {/* Phone Header Summary Card */}
      <div className="bg-[#111318] rounded-2xl p-5 border border-[#1F242F] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <Smartphone className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                {phone.model}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30">
                Sincronizado
              </span>
            </div>
            <p className="text-xs text-[#8490A0] mt-0.5">
              Control remoto de ajustes del teléfono y automatización de llamadas/alertas
            </p>
          </div>
        </div>

        {/* Battery & Charging */}
        <div className="flex items-center gap-3 bg-[#161922] px-4 py-2.5 rounded-xl border border-[#222834]">
          {phone.isCharging ? (
            <BatteryCharging className="w-5 h-5 text-emerald-400" />
          ) : phone.batteryLevel < 20 ? (
            <BatteryWarning className="w-5 h-5 text-rose-400" />
          ) : (
            <BatteryMedium className="w-5 h-5 text-indigo-400" />
          )}
          <div>
            <div className="text-xs text-[#8490A0]">Batería</div>
            <div className="text-sm font-bold text-white">
              {phone.batteryLevel}% {phone.isCharging && '(Cargando)'}
            </div>
          </div>
          <button
            onClick={() => onUpdatePhone({ isCharging: !phone.isCharging })}
            className="text-[10px] px-2 py-1 bg-[#1E232E] hover:bg-[#282F3E] text-[#C5CED9] hover:text-white rounded-md border border-[#2D3546] font-medium ml-2 transition-colors cursor-pointer"
          >
            {phone.isCharging ? 'Desconectar' : 'Conectar'}
          </button>
        </div>
      </div>

      {/* Grid of Phone Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Modos de Sonido & No Molestar */}
        <div className="bg-[#111318] rounded-2xl p-5 border border-[#1F242F] shadow-md space-y-4">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>Perfil de Sonido & Modo Silencio</span>
          </h3>

          {/* Ringer Selector */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'normal', label: 'Sonido', icon: Volume2 },
              { id: 'vibrate', label: 'Vibración', icon: Vibrate },
              { id: 'silent', label: 'Silencio', icon: VolumeX },
            ].map((mode) => {
              const Icon = mode.icon;
              const isSelected = phone.ringerMode === mode.id;
              return (
                <button
                  key={mode.id}
                  id={`phone-ringer-${mode.id}`}
                  onClick={() => onUpdatePhone({ ringerMode: mode.id as any })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-[#161922] text-[#8490A0] border-[#222834] hover:bg-[#1E232E] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Volume slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#8490A0]">
              <span>Volumen de multimedia y llamadas</span>
              <span className="font-semibold text-white">
                {phone.volumeLevel}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={phone.volumeLevel}
              onChange={(e) => onUpdatePhone({ volumeLevel: Number(e.target.value) })}
              className="w-full h-1.5 bg-[#181B24] rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* DND Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#161922] border border-[#222834]">
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Modo No Molestar (DND)
                </span>
                <span className="text-[11px] text-[#8490A0]">Silencia llamadas y avisos</span>
              </div>
            </div>
            <button
              id="phone-toggle-dnd"
              onClick={() => onUpdatePhone({ dnd: !phone.dnd })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                phone.dnd ? 'bg-indigo-600' : 'bg-[#222834]'
              }`}
              aria-label="Alternar modo no molestar"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                  phone.dnd ? 'translate-x-6' : 'translate-x-1'
                } top-1 absolute`}
              />
            </button>
          </div>
        </div>

        {/* 2. Pantalla, Linterna y Modos Rápidos */}
        <div className="bg-[#111318] rounded-2xl p-5 border border-[#1F242F] shadow-md space-y-4">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Pantalla, Linterna y Rendimiento</span>
          </h3>

          {/* Screen Brightness */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#8490A0]">
              <span>Brillo de pantalla</span>
              <span className="font-semibold text-white">
                {phone.brightness}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={phone.brightness}
              onChange={(e) => onUpdatePhone({ brightness: Number(e.target.value) })}
              className="w-full h-1.5 bg-[#181B24] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Flashlight & Eye Comfort toggles */}
          <div className="grid grid-cols-2 gap-3">
            <button
              id="phone-toggle-flashlight"
              onClick={() => onUpdatePhone({ flashlight: !phone.flashlight })}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                phone.flashlight
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 font-bold ring-1 ring-amber-400/30'
                  : 'bg-[#161922] text-[#8490A0] border-[#222834] hover:bg-[#1E232E] hover:text-white'
              }`}
            >
              <Flashlight className={`w-5 h-5 ${phone.flashlight ? 'text-amber-400 fill-amber-400' : ''}`} />
              <span className="text-xs font-medium">
                {phone.flashlight ? '🔦 Linterna Encendida' : 'Linterna Apagada'}
              </span>
            </button>

            <button
              id="phone-toggle-focus"
              onClick={() => onUpdatePhone({ focusMode: !phone.focusMode })}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                phone.focusMode
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400/50 font-bold ring-1 ring-purple-400/30'
                  : 'bg-[#161922] text-[#8490A0] border-[#222834] hover:bg-[#1E232E] hover:text-white'
              }`}
            >
              <Sparkles className={`w-5 h-5 ${phone.focusMode ? 'text-purple-400' : ''}`} />
              <span className="text-xs font-medium">
                {phone.focusMode ? '🎯 Modo Enfoque Activo' : 'Modo Enfoque'}
              </span>
            </button>
          </div>

          {/* Battery Saver */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#161922] border border-[#222834]">
            <div>
              <span className="text-xs font-semibold text-white block">
                Ahorro de Batería (Eco)
              </span>
              <span className="text-[11px] text-[#8490A0]">Reduce tareas de fondo</span>
            </div>
            <button
              onClick={() => onUpdatePhone({ batterySaver: !phone.batterySaver })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                phone.batterySaver ? 'bg-emerald-600' : 'bg-[#222834]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                  phone.batterySaver ? 'translate-x-6' : 'translate-x-1'
                } top-1 absolute`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Alarmas y Notificaciones Recientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Alarm */}
        <div className="bg-[#111318] rounded-2xl p-5 border border-[#1F242F] shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <AlarmClock className="w-4 h-4 text-rose-400" />
              <span>Alarma & Despertador</span>
            </h3>
            {phone.alarm && (
              <button
                onClick={() => onToggleAlarm(!phone.alarm?.enabled)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition-colors cursor-pointer ${
                  phone.alarm.enabled
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : 'bg-[#161922] text-[#8490A0] border-[#222834]'
                }`}
              >
                {phone.alarm.enabled ? 'Activada' : 'Pausada'}
              </button>
            )}
          </div>

          {phone.alarm ? (
            <div className="p-4 rounded-xl bg-[#161922] border border-[#222834] flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-white">
                  {phone.alarm.time}
                </span>
                <span className="text-xs text-[#8490A0] block mt-0.5">
                  {phone.alarm.label}
                </span>
              </div>
              <AlarmClock className={`w-8 h-8 ${phone.alarm.enabled ? 'text-rose-400 animate-pulse' : 'text-[#8490A0]'}`} />
            </div>
          ) : (
            <p className="text-xs text-[#8490A0]">No hay alarma activa configurada.</p>
          )}

          {/* Quick set alarm buttons */}
          <div className="flex items-center gap-2 pt-1">
            {['07:00', '07:30', '08:00', '08:30'].map((t) => (
              <button
                key={t}
                onClick={() => onAddAlarm(t, 'Despertador')}
                className="flex-1 py-1.5 text-xs font-semibold bg-[#161922] hover:bg-[#1E232E] border border-[#222834] rounded-lg text-[#C5CED9] hover:text-white transition-colors cursor-pointer"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="bg-[#111318] rounded-2xl p-5 border border-[#1F242F] shadow-md space-y-3">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <span>Notificaciones Sincronizadas</span>
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {phone.notifications.length === 0 ? (
              <p className="text-xs text-[#8490A0] text-center py-4">
                Bandeja de notificaciones limpia.
              </p>
            ) : (
              phone.notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-2.5 rounded-xl bg-[#161922] border border-[#222834] text-xs"
                >
                  <div className="flex items-center justify-between text-[#8490A0] text-[10px] mb-1">
                    <span className="font-bold text-indigo-400">{notif.app}</span>
                    <span>{notif.time}</span>
                  </div>
                  <div className="font-semibold text-white">{notif.title}</div>
                  <div className="text-[#8490A0] text-[11px] mt-0.5">{notif.body}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
