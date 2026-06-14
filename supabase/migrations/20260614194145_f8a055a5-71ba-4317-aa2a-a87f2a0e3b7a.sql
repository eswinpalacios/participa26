
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'agente', 'consulta');
CREATE TYPE public.archivo_tipo AS ENUM ('problema', 'referencia');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT '',
  apellidos TEXT NOT NULL DEFAULT '',
  correo TEXT NOT NULL,
  whatsapp TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- ============ PROFILES policies (need has_role) ============
CREATE POLICY "Profiles self select" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Profiles self insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles self update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- ============ USER_ROLES policies ============
CREATE POLICY "Roles self read" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ============ CATEGORIAS OED ============
CREATE TABLE public.categorias_oed (
  codigo TEXT PRIMARY KEY,
  descripcion TEXT NOT NULL
);
GRANT SELECT ON public.categorias_oed TO authenticated, anon;
GRANT ALL ON public.categorias_oed TO service_role;
ALTER TABLE public.categorias_oed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "OED public read" ON public.categorias_oed FOR SELECT TO authenticated, anon USING (true);

INSERT INTO public.categorias_oed (codigo, descripcion) VALUES
  ('OED.01','Incrementar la seguridad ciudadana en el distrito.'),
  ('OED.02','Mejorar las condiciones de salud en el distrito.'),
  ('OED.03','Mejorar la calidad ambiental del distrito.'),
  ('OED.04','Mejorar la habitabilidad de la población.'),
  ('OED.05','Reducir las condiciones de vulnerabilidad por riesgo de desastres en el distrito.'),
  ('OED.06','Mejorar el desarrollo económico en el distrito.'),
  ('OED.07','Mejorar la gobernanza en el distrito.');

-- ============ PROYECTOS HISTORICOS ============
CREATE TABLE public.proyectos_historicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  anio INTEGER NOT NULL,
  monto NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.proyectos_historicos TO authenticated;
GRANT ALL ON public.proyectos_historicos TO service_role;
ALTER TABLE public.proyectos_historicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Históricos read" ON public.proyectos_historicos FOR SELECT TO authenticated USING (true);

-- ============ VIDEOS YOUTUBE ============
CREATE TABLE public.videos_youtube (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  url TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.videos_youtube TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.videos_youtube TO authenticated;
GRANT ALL ON public.videos_youtube TO service_role;
ALTER TABLE public.videos_youtube ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Videos read" ON public.videos_youtube FOR SELECT TO authenticated USING (true);
CREATE POLICY "Videos admin write" ON public.videos_youtube FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ PROYECTOS ============
CREATE TABLE public.proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL DEFAULT 'Nuevo proyecto',
  estado INTEGER NOT NULL DEFAULT 0 CHECK (estado BETWEEN 0 AND 4),
  oed_codigo TEXT REFERENCES public.categorias_oed(codigo),
  oed_justificacion TEXT,
  destacado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proyectos TO authenticated;
GRANT ALL ON public.proyectos TO service_role;
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;

-- Lectura: dueño, admin, o destacados (cualquier autenticado)
CREATE POLICY "Proyectos read" ON public.proyectos FOR SELECT TO authenticated
  USING (
    auth.uid() = usuario_id
    OR destacado = true
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Proyectos insert" ON public.proyectos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = usuario_id AND public.has_role(auth.uid(), 'agente'));
CREATE POLICY "Proyectos update own" ON public.proyectos FOR UPDATE TO authenticated
  USING (auth.uid() = usuario_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = usuario_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Proyectos delete admin" ON public.proyectos FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ PROYECTO RESPUESTAS ============
CREATE TABLE public.proyecto_respuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  modulo INTEGER NOT NULL CHECK (modulo BETWEEN 1 AND 3),
  pregunta TEXT NOT NULL,
  respuesta JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_respuestas_proyecto ON public.proyecto_respuestas(proyecto_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proyecto_respuestas TO authenticated;
GRANT ALL ON public.proyecto_respuestas TO service_role;
ALTER TABLE public.proyecto_respuestas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Respuestas access" ON public.proyecto_respuestas FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.proyectos p WHERE p.id = proyecto_id
      AND (p.usuario_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.proyectos p WHERE p.id = proyecto_id
      AND p.usuario_id = auth.uid())
  );

-- ============ PROYECTO ARCHIVOS ============
CREATE TABLE public.proyecto_archivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  tipo public.archivo_tipo NOT NULL,
  url TEXT NOT NULL,
  mime TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proyecto_archivos TO authenticated;
GRANT ALL ON public.proyecto_archivos TO service_role;
ALTER TABLE public.proyecto_archivos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Archivos access" ON public.proyecto_archivos FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.proyectos p WHERE p.id = proyecto_id
      AND (p.usuario_id = auth.uid() OR p.destacado = true OR public.has_role(auth.uid(), 'admin')))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.proyectos p WHERE p.id = proyecto_id
      AND p.usuario_id = auth.uid())
  );

-- ============ VOTOS ============
CREATE TABLE public.votos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, proyecto_id)
);
GRANT SELECT, INSERT, DELETE ON public.votos TO authenticated;
GRANT ALL ON public.votos TO service_role;
ALTER TABLE public.votos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votos read" ON public.votos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Votos insert own" ON public.votos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Votos delete own" ON public.votos FOR DELETE TO authenticated
  USING (auth.uid() = usuario_id);

-- ============ Trigger updated_at en proyectos ============
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER proyectos_updated_at
BEFORE UPDATE ON public.proyectos
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ Trigger auto profile + rol consulta on signup (fallback) ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, correo, nombre, apellidos, whatsapp)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre',''),
    COALESCE(NEW.raw_user_meta_data->>'apellidos',''),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp','')
  ) ON CONFLICT (id) DO NOTHING;

  -- asigna rol según metadata, default 'consulta'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'rol')::public.app_role, 'consulta'::public.app_role)
  ) ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
