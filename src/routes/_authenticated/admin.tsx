import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Star, StarOff, Trash, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
    if (!r) throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Panel administrativo | PARTICIPA+" }] }),
  component: Admin,
});

function Admin() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/"><Button variant="outline" size="sm" className="gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Atrás</Button></Link>
      <h1 className="text-3xl font-bold text-primary mb-6">Panel administrativo</h1>
      <Tabs defaultValue="proyectos">
        <TabsList>
          <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>
        <TabsContent value="proyectos"><Proyectos /></TabsContent>
        <TabsContent value="usuarios"><Usuarios /></TabsContent>
        <TabsContent value="videos"><Videos /></TabsContent>
      </Tabs>
    </div>
  );
}

function Proyectos() {
  const qc = useQueryClient();
  const [filtro, setFiltro] = useState<string>("todos");
  const { data } = useQuery({
    queryKey: ["admin-proyectos", filtro],
    queryFn: async () => {
      let q = supabase.from("proyectos").select("*").order("created_at", { ascending: false });
      if (filtro !== "todos") q = q.eq("estado", parseInt(filtro));
      const { data } = await q; return data ?? [];
    },
  });
  const { data: votos } = useQuery({
    queryKey: ["admin-votos"],
    queryFn: async () => {
      const { data } = await supabase.from("votos").select("proyecto_id");
      const counts: Record<string, number> = {};
      (data ?? []).forEach((v) => { counts[v.proyecto_id] = (counts[v.proyecto_id] ?? 0) + 1; });
      return counts;
    },
  });
  const toggle = useMutation({
    mutationFn: async ({ id, destacado }: { id: string; destacado: boolean }) => {
      await supabase.from("proyectos").update({ destacado }).eq("id", id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-proyectos"] }); toast.success("Actualizado"); },
  });
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">Filtrar por estado:</span>
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="0">Borrador (0)</SelectItem>
            <SelectItem value="1">Módulo 1 (1)</SelectItem>
            <SelectItem value="2">Módulo 2 (2)</SelectItem>
            <SelectItem value="3">Módulo 3 (3)</SelectItem>
            <SelectItem value="4">Finalizado (4)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-primary text-primary-foreground">
            <tr><th className="p-3 text-left">Título</th><th className="p-3">Estado</th><th className="p-3">OED</th><th className="p-3">Votos</th><th className="p-3">Destacado</th></tr>
          </thead>
          <tbody>
            {data?.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.titulo}</td>
                <td className="p-3 text-center">{p.estado}</td>
                <td className="p-3 text-center">{p.oed_codigo ?? "—"}</td>
                <td className="p-3 text-center font-semibold">{votos?.[p.id] ?? 0}</td>
                <td className="p-3 text-center">
                  <Button size="sm" variant={p.destacado ? "default" : "outline"} onClick={() => toggle.mutate({ id: p.id, destacado: !p.destacado })}>
                    {p.destacado ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Usuarios() {
  const { data } = useQuery({
    queryKey: ["admin-usuarios"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const rmap: Record<string, string[]> = {};
      (roles ?? []).forEach((r) => { rmap[r.user_id] = [...(rmap[r.user_id] ?? []), r.role]; });
      return (profiles ?? []).map((p) => ({ ...p, roles: rmap[p.id] ?? [] }));
    },
  });
  return (
    <div className="mt-4 rounded-xl border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-primary text-primary-foreground">
          <tr><th className="p-3 text-left">Nombre</th><th className="p-3 text-left">Correo</th><th className="p-3 text-left">WhatsApp</th><th className="p-3">Rol</th></tr>
        </thead>
        <tbody>
          {data?.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-3">{u.nombre} {u.apellidos}</td>
              <td className="p-3">{u.correo}</td>
              <td className="p-3">{u.whatsapp}</td>
              <td className="p-3 text-center">{u.roles.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Videos() {
  const qc = useQueryClient();
  const [titulo, setTitulo] = useState("");
  const [url, setUrl] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-videos"],
    queryFn: async () => (await supabase.from("videos_youtube").select("*").order("orden")).data ?? [],
  });
  const add = useMutation({
    mutationFn: async () => {
      const orden = (data?.length ?? 0) + 1;
      const { error } = await supabase.from("videos_youtube").insert({ titulo, url, orden });
      if (error) throw error;
    },
    onSuccess: () => { setTitulo(""); setUrl(""); qc.invalidateQueries({ queryKey: ["admin-videos"] }); toast.success("Video agregado"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("videos_youtube").delete().eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-videos"] }),
  });
  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-xl border bg-card p-4 flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[200px]"><label className="text-sm">Título</label><Input value={titulo} onChange={(e)=>setTitulo(e.target.value)} /></div>
        <div className="flex-1 min-w-[200px]"><label className="text-sm">URL YouTube</label><Input value={url} onChange={(e)=>setUrl(e.target.value)} /></div>
        <Button onClick={() => add.mutate()} disabled={!titulo || !url}><Plus className="w-4 h-4 mr-1" /> Agregar</Button>
      </div>
      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-primary text-primary-foreground">
            <tr><th className="p-3 text-left">Orden</th><th className="p-3 text-left">Título</th><th className="p-3 text-left">URL</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {data?.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="p-3">{v.orden}</td>
                <td className="p-3">{v.titulo}</td>
                <td className="p-3 truncate max-w-xs">{v.url}</td>
                <td className="p-3 text-right"><Button size="sm" variant="destructive" onClick={() => del.mutate(v.id)}><Trash className="w-4 h-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
