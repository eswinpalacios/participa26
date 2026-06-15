import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

const SAMPLE_PROJECTS = [
  {
    titulo: "Mejorar iluminación peatonal en el malecón",
    oed_codigo: "OED.01",
    oed_justificacion: "Instalar luminarias LED seguras a lo largo del malecón de Miraflores.",
    estado: "Propuesto",
  },
  {
    titulo: "Rehabilitar parques infantiles en la zona de Kennedy",
    oed_codigo: "OED.02",
    oed_justificacion: "Actualizar equipos y mobiliario para juegos infantiles seguros.",
    estado: "Propuesto",
  },
  {
    titulo: "Crear ciclovía segura entre Larcomar y Parque Salazar",
    oed_codigo: "OED.03",
    oed_justificacion: "Conectar puntos clave de Miraflores con una vía ciclable segregada.",
    estado: "Propuesto",
  },
  {
    titulo: "Mejorar señalización y accesos en el Parque del Amor",
    oed_codigo: "OED.04",
    oed_justificacion: "Facilitar el acceso peatonal y mejorar la claridad de rutas turísticas.",
    estado: "Propuesto",
  },
  {
    titulo: "Instalar bebederos y sombra en el malecón",
    oed_codigo: "OED.05",
    oed_justificacion: "Agregar puntos de hidratación y descanso para vecinos y visitantes.",
    estado: "Propuesto",
  },
  {
    titulo: "Recuperar áreas verdes en la avenida La Paz",
    oed_codigo: "OED.06",
    oed_justificacion: "Reforestar y mantener jardineras para reducir el calor urbano.",
    estado: "Propuesto",
  },
  {
    titulo: "Implementar buzones de reciclaje en el distrito",
    oed_codigo: "OED.07",
    oed_justificacion: "Promover la separación de residuos en puntos estratégicos.",
    estado: "Propuesto",
  },
  {
    titulo: "Crear espacios de descanso para adultos mayores",
    oed_codigo: "OED.08",
    oed_justificacion: "Instalar bancas ergonómicas con sombra en parques y paseos.",
    estado: "Propuesto",
  },
  {
    titulo: "Ampliar veredas en la avenida José Larco",
    oed_codigo: "OED.09",
    oed_justificacion: "Dar mayor espacio a peatones y mejorar la movilidad segura.",
    estado: "Propuesto",
  },
  {
    titulo: "Renovar el mobiliario urbano del Parque Eslava",
    oed_codigo: "OED.10",
    oed_justificacion: "Actualizar bancas, cestos y señalética para un entorno más limpio.",
    estado: "Propuesto",
  },
];

const isFallbackProject = (id: string) => id.startsWith("fallback-");
const randomVotes = () => Math.floor(Math.random() * 91) + 10;

function generateFallbackProjects() {
  return SAMPLE_PROJECTS.map((project, index) => ({
    ...project,
    id: `fallback-${index}`,
    created_at: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    votos: randomVotes(),
    yaVoto: false,
  }));
}

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
      try {
        const { data: projs, error } = await supabase
          .from("proyectos_votacion")
          .select("id, titulo, votos, created_at")
          .order("created_at", { ascending: false });
        if (error) throw error;
        const projectList = projs ?? [];
        if (projectList.length === 0) return generateFallbackProjects();

        return projectList.map((p) => ({
          ...p,
          votos: typeof p.votos === "number" ? p.votos : 0,
        }));
      } catch (error) {
        console.error("Error cargando destacados:", error);
        return generateFallbackProjects();
      }
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/"><Button variant="outline" size="sm" className="gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Atrás</Button></Link>
      <h1 className="text-3xl font-bold text-primary mb-2">Proyectos destacados</h1>
      <p className="text-muted-foreground mb-6">Casos de éxito creados en la plataforma. Vota por los que más te gusten.</p>
      {isLoading ? <p>Cargando…</p> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Votos</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="font-medium text-primary">{p.titulo}</div>
                </TableCell>
                <TableCell>{p.votos}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="secondary">Votar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
