import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProjectChat, type ChatMessage } from "@/components/ProjectChat";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/proyecto/$id/modulo-1")({
  head: () => ({ meta: [{ title: "Módulo 1 | PARTICIPA+" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);

  const { data: existing } = useQuery({
    queryKey: ["m1", id],
    queryFn: async () => {
      const { data } = await supabase.from("proyecto_respuestas").select("*").eq("proyecto_id", id).eq("modulo", 1).maybeSingle();
      return (data?.respuesta as { messages?: ChatMessage[] } | null)?.messages ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const transcript = msgs.length ? msgs : existing ?? [];
      // upsert respuesta
      const { data: existingRow } = await supabase.from("proyecto_respuestas").select("id").eq("proyecto_id", id).eq("modulo", 1).maybeSingle();
      const payload = { proyecto_id: id, modulo: 1, pregunta: "chat", respuesta: { messages: transcript } };
      if (existingRow) {
        await supabase.from("proyecto_respuestas").update(payload).eq("id", existingRow.id);
      } else {
        await supabase.from("proyecto_respuestas").insert(payload);
      }
      await supabase.from("proyectos").update({ estado: 1, titulo: transcript[1]?.content?.slice(0, 80) || "Nuevo proyecto" }).eq("id", id);
    },
    onSuccess: () => navigate({ to: "/proyecto/$id/modulo-2", params: { id } }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary">Módulo 1 · Traductor Ciudadano</h1>
        <span className="text-xs px-2 py-1 rounded bg-muted">Paso 1 de 4</span>
      </div>
      <p className="text-muted-foreground mb-4 text-sm">Cuéntanos el problema que te preocupa. El asistente te guiará con preguntas.</p>
      {existing !== undefined && (
        <ProjectChat modulo={1} initial={existing} onChange={setMsgs} />
      )}
      <div className="mt-6 flex gap-2 justify-between">
        <Link to="/crear-proyecto"><Button variant="outline">Cancelar</Button></Link>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>Siguiente →</Button>
      </div>
    </div>
  );
}
