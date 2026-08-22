import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", aiEnabled: Boolean(ai) });
});

// Phone Webhook for Android MacroDroid / Tasker integration
app.post("/api/phone/webhook", (req, res) => {
  const { action, battery, dnd, ringerMode, volume, trigger } = req.body || {};
  console.log("[Android Webhook Received]:", req.body);
  res.json({
    status: "success",
    message: "Android state synchronized successfully with Aura",
    timestamp: new Date().toISOString(),
    received: { action, battery, dnd, ringerMode, volume, trigger }
  });
});

// Trigger external MacroDroid Webhook
app.post("/api/phone/trigger-macrodroid", async (req, res) => {
  try {
    const { webhookUrl, action = "test", value = "", message = "" } = req.body || {};
    const targetUrl = webhookUrl || "https://trigger.macrodroid.com/7e08d103-de70-4d66-a0a2-e67ed3a624fb/aura_comando";
    
    const urlsToTrigger: string[] = [];

    try {
      const parsed = new URL(targetUrl);
      if (parsed.hostname.includes("macrodroid.com")) {
        const pathSegments = parsed.pathname.split("/").filter(Boolean);
        if (pathSegments.length >= 1) {
          const deviceId = pathSegments[0];
          // Action-specific URL for 4 separate macros (e.g. /<device_id>/flashlight)
          const actionUrl = new URL(`https://trigger.macrodroid.com/${deviceId}/${action}`);
          actionUrl.searchParams.set("action", String(action));
          if (value) actionUrl.searchParams.set("value", String(value));
          if (message) actionUrl.searchParams.set("message", String(message));
          actionUrl.searchParams.set("timestamp", String(Date.now()));
          urlsToTrigger.push(actionUrl.toString());

          // Also trigger the configured path if it differs from the action name
          if (pathSegments[1] && pathSegments[1] !== action) {
            const configUrl = new URL(targetUrl);
            configUrl.searchParams.set("action", String(action));
            if (value) configUrl.searchParams.set("value", String(value));
            if (message) configUrl.searchParams.set("message", String(message));
            configUrl.searchParams.set("timestamp", String(Date.now()));
            urlsToTrigger.push(configUrl.toString());
          }
        }
      }
    } catch {
      // Fallback
    }

    if (urlsToTrigger.length === 0) {
      const urlObj = new URL(targetUrl);
      urlObj.searchParams.set("action", String(action));
      if (value) urlObj.searchParams.set("value", String(value));
      if (message) urlObj.searchParams.set("message", String(message));
      urlObj.searchParams.set("timestamp", String(Date.now()));
      urlsToTrigger.push(urlObj.toString());
    }

    const results = await Promise.allSettled(
      urlsToTrigger.map(async (url) => {
        console.log(`[Triggering MacroDroid]: ${url}`);
        const response = await fetch(url, { method: "GET" });
        const text = await response.text();
        return { url, status: response.status, text };
      })
    );

    res.json({
      status: "success",
      results,
      sentUrls: urlsToTrigger
    });
  } catch (err: any) {
    console.error("[MacroDroid Trigger Error]:", err);
    res.status(500).json({
      status: "error",
      error: err.message || "Failed to trigger MacroDroid"
    });
  }
});

// Chat & Command interpretation endpoint
app.post("/api/assistant/chat", async (req, res) => {
  try {
    const {
      message,
      history = [],
      currentTasks = [],
      currentDevices = [],
      currentPhone = {},
      customCommands = [],
      routines = []
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: "Mensaje requerido" });
      return;
    }

    // If Gemini client is available, use Gemini 3.7 Flash with structured schema
    if (ai) {
      const systemInstruction = `Eres Aura, un asistente virtual con inteligencia artificial de última generación, altamente eficiente, accesible y cálido.
Tu propósito es ayudar al usuario a:
1. Gestionar sus tareas diarias (añadir, completar, desglosar en subtareas inteligentes, estimar tiempos y priorizar).
2. Controlar los dispositivos domóticos del hogar (luces con brillo/color, termostato, persianas, cafetera, robot aspirador, cerraduras, altavoces, cámaras).
3. Gestionar los ajustes de su teléfono móvil conectado (Modo No Molestar, Modo Concentración, ahorro de batería, linterna, volumen, brillo, alarmas y notificaciones).
4. Ejecutar o crear rutinas automatizadas (e.g. "Buenos Días", "Modo Noche", "Salida de Casa", "Modo Concentración") y comandos de voz personalizados.

Estado actual del sistema proporcionado por el cliente:
- Tareas actuales: ${JSON.stringify(currentTasks.map((t: any) => ({ id: t.id, title: t.title, completed: t.completed, priority: t.priority, category: t.category, due: t.dueDate })))}
- Dispositivos conectados: ${JSON.stringify(currentDevices.map((d: any) => ({ id: d.id, name: d.name, room: d.room, type: d.type, status: d.status, brightness: d.brightness, temp: d.targetTemperature, position: d.position })))}
- Estado del Teléfono: ${JSON.stringify(currentPhone)}
- Comandos de voz configurados: ${JSON.stringify(customCommands.map((c: any) => ({ phrase: c.phrase, description: c.description })))}
- Rutinas existentes: ${JSON.stringify(routines.map((r: any) => ({ id: r.id, name: r.name, voiceTrigger: r.voiceTrigger })))}

Instrucciones de respuesta:
- Habla en español impecable, conciso, educado, empático y orientado a la acción.
- Determina si la petición del usuario requiere realizar acciones sobre tareas, dispositivos, teléfono o rutinas.
- Si el usuario pide crear una tarea compleja (ej: "preparar presentación"), desglósala inteligentemente en 2-4 subtareas lógicas.
- Si el usuario pide encender/apagar o ajustar algo en el hogar o en su teléfono, incluye la acción correspondiente precisa.
- Siempre devuelve una respuesta estructurada en JSON conforme al esquema definido.`;

      const promptContext = `Historial reciente: ${JSON.stringify(history.slice(-4))}
Petición del usuario: "${message}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: promptContext,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              spokenResponse: {
                type: Type.STRING,
                description: "Respuesta conversacional natural y concisa para ser leída o reproducida por voz al usuario.",
              },
              thought: {
                type: Type.STRING,
                description: "Breve justificación de las decisiones tomadas.",
              },
              actions: {
                type: Type.ARRAY,
                description: "Lista de acciones automáticas a ejecutar en la aplicación.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: {
                      type: Type.STRING,
                      description: "Tipo de acción: 'ADD_TASK', 'COMPLETE_TASK', 'DELETE_TASK', 'UPDATE_DEVICE', 'UPDATE_PHONE', 'TRIGGER_ROUTINE', 'CREATE_VOICE_COMMAND'",
                    },
                    targetDescription: {
                      type: Type.STRING,
                      description: "Descripción breve de la acción para el registro visual del usuario (ej: 'Luces del salón atenuadas al 30%').",
                    },
                    payload: {
                      type: Type.OBJECT,
                      description: "Datos específicos de la acción (por ejemplo título de tarea, id o nombre de dispositivo, valores actualizados, etc.).",
                    },
                  },
                  required: ["type", "targetDescription", "payload"],
                },
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2 a 3 sugerencias de comandos rápidos o preguntas de seguimiento contextuales.",
              },
            },
            required: ["spokenResponse", "actions", "suggestions"],
          },
        },
      });

      const rawJson = response.text?.trim() || "{}";
      const parsedData = JSON.parse(rawJson);
      res.json(parsedData);
      return;
    }

    // Offline / Local Rule Engine fallback if no API key is configured
    const lower = message.toLowerCase();
    const actions: any[] = [];
    let spokenResponse = "";
    const suggestions: string[] = ["Ver mis tareas pendientes", "Activar Modo Noche", "Estado de los dispositivos"];

    if (lower.includes("café") || lower.includes("cafe")) {
      actions.push({
        type: "UPDATE_DEVICE",
        targetDescription: "Cafetera iniciada en modo Espresso",
        payload: { deviceId: "dev-coffee-maker", status: true, coffeeBrewing: true, coffeeMode: "espresso" }
      });
      spokenResponse = "He puesto en marcha la cafetera para preparar tu café favorito. Estará listo en 2 minutos.";
    } else if (lower.includes("noche") || lower.includes("dormir") || lower.includes("buenas noches")) {
      actions.push({
        type: "TRIGGER_ROUTINE",
        targetDescription: "Rutina 'Modo Noche' activada",
        payload: { routineId: "routine-night" }
      });
      spokenResponse = "Activando el Modo Noche: luces apagadas, persianas bajadas, cerraduras aseguradas y teléfono en No Molestar. ¡Que descanses!";
    } else if (lower.includes("buenos días") || lower.includes("buenos dias") || lower.includes("despertar")) {
      actions.push({
        type: "TRIGGER_ROUTINE",
        targetDescription: "Rutina 'Buenos Días' iniciada",
        payload: { routineId: "routine-morning" }
      });
      spokenResponse = "¡Buenos días! He subido las persianas, encendido la cafetera y desactivado el modo No Molestar de tu teléfono. Tienes tareas clave programadas para hoy.";
    } else if (lower.includes("luz") || lower.includes("luces")) {
      const turnOff = lower.includes("apaga") || lower.includes("apagar");
      actions.push({
        type: "UPDATE_DEVICE",
        targetDescription: turnOff ? "Luces del hogar apagadas" : "Luces del salón encendidas",
        payload: { deviceType: "light", status: !turnOff, brightness: turnOff ? 0 : 80 }
      });
      spokenResponse = turnOff ? "He apagado las luces." : "He encendido las luces principales con un brillo agradable.";
    } else if (lower.includes("tarea") || lower.includes("recordar") || lower.includes("añadir") || lower.includes("recuérdame")) {
      const taskTitle = message.replace(/^(añadir tarea|recuérdame|crear tarea|recuerdame)/i, "").trim() || "Nueva tarea pendiente";
      actions.push({
        type: "ADD_TASK",
        targetDescription: `Tarea creada: "${taskTitle}"`,
        payload: {
          title: taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1),
          priority: lower.includes("urgente") ? "alta" : "media",
          category: lower.includes("compra") ? "compras" : lower.includes("trabajo") ? "trabajo" : "personal",
          estimatedMinutes: 30,
          steps: [
            { id: "s1", text: "Revisar detalles", done: false },
            { id: "s2", text: "Completar tarea", done: false }
          ]
        }
      });
      spokenResponse = `He añadido "${taskTitle}" a tu lista de tareas diarias con recordatorio inteligente.`;
    } else if (lower.includes("silencio") || lower.includes("no molestar") || lower.includes("teléfono") || lower.includes("movil") || lower.includes("móvil")) {
      actions.push({
        type: "UPDATE_PHONE",
        targetDescription: "Modo No Molestar y silencio activados en el teléfono",
        payload: { dnd: true, volumeLevel: 0, ringerMode: "silent" }
      });
      spokenResponse = "He activado el modo No Molestar y silenciado el volumen de tu teléfono.";
    } else if (lower.includes("aspirador") || lower.includes("limpiar") || lower.includes("aspirar")) {
      actions.push({
        type: "UPDATE_DEVICE",
        targetDescription: "Robot aspirador en ciclo de limpieza",
        payload: { deviceId: "dev-vacuum-robot", status: true, vacuumState: "cleaning" }
      });
      spokenResponse = "Robot aspirador puesto en marcha para una limpieza completa de las estancias.";
    } else {
      spokenResponse = `Entendido. He procesado tu solicitud "${message}". Todo el sistema y tus dispositivos están sincronizados.`;
    }

    res.json({
      spokenResponse,
      thought: "Procesado mediante motor de reglas locales asistido.",
      actions,
      suggestions,
    });
  } catch (error: any) {
    console.error("Error en /api/assistant/chat:", error);
    res.status(500).json({
      error: "Error interno al procesar el mensaje",
      details: error?.message || String(error),
      spokenResponse: "Disculpa, ha ocurrido una dificultad al procesar tu solicitud, pero mantengo el control local activo."
    });
  }
});

// Start server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aura AI Assistant Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
