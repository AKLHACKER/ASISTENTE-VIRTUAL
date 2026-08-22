import React, { useState } from 'react';
import { 
  Smartphone, 
  Moon, 
  Volume2, 
  VolumeX, 
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
  Plus,
  Send,
  Sliders,
  CheckCircle2,
  ExternalLink,
  Wifi,
  HelpCircle,
  Clock,
  Mic,
  Copy,
  Check
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
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [testNotificationText, setTestNotificationText] = useState('');
  const [showMacroGuide, setShowMacroGuide] = useState(true);
  const [macroUrl, setMacroUrl] = useState(() => {
    return localStorage.getItem('aura_macrodroid_url') || 'https://trigger.macrodroid.com/7e08d103-de70-4d66-a0a2-e67ed3a624fb/aura_comando';
  });
  const [triggerStatus, setTriggerStatus] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);

  // Save macro URL to localStorage
  const handleSaveMacroUrl = (val: string) => {
    setMacroUrl(val);
    localStorage.setItem('aura_macrodroid_url', val);
  };

  // Trigger MacroDroid physically on user's Android
  const triggerMacroDroid = async (action: string, value: string = '', msg: string = '') => {
    if (!macroUrl) return;
    setIsTriggering(true);
    setTriggerStatus('Enviando señal a tu Android...');
    try {
      // First try via local server endpoint
      const res = await fetch('/api/phone/trigger-macrodroid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: macroUrl, action, value, message: msg })
      });
      if (res.ok) {
        setTriggerStatus('✅ Señal ejecutada en MacroDroid en tu móvil');
      } else {
        // Fallback direct GET from client
        const url = new URL(macroUrl);
        url.searchParams.set('action', action);
        if (value) url.searchParams.set('value', value);
        await fetch(url.toString(), { mode: 'no-cors' });
        setTriggerStatus('✅ Señal enviada a tu dispositivo');
      }
    } catch {
      // Direct GET fallback
      try {
        const url = new URL(macroUrl);
        url.searchParams.set('action', action);
        if (value) url.searchParams.set('value', value);
        await fetch(url.toString(), { mode: 'no-cors' });
        setTriggerStatus('✅ Señal enviada a tu dispositivo');
      } catch (err) {
        setTriggerStatus('⚠️ No se pudo contactar con MacroDroid');
      }
    } finally {
      setIsTriggering(false);
      setTimeout(() => setTriggerStatus(null), 3500);
    }
  };

  // Trigger web notification if browser permits
  const handleTriggerDeviceNotification = (title: string, body: string) => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: './icon-192.png' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification(title, { body, icon: './icon-192.png' });
          }
        });
      }
    }

    // Also trigger MacroDroid with notification text
    triggerMacroDroid('notification', title, body);

    // Add to state notifications list
    const newNotif = {
      id: `notif-${Date.now()}`,
      app: 'Aura Android',
      title,
      body,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    onUpdatePhone({
      notifications: [newNotif, ...phone.notifications.slice(0, 7)],
    });
  };

  const handleCopyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/phone/webhook`;
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

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
              <input
                type="text"
                value={phone.model}
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdatePhone({ model: val });
                  localStorage.setItem('aura_phone_model_name', val);
                }}
                className="text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-[#3A4456] focus:border-indigo-500 focus:outline-none transition-colors"
                title="Haz clic para escribir el nombre de tu teléfono"
              />
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30">
                Android Conectado
              </span>
            </div>
            <p className="text-xs text-[#8490A0] mt-0.5">
              Control de ajustes, notificaciones y automatizaciones para tu teléfono
            </p>
          </div>
        </div>

        {/* Battery & Charging */}
        <div className="flex items-center gap-3 bg-[#161922] px-4 py-2.5 rounded-xl border border-[#222834]">
          {phone.isCharging ? (
            <BatteryCharging className="w-5 h-5 text-emerald-400 animate-pulse" />
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
            className="text-[10px] px-2.5 py-1 bg-[#1E232E] hover:bg-[#282F3E] text-[#C5CED9] hover:text-white rounded-md border border-[#2D3546] font-medium ml-2 transition-colors cursor-pointer"
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
                  onClick={() => {
                    onUpdatePhone({ ringerMode: mode.id as any });
                    if (navigator.vibrate && mode.id === 'vibrate') {
                      navigator.vibrate(200);
                    }
                    triggerMacroDroid('ringer_mode', mode.id, `Modo de sonido cambiado a ${mode.label}`);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all border cursor-pointer ${
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
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdatePhone({ volumeLevel: val });
              }}
              onMouseUp={(e) => {
                const val = Number((e.target as HTMLInputElement).value);
                triggerMacroDroid('volume', String(val), `Ajustar volumen a ${val}%`);
              }}
              onTouchEnd={(e) => {
                const val = Number((e.target as HTMLInputElement).value);
                triggerMacroDroid('volume', String(val), `Ajustar volumen a ${val}%`);
              }}
              className="w-full h-1.5 bg-[#181B24] rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* DND Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#161922] border border-[#222834]">
            <div className="flex items-center gap-2.5">
              <Moon className={`w-4 h-4 ${phone.dnd ? 'text-amber-400' : 'text-[#8490A0]'}`} />
              <div>
                <div className="text-xs font-semibold text-white">Modo No Molestar</div>
                <div className="text-[11px] text-[#8490A0]">Silencia notificaciones entrantes</div>
              </div>
            </div>
            <button
              onClick={() => {
                const nextDnd = !phone.dnd;
                onUpdatePhone({ dnd: nextDnd });
                triggerMacroDroid('dnd', nextDnd ? 'on' : 'off', nextDnd ? 'Activar No Molestar' : 'Desactivar No Molestar');
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                phone.dnd ? 'bg-amber-500' : 'bg-[#2A3140]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                  phone.dnd ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2. Pantalla, Linterna y Modos Rápidos */}
        <div className="bg-[#111318] rounded-2xl p-5 border border-[#1F242F] shadow-md space-y-4">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Pantalla & Hardware de tu Móvil</span>
          </h3>

          {/* Brightness slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#8490A0]">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Brillo de pantalla
              </span>
              <span className="font-semibold text-white">{phone.brightness}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={phone.brightness}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdatePhone({ brightness: val });
              }}
              onMouseUp={(e) => {
                const val = Number((e.target as HTMLInputElement).value);
                triggerMacroDroid('brightness', String(val), `Ajustar brillo a ${val}%`);
              }}
              onTouchEnd={(e) => {
                const val = Number((e.target as HTMLInputElement).value);
                triggerMacroDroid('brightness', String(val), `Ajustar brillo a ${val}%`);
              }}
              className="w-full h-1.5 bg-[#181B24] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Flashlight */}
            <button
              onClick={() => {
                const nextTorch = !phone.flashlight;
                onUpdatePhone({ flashlight: nextTorch });
                triggerMacroDroid('flashlight', nextTorch ? 'on' : 'off', nextTorch ? 'Encender linterna' : 'Apagar linterna');
              }}
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                phone.flashlight
                  ? 'bg-amber-500/15 border-amber-500/30 text-white'
                  : 'bg-[#161922] border-[#222834] text-[#8490A0] hover:text-white'
              }`}
            >
              <Flashlight className={`w-5 h-5 ${phone.flashlight ? 'text-amber-400' : 'text-[#8490A0]'}`} />
              <div>
                <div className="text-xs font-semibold text-white">Linterna</div>
                <div className="text-[10px] text-[#8490A0]">{phone.flashlight ? 'Encendida' : 'Apagada'}</div>
              </div>
            </button>

            {/* Eye Comfort / Night Shield */}
            <button
              onClick={() => {
                const nextEye = !phone.eyeComfort;
                onUpdatePhone({ eyeComfort: nextEye });
                triggerMacroDroid('eye_comfort', nextEye ? 'on' : 'off', nextEye ? 'Activar luz nocturna' : 'Desactivar luz nocturna');
              }}
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                phone.eyeComfort
                  ? 'bg-indigo-500/15 border-indigo-500/30 text-white'
                  : 'bg-[#161922] border-[#222834] text-[#8490A0] hover:text-white'
              }`}
            >
              <Eye className={`w-5 h-5 ${phone.eyeComfort ? 'text-indigo-400' : 'text-[#8490A0]'}`} />
              <div>
                <div className="text-xs font-semibold text-white">Luz Nocturna</div>
                <div className="text-[10px] text-[#8490A0]">{phone.eyeComfort ? 'Activa' : 'Desactivada'}</div>
              </div>
            </button>
          </div>

          {/* Focus Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#161922] border border-[#222834]">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className={`w-4 h-4 ${phone.focusMode ? 'text-indigo-400' : 'text-[#8490A0]'}`} />
              <div>
                <div className="text-xs font-semibold text-white">Modo Concentración</div>
                <div className="text-[11px] text-[#8490A0]">Bloquea apps distractoras</div>
              </div>
            </div>
            <button
              onClick={() => onUpdatePhone({ focusMode: !phone.focusMode })}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                phone.focusMode ? 'bg-indigo-600' : 'bg-[#2A3140]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                  phone.focusMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Alarmas y Enviar Notificación al Móvil */}
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
            {['06:30', '07:00', '07:30', '08:00'].map((t) => (
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

        {/* Notifications & Push Simulator */}
        <div className="bg-[#111318] rounded-2xl p-5 border border-[#1F242F] shadow-md space-y-3">
          <h3 className="font-semibold text-sm text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span>Notificaciones de Android</span>
            </span>
            <button
              onClick={() => handleTriggerDeviceNotification('Aura Android', 'Prueba de alerta sincronizada')}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/30 transition-colors"
            >
              Probar Alerta
            </button>
          </h3>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enviar recordatorio rápido al teléfono..."
              value={testNotificationText}
              onChange={(e) => setTestNotificationText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && testNotificationText.trim()) {
                  handleTriggerDeviceNotification('Recordatorio Aura', testNotificationText);
                  setTestNotificationText('');
                }
              }}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#161922] border border-[#222834] text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => {
                if (testNotificationText.trim()) {
                  handleTriggerDeviceNotification('Recordatorio Aura', testNotificationText);
                  setTestNotificationText('');
                }
              }}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto pt-1">
            {phone.notifications.length === 0 ? (
              <p className="text-xs text-[#8490A0] text-center py-3">
                Bandeja de notificaciones sincronizada.
              </p>
            ) : (
              phone.notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-2 rounded-xl bg-[#161922] border border-[#222834] text-xs"
                >
                  <div className="flex items-center justify-between text-[#8490A0] text-[10px] mb-0.5">
                    <span className="font-bold text-indigo-400">{notif.app}</span>
                    <span>{notif.time}</span>
                  </div>
                  <div className="font-semibold text-white">{notif.title}</div>
                  <div className="text-[#8490A0] text-[11px]">{notif.body}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Guía y Conexión en Vivo con MacroDroid */}
      <div className="bg-[#111318] rounded-2xl p-5 border border-indigo-500/30 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Conexión en Vivo con MacroDroid (Android)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Activa
                </span>
              </h3>
              <p className="text-xs text-[#8490A0]">
                Dispara automatizaciones reales directamente en tu teléfono móvil
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowMacroGuide(!showMacroGuide)} 
            className="text-xs text-indigo-400 font-semibold hover:underline self-start sm:self-auto cursor-pointer"
          >
            {showMacroGuide ? 'Ocultar detalles' : 'Ver configuración'}
          </button>
        </div>

        {/* URL Input & Quick Test */}
        <div className="p-4 bg-[#161922] rounded-xl border border-[#222834] space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#C5CED9] block mb-1">
              Tu URL Webhook de MacroDroid:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={macroUrl}
                onChange={(e) => handleSaveMacroUrl(e.target.value)}
                placeholder="https://trigger.macrodroid.com/..."
                className="flex-1 px-3 py-2 text-xs font-mono rounded-lg bg-[#0F1117] border border-[#2B3342] text-indigo-300 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => triggerMacroDroid('aura_test', '1', 'Prueba desde Aura')}
                disabled={isTriggering}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isTriggering ? 'Enviando...' : '⚡ Disparar Prueba'}</span>
              </button>
            </div>
          </div>

          {/* Quick Action Triggers */}
          <div className="pt-1">
            <div className="text-[11px] text-[#8490A0] mb-1.5 font-medium">Probar tus 4 macros en el móvil:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: '🔦 Probar Linterna', action: 'flashlight', val: 'on' },
                { label: '☀️ Probar Brillo 80%', action: 'brightness', val: '80' },
                { label: '🔊 Probar Volumen 70%', action: 'volume', val: '70' },
                { label: '🌙 Probar Silencio (DND)', action: 'dnd', val: 'on' },
              ].map((btn) => (
                <button
                  key={btn.action}
                  onClick={() => triggerMacroDroid(btn.action, btn.val, `Prueba de ${btn.label}`)}
                  className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-[#1E232E] hover:bg-indigo-600/30 text-[#C5CED9] hover:text-white border border-[#2E3648] hover:border-indigo-500/40 transition-colors cursor-pointer text-center"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Status Feedback */}
          {triggerStatus && (
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs font-medium text-indigo-300 animate-fadeIn">
              {triggerStatus}
            </div>
          )}
        </div>

        {showMacroGuide && (
          <div className="pt-2 text-xs text-[#AAB5C4] space-y-2 border-t border-[#1F242F]">
            <p className="font-semibold text-white">¿Cómo configurar tu teléfono en MacroDroid?</p>
            <ol className="list-decimal list-inside space-y-1 text-[#8490A0]">
              <li>En la app <strong className="text-white">MacroDroid</strong>, crea una nueva Macro con Disparador (Trigger): <strong className="text-white">Webhook</strong>.</li>
              <li>En Identificador pon: <strong className="text-indigo-300">aura_comando</strong>.</li>
              <li>En Acciones (+), elige lo que quieras que haga tu móvil (ejemplo: cambiar volumen, silenciar, encender linterna, etc.).</li>
              <li>Al pulsar los botones de Aura o dar órdenes por voz, tu teléfono reaccionará al instante.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
