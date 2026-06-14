import { createFileRoute, Link } from "@tanstack/react-router";
import { Youtube, ListChecks, Sparkles, Trophy, UserPlus } from "lucide-react";
import heroImg from "@/assets/landing-hero.jpg";
import communityImg from "@/assets/landing-community.jpg";
import parkImg from "@/assets/landing-park.jpg";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Inicio | PARTICIPA+ Miraflores" },
      { name: "description", content: "Participa en el presupuesto participativo de Miraflores. Conoce, propone y vota proyectos." },
    ],
  }),
  component: Landing,
});

const buttons = [
  { to: "/videos", label: "Conoce más", desc: "Videos sobre el proyecto participativo", icon: Youtube, color: "from-[#1E88E5] to-[#0B3D5C]" },
  { to: "/historicos", label: "Listado de proyectos", desc: "Proyectos históricos del PP", icon: ListChecks, color: "from-[#0B3D5C] to-[#1E88E5]" },
  { to: "/crear-proyecto", label: "Crear proyecto", desc: "Propón una nueva idea", icon: Sparkles, color: "from-[#A3D33A] to-[#1E88E5]" },
  { to: "/destacados", label: "Proyectos destacados", desc: "Casos de éxito y vota", icon: Trophy, color: "from-[#1E88E5] to-[#A3D33A]" },
  { to: "/auth", label: "Registro", desc: "Crear nueva cuenta", icon: UserPlus, color: "from-[#0B3D5C] to-[#A3D33A]" },
] as const;

function Landing() {
  return (
    <div className="relative">
      {/* Hero background */}
      <div className="absolute inset-0 -z-10">
        <img src={heroImg} alt="Miraflores" className="w-full h-[700px] object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/70 to-background" />
      </div>

      <section className="max-w-6xl mx-auto px-4 pt-12 pb-16 text-center text-white">
        <p className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-4">
          Municipalidad de Miraflores
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          PARTICIPA<span className="text-accent">+</span>
        </h1>
        <p className="mt-3 text-lg opacity-90 max-w-2xl mx-auto">
          Plataforma del Presupuesto Participativo. Conoce, propón y vota los proyectos que transformarán nuestro distrito.
        </p>
      </section>

      {/* Central buttons grid */}
      <section className="max-w-5xl mx-auto px-4 -mt-4 relative z-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {buttons.map((b) => {
            const Icon = b.icon;
            return (
              <Link
                key={b.to}
                to={b.to}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${b.color} p-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 text-white min-h-[160px] flex flex-col justify-between`}
              >
                <Icon className="w-9 h-9 opacity-90" />
                <div>
                  <h3 className="text-xl font-bold">{b.label}</h3>
                  <p className="text-sm opacity-90 mt-1">{b.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Imagery section */}
      <section className="max-w-6xl mx-auto px-4 mt-16 grid md:grid-cols-2 gap-6 pb-20">
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <img src={communityImg} alt="Comunidad Miraflores" loading="lazy" width={1024} height={1024} className="w-full h-64 object-cover" />
          <div className="p-6 bg-card">
            <h3 className="font-bold text-primary text-lg">Tu voz construye Miraflores</h3>
            <p className="text-sm text-muted-foreground mt-1">Los vecinos deciden en qué se invierte parte del presupuesto público.</p>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <img src={parkImg} alt="Parque Miraflores" loading="lazy" width={1024} height={1024} className="w-full h-64 object-cover" />
          <div className="p-6 bg-card">
            <h3 className="font-bold text-primary text-lg">Proyectos que ya viste hechos realidad</h3>
            <p className="text-sm text-muted-foreground mt-1">Parques, seguridad, movilidad, cultura: 96+ proyectos históricos ejecutados.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
