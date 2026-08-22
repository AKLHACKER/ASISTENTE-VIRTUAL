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
  const [showMacroGuide, setShowMacroGuide] = useState(false);

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
                onChange={(e) => onUpdatePhone({ model: e.target.value })}
                className="text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-[#3A4456] focus:border-indigo-500 focus:outline-none transition-colors"
                title="Haz clic para renombrar tu modelo de teléfono"
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
              onChange={(e) => onUpdatePhone({ volumeLevel: Number(e.target.value) })}
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
              onClick={() => onUpdatePhone({ dnd: !phone.dnd })}
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
              onChange={(e) => onUpdatePhone({ brightness: Number(e.target.value) })}
              className="w-full h-1.5 bg-[#181B24] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Flashlight */}
            <button
              onClick={() => onUpdatePhone({ flashlight: !phone.flashlight })}
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
              onClick={() => onUpdatePhone({ eyeComfort: !phone.eyeComfort })}
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

      {/* 4. Guía de Automatización Real con MacroDroid / Tasker */}
      <div className="bg-[#111318] rounded-2xl p-5 border border-indigo-500/20 shadow-md">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowMacroGuide(!showMacroGuide)}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-300">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Conexión en Vivo con tu Android (MacroDroid / Tasker / Webhooks)
              </h3>
              <p className="text-xs text-[#8490A0]">
                Aprende a conectar Aura para que cambie el volumen y modos de tu teléfono físicamente
              </p>
            </div>
          </div>
          <button className="text-xs text-indigo-400 font-semibold hover:underline">
            {showMacroGuide ? 'Ocultar guía' : 'Ver cómo conectar'}
          </button>
        </div>

        {showMacroGuide && (
          <div className="mt-4 pt-4 border-t border-[#1F242F] text-xs text-[#C5CED9] space-y-3">
            <p>
              Puedes enlazar los comandos de Aura directamente con la aplicación gratuita <strong className="text-white">MacroDroid</strong> o <strong className="text-white">Tasker</strong> de Google Play:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-[#AAB5C4]">
              <li>Instala <strong className="text-white">MacroDroid</strong> en tu teléfono Android desde Google Play Store.</li>
              <li>Crea una macro nueva con Disparador (Trigger): <strong className="text-white">Solicitud Webhook / HTTP</strong>.</li>
              <li>Agrega Acciones en MacroDroid según el comando (ej: cambiar volumen, silenciar, encender linterna).</li>
              <li>Aura enviará la petición automáticamente a tu dispositivo cuando des la orden por voz o botones.</li>
            </ol>
            <div className="p-3 bg-[#161922] rounded-xl border border-[#222834] flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[#8490A0]">Endpoint local de sincronización:</div>
                <div className="text-xs font-mono text-indigo-300 mt-0.5">{window.location.origin}/api/phone/webhook</div>
              </div>
              <button
                onClick={handleCopyWebhookUrl}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhook ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
