export interface LocalAssistantResult {
  spokenResponse: string;
  actions: Array<{
    type: string;
    targetDescription: string;
    payload: Record<string, any>;
  }>;
  suggestions: string[];
}

export function processLocalAssistant(message: string): LocalAssistantResult {
  const lower = message.toLowerCase().trim();
  const actions: LocalAssistantResult['actions'] = [];
  let spokenResponse = '';
  const suggestions: string[] = ['Ver mis tareas pendientes', 'Activar Modo Noche', 'Estado de los dispositivos'];

  if (lower.includes('café') || lower.includes('cafe')) {
    actions.push({
      type: 'UPDATE_DEVICE',
      targetDescription: 'Cafetera iniciada en modo Espresso',
      payload: { deviceId: 'dev-coffee-maker', status: true, coffeeBrewing: true, coffeeMode: 'espresso' },
    });
    spokenResponse = 'He puesto en marcha la cafetera para preparar tu café favorito. Estará listo en 2 minutos.';
  } else if (lower.includes('noche') || lower.includes('dormir') || lower.includes('buenas noches')) {
    actions.push({
      type: 'TRIGGER_ROUTINE',
      targetDescription: "Rutina 'Modo Noche' activada",
      payload: { routineId: 'routine-night' },
    });
    spokenResponse = 'Activando el Modo Noche: luces apagadas, persianas bajadas, cerraduras aseguradas y teléfono en No Molestar. ¡Que descanses!';
  } else if (lower.includes('buenos días') || lower.includes('buenos dias') || lower.includes('despertar')) {
    actions.push({
      type: 'TRIGGER_ROUTINE',
      targetDescription: "Rutina 'Buenos Días' iniciada",
      payload: { routineId: 'routine-morning' },
    });
    spokenResponse = '¡Buenos días! He subido las persianas, encendido la cafetera y desactivado el modo No Molestar de tu teléfono. Tienes tareas clave programadas para hoy.';
  } else if (lower.includes('luz') || lower.includes('luces')) {
    const turnOff = lower.includes('apaga') || lower.includes('apagar');
    actions.push({
      type: 'UPDATE_DEVICE',
      targetDescription: turnOff ? 'Luces del hogar apagadas' : 'Luces del salón encendidas',
      payload: { deviceType: 'light', status: !turnOff, brightness: turnOff ? 0 : 80 },
    });
    spokenResponse = turnOff ? 'He apagado las luces de tu hogar.' : 'He encendido las luces principales con una intensidad agradable.';
  } else if (lower.includes('tarea') || lower.includes('recordar') || lower.includes('añadir') || lower.includes('recuérdame') || lower.includes('recuerdame')) {
    const cleanTitle = message.replace(/^(añadir tarea|recuérdame|crear tarea|recuerdame|recuerda)/i, '').trim() || 'Nueva tarea pendiente';
    const taskTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    actions.push({
      type: 'ADD_TASK',
      targetDescription: `Tarea creada: "${taskTitle}"`,
      payload: {
        title: taskTitle,
        priority: lower.includes('urgente') || lower.includes('importante') ? 'alta' : 'media',
        category: lower.includes('compra') ? 'compras' : lower.includes('trabajo') ? 'trabajo' : 'personal',
        estimatedMinutes: 30,
        steps: [
          { id: `s1-${Date.now()}`, text: 'Revisar detalles', done: false },
          { id: `s2-${Date.now()}`, text: 'Completar tarea', done: false },
        ],
      },
    });
    spokenResponse = `He añadido "${taskTitle}" a tu lista de tareas con seguimiento automático.`;
  } else if (lower.includes('silencio') || lower.includes('no molestar') || lower.includes('teléfono') || lower.includes('movil') || lower.includes('móvil')) {
    actions.push({
      type: 'UPDATE_PHONE',
      targetDescription: 'Modo No Molestar y silencio activados en el teléfono',
      payload: { dnd: true, volumeLevel: 0, ringerMode: 'silent' },
    });
    spokenResponse = 'He activado el modo No Molestar y silenciado el volumen de tu teléfono.';
  } else if (lower.includes('aspirador') || lower.includes('limpiar') || lower.includes('aspirar')) {
    actions.push({
      type: 'UPDATE_DEVICE',
      targetDescription: 'Robot aspirador en ciclo de limpieza',
      payload: { deviceId: 'dev-vacuum-robot', status: true, vacuumState: 'cleaning' },
    });
    spokenResponse = 'Robot aspirador puesto en marcha para una limpieza completa de las estancias.';
  } else if (lower.includes('música') || lower.includes('musica') || lower.includes('canción') || lower.includes('cancion')) {
    actions.push({
      type: 'UPDATE_DEVICE',
      targetDescription: 'Reproduciendo música de concentración',
      payload: { deviceId: 'dev-speaker-living', status: true, speakerPlaying: true, speakerVolume: 45 },
    });
    spokenResponse = 'Reproduciendo tu lista de música ambiental para concentración.';
  } else {
    spokenResponse = `Entendido. He procesado "${message}". El sistema y todos tus dispositivos están sincronizados.`;
  }

  return {
    spokenResponse,
    actions,
    suggestions,
  };
}
