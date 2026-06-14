import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/historicos")({
  head: () => ({ meta: [{ title: "Proyectos históricos | PARTICIPA+" }] }),
  component: Page,
});

function Page() {
  const { data, isLoading } = useQuery({
    queryKey: ["historicos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("proyectos_historicos").select("*").order("anio", { ascending: false }).order("titulo");
      if (error) throw error; return data ?? [];
    },
  });
  const fmt = (n: number) => `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/"><Button variant="outline" size="sm" className="gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Atrás</Button></Link>
      <h1 className="text-3xl font-bold text-primary mb-2">Listado de proyectos históricos</h1>
      <p className="text-muted-foreground mb-6">Proyectos del Presupuesto Participativo de Miraflores.</p>
      {isLoading ? <p>Cargando…</p> : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-primary text-primary-foreground">
              <tr><th className="text-left p-3">Año</th><th className="text-left p-3">Título</th><th className="text-right p-3">Presupuesto</th></tr>
            </thead>
            <tbody>
              {data?.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/40">
                  <td className="p-3 font-semibold text-secondary">{p.anio}</td>
                  <td className="p-3">{p.titulo}</td>
                  <td className="p-3 text-right font-mono">{fmt(Number(p.monto))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
