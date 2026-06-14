import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Layout,
});

function Layout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const router = useRouter();

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      return !!data;
    },
  });

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link to="/" className="font-bold text-lg text-primary">
            PARTICIPA<span className="text-accent">+</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="gap-1"><Shield className="w-4 h-4" /> Admin</Button>
              </Link>
            )}
            <span className="hidden sm:inline text-muted-foreground">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-1"><LogOut className="w-4 h-4" /> Salir</Button>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
