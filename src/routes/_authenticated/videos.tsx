import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/videos")({
  head: () => ({ meta: [{ title: "Videos | PARTICIPA+" }, { name: "description", content: "Videos sobre el presupuesto participativo de Miraflores." }] }),
  component: Page,
});

function ytEmbed(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

function Page() {
  const { data, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("videos_youtube").select("*").order("orden");
      if (error) throw error; return data ?? [];
    },
  });
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/"><Button variant="outline" size="sm" className="gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Atrás</Button></Link>
      <h1 className="text-3xl font-bold text-primary mb-6">Conoce más sobre el proyecto participativo</h1>
      {isLoading && <p>Cargando…</p>}
      <div className="grid md:grid-cols-2 gap-6">
        {data?.map((v) => (
          <div key={v.id} className="rounded-xl overflow-hidden border bg-card shadow-sm">
            <div className="aspect-video bg-black">
              <iframe src={ytEmbed(v.url)} title={v.titulo} className="w-full h-full" allowFullScreen />
            </div>
            <div className="p-4"><h3 className="font-semibold text-primary">{v.titulo}</h3></div>
          </div>
        ))}
        {data?.length === 0 && <p className="text-muted-foreground">Aún no hay videos publicados.</p>}
      </div>
    </div>
  );
}
