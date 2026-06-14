import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ChatInput = z.object({
  modulo: z.union([z.literal(1), z.literal(3)]),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).max(40),
  userText: z.string().min(1).max(4000),
});

const SYS_M1 = `Eres el "Traductor Ciudadano" de PARTICIPA+, plataforma de presupuesto participativo de la Municipalidad de Miraflores (Lima, Perú). Conversas con un vecino para ayudarlo a describir un problema público de su zona.

Haz UNA pregunta a la vez, de forma cálida y clara, siguiendo este orden:
1. ¿Qué problema te preocupa o te gustaría solucionar?
2. ¿Dónde ocurre? (zona vecinal, dirección, entre qué calles)
3. ¿Quiénes son las personas más afectadas? (Niños, Adolescentes, Adultos mayores, Mujeres, Personas con discapacidad, Deportistas, Vecinos de la zona, Comerciantes, Otro — puede marcar varias)
4. ¿Cuántas personas aprox.? (Menos de 50 / 50-200 / 200-500 / Más de 500)
5. ¿Afecta a una zona específica o a todo el distrito?
6. ¿Qué ocurre actualmente? Profundiza con: desde cuándo, en qué horarios, frecuencia, consecuencias.

Cuando hayas cubierto todo, agradece y dile que pulse "Siguiente" para validar el proyecto.
Responde siempre en español, breve (máx. 3 oraciones), sin numerar las opciones a menos que sea útil.`;

const SYS_M3 = `Eres el asistente de "Co-creación" de PARTICIPA+. Ayudas al vecino a proponer acciones concretas para resolver el problema descrito en el Módulo 1. Haz preguntas guiadas una a una (qué solución imagina, qué recursos, qué actores involucrar, en qué plazo). Cuando tengas suficiente información, resume las acciones propuestas y pídele confirmar para clasificar el OED. Responde en español, breve y amable.`;

export const chatTurn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ChatInput.parse(d))
  .handler(async ({ data }) => {
    const { callGemini } = await import("./ai-gateway.server");
    const system = data.modulo === 1 ? SYS_M1 : SYS_M3;
    const msgs = [
      { role: "system" as const, content: system },
      ...data.history,
      { role: "user" as const, content: data.userText },
    ];
    const reply = await callGemini(msgs);
    return { reply };
  });

const ClassifyInput = z.object({
  resumenM1: z.string().min(1).max(5000),
  resumenM3: z.string().min(1).max(5000),
});

export const classifyOed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ClassifyInput.parse(d))
  .handler(async ({ data }) => {
    const { callGemini } = await import("./ai-gateway.server");
    const sys = `Clasifica el siguiente proyecto en UNA categoría OED de Miraflores. Responde ESTRICTAMENTE en JSON {"codigo":"OED.0X","justificacion":"..."} sin texto extra.
OED.01: Incrementar la seguridad ciudadana.
OED.02: Mejorar condiciones de salud.
OED.03: Mejorar calidad ambiental.
OED.04: Mejorar la habitabilidad de la población.
OED.05: Reducir vulnerabilidad por riesgo de desastres.
OED.06: Mejorar el desarrollo económico.
OED.07: Mejorar la gobernanza.`;
    const user = `MÓDULO 1 (problema):\n${data.resumenM1}\n\nMÓDULO 3 (acciones):\n${data.resumenM3}`;
    const reply = await callGemini([
      { role: "system", content: sys },
      { role: "user", content: user },
    ]);
    const match = reply.match(/\{[\s\S]*\}/);
    if (!match) return { codigo: "OED.04", justificacion: "Clasificación por defecto." };
    try {
      const parsed = JSON.parse(match[0]) as { codigo?: string; justificacion?: string };
      const codigo = /^OED\.0[1-7]$/.test(parsed.codigo ?? "") ? parsed.codigo! : "OED.04";
      return { codigo, justificacion: parsed.justificacion ?? "" };
    } catch {
      return { codigo: "OED.04", justificacion: "Clasificación por defecto." };
    }
  });
