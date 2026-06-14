import { createFileRoute } from "@tanstack/react-router";

// One-shot seed: ensures the admin user (eswinxd@gmail.com / 199306) exists with admin role.
export const Route = createFileRoute("/api/public/seed-admin")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const email = "eswinxd@gmail.com";
        const password = "199306";

        // Find existing
        const { data: list } = await supabaseAdmin.auth.admin.listUsers();
        let user = list.users.find((u) => u.email === email);
        if (!user) {
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { nombre: "Administrador", apellidos: "PARTICIPA+", rol: "admin" },
          });
          if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
          user = data.user!;
        }

        // Ensure profile
        await supabaseAdmin.from("profiles").upsert({
          id: user.id,
          correo: email,
          nombre: "Administrador",
          apellidos: "PARTICIPA+",
          whatsapp: "",
        });

        // Ensure admin role
        await supabaseAdmin.from("user_roles").upsert(
          { user_id: user.id, role: "admin" },
          { onConflict: "user_id,role" },
        );

        return Response.json({ ok: true, userId: user.id });
      },
    },
  },
});
