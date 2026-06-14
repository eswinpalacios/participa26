import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/proyecto/$id/modulo-2")({
  head: () => ({ meta: [{ title: "Módulo 2 | PARTICIPA+" }] }),
  component: Page,
});

const phases = [
  "Validando con el MEF…",
  "Validando con otras entidades del estado…",
  "Cruzando con otros proyectos en cartera…",
  "Verificación completada.",
];

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setPct((p) => {
        const next = Math.min(100, p + 2);
        if (next >= 75) setPhase(3);
        else if (next >= 50) setPhase(2);
        else if (next >= 25) setPhase(1);
        return next;
      });
    }, 200);
    return () => clearInterval(t);
  }, []);

  const next = async () => {
    await supabase.from("proyectos").update({ estado: 2 }).eq("id", id);
    navigate({ to: "/proyecto/$id/modulo-3", params: { id } });
  };
  const back = async () => {
    await supabase.from("proyectos").update({ estado: 1 }).eq("id", id);
    navigate({ to: "/proyecto/$id/modulo-1", params: { id } });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold text-primary mb-2">Módulo 2 · Validación</h1>
      <p className="text-muted-foreground mb-8">{phases[phase]}</p>
      <Progress value={pct} className="h-3" />
      <p className="mt-2 text-sm text-muted-foreground">{pct}%</p>
      <div className="mt-10 flex gap-2 justify-between">
        <Button variant="outline" onClick={back}>← Atrás</Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate({ to: "/crear-proyecto" })}>Cancelar</Button>
          <Button onClick={next} disabled={pct < 100}>Siguiente →</Button>
        </div>
      </div>
    </div>
  );
}
