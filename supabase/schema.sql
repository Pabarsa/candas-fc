-- =================================================================
-- ESQUEMA BASE DE DATOS CANDÁS FC
-- Pega este SQL en: Supabase → SQL Editor → New Query → Run
-- =================================================================

-- 1. TABLA DE PERFILES (extiende auth.users)
-- ----------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nombre text,
  carnet text unique,
  rol text default 'abonado' check (rol in ('abonado', 'admin')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Permitir a los usuarios autenticados leer perfiles básicos
 drop policy if exists "Los usuarios ven su propio perfil" on public.profiles;
 create policy "Los usuarios ven su propio perfil"
   on public.profiles for select
   using ( auth.role() = 'authenticated' );

drop policy if exists "Los usuarios editan su propio perfil" on public.profiles;
create policy "Los usuarios editan su propio perfil"
   on public.profiles for update
   using ( auth.uid() = id );

drop policy if exists "Insertar perfil propio" on public.profiles;
create policy "Insertar perfil propio"
   on public.profiles for insert
   with check ( auth.uid() = id );

-- No necesita política de administrador en perfiles para poder comprobar el rol desde otras tablas
 drop policy if exists "Admin ve todos los perfiles" on public.profiles;
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nombre, carnet)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    coalesce(new.raw_user_meta_data->>'carnet', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. EQUIPOS
-- ----------------------------------------------------------------
create table if not exists public.equipos (
  id serial primary key,
  nombre text not null unique,
  escudo text,
  -- Estadísticas iniciales (snapshot de una jornada concreta).
  -- Permiten empezar la web con la tabla real sin cargar todos los partidos previos.
  -- El admin solo meterá partidos de jornadas posteriores al snapshot,
  -- que se sumarán a estos valores.
  pj_inicial int default 0,
  pg_inicial int default 0,
  pe_inicial int default 0,
  pp_inicial int default 0,
  gf_inicial int default 0,
  gc_inicial int default 0,
  created_at timestamptz default now()
);

-- Si ya ejecutaste una versión antigua del esquema, añade las columnas nuevas:
alter table public.equipos add column if not exists pj_inicial int default 0;
alter table public.equipos add column if not exists pg_inicial int default 0;
alter table public.equipos add column if not exists pe_inicial int default 0;
alter table public.equipos add column if not exists pp_inicial int default 0;
alter table public.equipos add column if not exists gf_inicial int default 0;
alter table public.equipos add column if not exists gc_inicial int default 0;

alter table public.equipos enable row level security;

drop policy if exists "Todos ven equipos" on public.equipos;
create policy "Todos ven equipos"
  on public.equipos for select using ( true );

drop policy if exists "Admin gestiona equipos" on public.equipos;
create policy "Admin gestiona equipos"
  on public.equipos for all
  using ( exists(select 1 from public.profiles p where p.id = auth.uid() and p.rol = 'admin') );


-- 3. PARTIDOS
-- ----------------------------------------------------------------
create table if not exists public.partidos (
  id serial primary key,
  jornada int not null,
  fecha timestamptz,
  local_id int references public.equipos(id) on delete cascade,
  visitante_id int references public.equipos(id) on delete cascade,
  goles_local int,
  goles_visitante int,
  jugado boolean default false,
  created_at timestamptz default now()
);

alter table public.partidos enable row level security;

drop policy if exists "Todos ven partidos" on public.partidos;
create policy "Todos ven partidos"
  on public.partidos for select using ( true );

drop policy if exists "Admin gestiona partidos" on public.partidos;
create policy "Admin gestiona partidos"
  on public.partidos for all
  using ( exists(select 1 from public.profiles p where p.id = auth.uid() and p.rol = 'admin') );


-- 4. MENSAJES DEL CHAT DE ABONADOS
-- ----------------------------------------------------------------
create table if not exists public.mensajes (
  id bigserial primary key,
  usuario_id uuid references auth.users on delete cascade,
  contenido text not null,
  created_at timestamptz default now()
);

alter table public.mensajes enable row level security;

-- Solo abonados o admin pueden leer los mensajes
drop policy if exists "Abonados leen mensajes" on public.mensajes;
create policy "Abonados leen mensajes"
  on public.mensajes for select
  using ( exists(select 1 from public.profiles p where p.id = auth.uid() and p.rol in ('abonado','admin')) );

-- Solo usuarios autenticados pueden escribir, y solo su propio mensaje
drop policy if exists "Abonados escriben mensajes" on public.mensajes;
create policy "Abonados escriben mensajes"
  on public.mensajes for insert
  with check ( auth.uid() = usuario_id );

-- Cada usuario puede borrar sus mensajes
drop policy if exists "Borrar mensaje propio" on public.mensajes;
create policy "Borrar mensaje propio"
  on public.mensajes for delete
  using ( auth.uid() = usuario_id );


-- 5. VIAJES EN COCHE A PARTIDOS
-- ----------------------------------------------------------------
create table if not exists public.viajes (
  id serial primary key,
  usuario_id uuid references auth.users on delete cascade,
  partido_id int references public.partidos(id) on delete cascade,
  punto_salida text not null,
  hora_salida timestamptz not null,
  plazas int not null default 1,
  notas text,
  created_at timestamptz default now()
);

alter table public.viajes enable row level security;

drop policy if exists "Abonados ven viajes" on public.viajes;
create policy "Abonados ven viajes"
  on public.viajes for select
  using ( exists(select 1 from public.profiles p where p.id = auth.uid() and p.rol in ('abonado','admin')) );

drop policy if exists "Abonados crean su viaje" on public.viajes;
create policy "Abonados crean su viaje"
  on public.viajes for insert
  with check ( auth.uid() = usuario_id );

drop policy if exists "Abonados editan su viaje" on public.viajes;
create policy "Abonados editan su viaje"
  on public.viajes for update
  using ( auth.uid() = usuario_id );

drop policy if exists "Abonados borran su viaje" on public.viajes;
create policy "Abonados borran su viaje"
  on public.viajes for delete
  using ( auth.uid() = usuario_id );


-- 6. ACTIVAR REALTIME EN LA TABLA DE MENSAJES (para el chat en vivo)
-- ----------------------------------------------------------------
-- Ejecuta también en: Database → Replication → activar mensajes
-- Si ya está añadida (error 42710), ignora este comentario
alter publication supabase_realtime set table public.mensajes;


-- 7. DATOS REALES: SEGUNDA ASTURFÚTBOL GRUPO 1 · JORNADA 30 · 2025/26
-- ----------------------------------------------------------------
-- Snapshot oficial tomado de BeSoccer en la jornada 30.
-- Formato: (nombre, PJ, PG, PE, PP, GF, GC)
-- Los puntos y la diferencia de goles se calculan automáticamente en la app.
-- ⚠️ Si ya tenías equipos, esto los BORRA y los reemplaza (junto con sus partidos).

delete from public.partidos;
delete from public.equipos;

insert into public.equipos (nombre, pj_inicial, pg_inicial, pe_inicial, pp_inicial, gf_inicial, gc_inicial) values
  ('Real Avilés B',            29, 18,  8,  3, 55, 26),  -- 1º · 62 pts
  ('CD Treviense',             30, 18,  7,  5, 57, 32),  -- 2º · 61 pts
  ('Narcea',                   30, 16,  7,  7, 52, 32),  -- 3º · 55 pts
  ('Navia CF',                 29, 17,  4,  8, 61, 37),  -- 4º · 55 pts
  ('Gozón',                    30, 14, 11,  5, 59, 41),  -- 5º · 53 pts
  ('Candás CF',                30, 15,  8,  7, 52, 34),  -- 6º · 53 pts  ⚽ NUESTRO EQUIPO
  ('Atlético Camocha',         29, 13,  7,  9, 55, 41),  -- 7º · 46 pts
  ('Marítimo RC',              29, 12,  8,  9, 67, 48),  -- 8º · 44 pts
  ('Triple A Gijón',           30, 10, 11,  9, 51, 44),  -- 9º · 41 pts
  ('Fabril CD',                30, 10,  8, 12, 43, 41),  -- 10º · 38 pts
  ('Vegadeo Club de Fútbol',   30, 10,  4, 16, 32, 56),  -- 11º · 34 pts
  ('Codema CF',                30,  9,  6, 15, 50, 66),  -- 12º · 33 pts
  ('Praviano B',               29,  8,  6, 15, 36, 51),  -- 13º · 30 pts
  ('Siderúrgico Llaranes CF',  29,  7,  8, 14, 40, 53),  -- 14º · 29 pts
  ('Boal CF',                  30,  8,  3, 19, 31, 48),  -- 15º · 27 pts
  ('Podes CF',                 29,  6,  8, 15, 37, 53),  -- 16º · 26 pts  🔻 descenso
  ('Asunción A',               29,  8,  2, 19, 40, 76),  -- 17º · 26 pts  🔻 descenso
  ('Llaranes CF',              30,  6,  6, 18, 27, 66);  -- 18º · 24 pts  🔻 descenso


-- 8. CÓMO CREAR UN ADMIN
-- ----------------------------------------------------------------
-- Después de registrarte normalmente en /registro, ejecuta aquí:
-- update public.profiles set rol = 'admin' where carnet = 'TU_NUM_CARNET';
