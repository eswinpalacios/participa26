import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/proyecto/$id/finalizar")({
  head: () => ({ meta: [{ title: "Finalizar | PARTICIPA+" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [pct, setPct] = useState(0);

  const { data: proyecto } = useQuery({
    queryKey: ["proyecto", id],
    queryFn: async () => (await supabase.from("proyectos").select("*").eq("id", id).single()).data,
  });

  useEffect(() => {
    const t = setInterval(() => setPct((p) => Math.min(100, p + 4)), 250);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (pct === 100) supabase.from("proyectos").update({ estado: 4 }).eq("id", id);
  }, [pct, id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold text-primary mb-2">Finalizando proyecto</h1>
      <p className="text-muted-foreground mb-6">Generando documento PDF para presentación municipal…</p>
      <Progress value={pct} className="h-3" />
      <p className="mt-2 text-sm text-muted-foreground">{pct}%</p>
      {pct === 100 && (
        <div className="mt-10 rounded-2xl border bg-card p-8">
          <CheckCircle2 className="w-16 h-16 text-accent mx-auto" />
          <h2 className="text-xl font-bold text-primary mt-4">¡Proyecto finalizado!</h2>
          {proyecto && (
            <div className="mt-4 text-left text-sm space-y-1">
              <p><b>Título:</b> {proyecto.titulo}</p>
              <p><b>OED:</b> {proyecto.oed_codigo ?? "—"}</p>
              {proyecto.oed_justificacion && <p className="text-muted-foreground">{proyecto.oed_justificacion}</p>}
            </div>
          )}
          <Button className="mt-6 gap-2" onClick={() => alert("PDF simulado generado")}><Download className="w-4 h-4" /> Descargar PDF</Button>
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate({ to: "/" })}>Volver al inicio</Button>
          </div>
        </div>
      )}
      {pct < 100 && (
        <div className="mt-8">
          <Link to="/proyecto/$id/modulo-3" params={{ id }}><Button variant="outline">← Atrás</Button></Link>
        </div>
      )}
    </div>
  );
}
