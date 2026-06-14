import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, FileEdit } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/crear-proyecto")({
  head: () => ({ meta: [{ title: "Crear proyecto | PARTICIPA+" }] }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const { data: userRes } = useQuery({ queryKey: ["me"], queryFn: async () => (await supabase.auth.getUser()).data.user });
  const userId = userRes?.id;

  const { data: roles } = useQuery({
    queryKey: ["roles", userId],
    queryFn: async () => (await supabase.from("user_roles").select("role").eq("user_id", userId!)).data ?? [],
    enabled: !!userId,
  });
  const isAgente = roles?.some((r) => r.role === "agente") || roles?.some((r) => r.role === "admin");

  const { data: drafts } = useQuery({
    queryKey: ["drafts", userId],
    queryFn: async () => {
      const { data } = await supabase.from("proyectos").select("*").eq("usuario_id", userId!).in("estado", [0,1,2,3]).order("updated_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!userId && isAgente,
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("proyectos").insert({ usuario_id: userId!, titulo: "Nuevo proyecto", estado: 0 }).select().single();
      if (error) throw error; return data;
    },
    onSuccess: (p) => navigate({ to: "/proyecto/$id/modulo-1", params: { id: p.id } }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/"><Button variant="outline" size="sm" className="gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Atrás</Button></Link>
      <h1 className="text-3xl font-bold text-primary mb-6">Crear proyecto</h1>
      {!isAgente ? (
        <div className="rounded-xl border bg-card p-6">
          <p className="text-muted-foreground">Solo agentes participativos pueden crear proyectos.</p>
        </div>
      ) : (
        <>
          {drafts && drafts.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold text-primary mb-2">Tus proyectos en curso</h2>
              <div className="space-y-2">
                {drafts.map((d) => {
                  const next = d.estado <= 1 ? "modulo-1" : d.estado === 2 ? "modulo-2" : "modulo-3";
                  return (
                    <Link key={d.id} to={`/proyecto/$id/${next}` as "/proyecto/$id/modulo-1"} params={{ id: d.id }}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted">
                      <div>
                        <p className="font-medium">{d.titulo}</p>
                        <p className="text-xs text-muted-foreground">Estado {d.estado} · actualizado {new Date(d.updated_at).toLocaleDateString()}</p>
                      </div>
                      <FileEdit className="w-5 h-5 text-secondary" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          <Button onClick={() => create.mutate()} disabled={create.isPending} size="lg" className="gap-2">
            <Sparkles className="w-5 h-5" /> Crear nuevo proyecto
          </Button>
        </>
      )}
    </div>
  );
}
