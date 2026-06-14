import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProjectChat, type ChatMessage } from "@/components/ProjectChat";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { classifyOed } from "@/lib/chatbot.functions";

export const Route = createFileRoute("/_authenticated/proyecto/$id/modulo-3")({
  head: () => ({ meta: [{ title: "Módulo 3 | PARTICIPA+" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const classify = useServerFn(classifyOed);

  const { data: existing } = useQuery({
    queryKey: ["m3", id],
    queryFn: async () => {
      const { data } = await supabase.from("proyecto_respuestas").select("*").eq("proyecto_id", id).eq("modulo", 3).maybeSingle();
      return (data?.respuesta as { messages?: ChatMessage[] } | null)?.messages ?? [];
    },
  });

  const { data: m1 } = useQuery({
    queryKey: ["m1-summary", id],
    queryFn: async () => {
      const { data } = await supabase.from("proyecto_respuestas").select("respuesta").eq("proyecto_id", id).eq("modulo", 1).maybeSingle();
      const m = (data?.respuesta as { messages?: ChatMessage[] } | null)?.messages ?? [];
      return m.map((x) => `${x.role}: ${x.content}`).join("\n");
    },
  });

  const finish = useMutation({
    mutationFn: async () => {
      const transcript = msgs.length ? msgs : existing ?? [];
      const resumenM3 = transcript.map((x) => `${x.role}: ${x.content}`).join("\n");
      const oed = await classify({ data: { resumenM1: m1 ?? "", resumenM3 } });
      const { data: existingRow } = await supabase.from("proyecto_respuestas").select("id").eq("proyecto_id", id).eq("modulo", 3).maybeSingle();
      const payload = { proyecto_id: id, modulo: 3, pregunta: "chat", respuesta: { messages: transcript } };
      if (existingRow) await supabase.from("proyecto_respuestas").update(payload).eq("id", existingRow.id);
      else await supabase.from("proyecto_respuestas").insert(payload);
      await supabase.from("proyectos").update({ estado: 3, oed_codigo: oed.codigo, oed_justificacion: oed.justificacion }).eq("id", id);
    },
    onSuccess: () => navigate({ to: "/proyecto/$id/finalizar", params: { id } }),
    onError: (e: Error) => toast.error(e.message),
  });

  const back = async () => {
    await supabase.from("proyectos").update({ estado: 2 }).eq("id", id);
    navigate({ to: "/proyecto/$id/modulo-2", params: { id } });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary mb-4">Módulo 3 · Co-creación de soluciones</h1>
      <p className="text-muted-foreground text-sm mb-4">Propone acciones para resolver el problema. Al finalizar, clasificaremos automáticamente el OED.</p>
      {existing !== undefined && <ProjectChat modulo={3} initial={existing} onChange={setMsgs} />}
      <div className="mt-6 flex justify-between gap-2">
        <Button variant="outline" onClick={back}>← Atrás</Button>
        <Button onClick={() => finish.mutate()} disabled={finish.isPending}>Finalizar →</Button>
      </div>
    </div>
  );
}
