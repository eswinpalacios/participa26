import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ThumbsUp, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/destacados")({
  head: () => ({ meta: [{ title: "Proyectos destacados | PARTICIPA+" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const { data: userRes } = useQuery({ queryKey: ["me"], queryFn: async () => (await supabase.auth.getUser()).data.user });
  const userId = userRes?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["destacados"],
    queryFn: async () => {
      const { data: projs, error } = await supabase
        .from("proyectos")
        .select("id, titulo, oed_codigo, oed_justificacion, estado, created_at")
        .eq("destacado", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const ids = projs?.map((p) => p.id) ?? [];
      const { data: votos } = await supabase.from("votos").select("proyecto_id, usuario_id").in("proyecto_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
      const counts: Record<string, number> = {};
      const voted: Record<string, boolean> = {};
      (votos ?? []).forEach((v) => {
        counts[v.proyecto_id] = (counts[v.proyecto_id] ?? 0) + 1;
        if (v.usuario_id === userId) voted[v.proyecto_id] = true;
      });
      return (projs ?? []).map((p) => ({ ...p, votos: counts[p.id] ?? 0, yaVoto: !!voted[p.id] }));
    },
    enabled: !!userId,
  });

  const vote = useMutation({
    mutationFn: async (proyectoId: string) => {
      const { error } = await supabase.from("votos").insert({ proyecto_id: proyectoId, usuario_id: userId! });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("¡Voto registrado!"); qc.invalidateQueries({ queryKey: ["destacados"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/"><Button variant="outline" size="sm" className="gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Atrás</Button></Link>
      <h1 className="text-3xl font-bold text-primary mb-2">Proyectos destacados</h1>
      <p className="text-muted-foreground mb-6">Casos de éxito creados en la plataforma. Vota por los que más te gusten.</p>
      {isLoading ? <p>Cargando…</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.map((p) => (
            <div key={p.id} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-accent text-accent-foreground">{p.oed_codigo ?? "—"}</span>
                <span className="text-xs text-muted-foreground">{new Date(p.created_at).getFullYear()}</span>
              </div>
              <h3 className="font-bold text-primary">{p.titulo}</h3>
              {p.oed_justificacion && <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{p.oed_justificacion}</p>}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-secondary">{p.votos} votos</span>
                <Button size="sm" disabled={p.yaVoto || vote.isPending} onClick={() => vote.mutate(p.id)} className="gap-1">
                  {p.yaVoto ? <><Check className="w-4 h-4" /> Ya votaste</> : <><ThumbsUp className="w-4 h-4" /> Votar</>}
                </Button>
              </div>
            </div>
          ))}
          {data?.length === 0 && <p className="text-muted-foreground">Aún no hay proyectos destacados.</p>}
        </div>
      )}
    </div>
  );
}
