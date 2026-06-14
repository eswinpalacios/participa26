import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/" });
  },
  component: AuthPage,
});

const DEMO_PWD = "123456";

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  // Register
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [regPwd, setRegPwd] = useState("");
  const [rol, setRol] = useState<"agente" | "consulta">("consulta");

  const ensureSeed = async () => {
    try { await fetch("/api/public/seed-admin"); } catch { /* noop */ }
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await ensureSeed();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pwd });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("¡Bienvenido!");
    // Check role
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user!.id);
    const isAdmin = roles?.some((r) => r.role === "admin");
    navigate({ to: isAdmin ? "/admin" : "/" });
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: correo,
      password: DEMO_PWD,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nombre, apellidos, whatsapp, rol },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Registro exitoso. Tu contraseña es ${DEMO_PWD}`);
    setEmail(correo); setPwd(DEMO_PWD);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary">PARTICIPA<span className="text-accent">+</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Presupuesto Participativo · Miraflores</p>
        </div>
        <Tabs defaultValue="login">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarme</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={onLogin} className="space-y-4 mt-4">
              <div><Label>Correo</Label><Input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} /></div>
              <div><Label>Contraseña</Label><Input type="password" required value={pwd} onChange={(e)=>setPwd(e.target.value)} /></div>
              <Button type="submit" disabled={loading} className="w-full">Ingresar</Button>
              <p className="text-xs text-muted-foreground text-center">Demo: usuarios usan contraseña <b>123456</b>. Admin: eswinxd@gmail.com / 199306</p>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={onRegister} className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Nombre</Label><Input required value={nombre} onChange={(e)=>setNombre(e.target.value)} /></div>
                <div><Label>Apellidos</Label><Input required value={apellidos} onChange={(e)=>setApellidos(e.target.value)} /></div>
              </div>
              <div><Label>Correo</Label><Input type="email" required value={correo} onChange={(e)=>setCorreo(e.target.value)} /></div>
              <div><Label>WhatsApp</Label><Input value={whatsapp} onChange={(e)=>setWhatsapp(e.target.value)} /></div>
              <div>
                <Label>Tipo de usuario</Label>
                <RadioGroup value={rol} onValueChange={(v)=>setRol(v as "agente"|"consulta")} className="mt-2 space-y-2">
                  <label className="flex items-start gap-2 p-3 border rounded-md cursor-pointer hover:bg-muted">
                    <RadioGroupItem value="agente" />
                    <div className="text-sm"><b>Agente participativo</b><br/><span className="text-muted-foreground">Puede crear proyectos + votar + ver.</span></div>
                  </label>
                  <label className="flex items-start gap-2 p-3 border rounded-md cursor-pointer hover:bg-muted">
                    <RadioGroupItem value="consulta" />
                    <div className="text-sm"><b>Usuario consulta</b><br/><span className="text-muted-foreground">Puede ver proyectos, videos y votar (no crear).</span></div>
                  </label>
                </RadioGroup>
              </div>
              <Button type="submit" disabled={loading} className="w-full">Registrar</Button>
              <p className="text-xs text-muted-foreground text-center">La contraseña asignada será <b>123456</b>.</p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
