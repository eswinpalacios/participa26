-- ============ PROYECTOS VOTACION ============
CREATE TABLE public.proyectos_votacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  votos INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.proyectos_votacion TO authenticated;
GRANT ALL ON public.proyectos_votacion TO service_role;
ALTER TABLE public.proyectos_votacion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Proyectos votacion read" ON public.proyectos_votacion FOR SELECT TO authenticated
  USING (true);

INSERT INTO public.proyectos_votacion (id, titulo, votos) VALUES
  (gen_random_uuid(), 'Mejorar iluminación peatonal en el malecón', 84),
  (gen_random_uuid(), 'Rehabilitar parques infantiles zona Kennedy', 73),
  (gen_random_uuid(), 'Crear ciclovía segura entre Larcomar y Parque Salazar', 91),
  (gen_random_uuid(), 'Mejorar señalización y accesos en el Parque del Amor', 67),
  (gen_random_uuid(), 'Instalar bebederos y sombra en el malecón', 58),
  (gen_random_uuid(), 'Recuperar áreas verdes en la avenida La Paz', 79),
  (gen_random_uuid(), 'Implementar buzones de reciclaje en el distrito', 49),
  (gen_random_uuid(), 'Crear espacios de descanso para adultos mayores', 62),
  (gen_random_uuid(), 'Ampliar veredas en la avenida José Larco', 88),
  (gen_random_uuid(), 'Renovar el mobiliario urbano del Parque Eslava', 76),
  (gen_random_uuid(), 'Optimizar cruces peatonales en Miraflores', 69),
  (gen_random_uuid(), 'Instalar señalética turística sostenible', 55),
  (gen_random_uuid(), 'Crear zonas de reparación para bicicletas', 82),
  (gen_random_uuid(), 'Mejorar seguridad en el transporte público local', 71),
  (gen_random_uuid(), 'Recuperar plazas con arte urbano y sombra', 65),
  (gen_random_uuid(), 'Implementar sistema de alerta de desastres', 93),
  (gen_random_uuid(), 'Rehabilitar malecones y áreas de paseo', 77),
  (gen_random_uuid(), 'Fortalecer mantenimiento de pistas y veredas', 61),
  (gen_random_uuid(), 'Crear puntos de información cultural', 54),
  (gen_random_uuid(), 'Promover educación ambiental en parques', 86);
