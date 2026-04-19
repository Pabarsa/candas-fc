-- Jornadas 31-34 (Segunda Vuelta) - Segunda Asturfútbol Grupo 1 2025/26
-- Datos exactos para el esquema actual de equipos

-- Elimina los partidos con local_id o visitante_id nulos que se crearon con nombres incorrectos.
delete from public.partidos where local_id is null or visitante_id is null;

-- Jornada 31 (26-04-2026)
INSERT INTO public.partidos (jornada, local_id, visitante_id, jugado) VALUES
(31, (SELECT id FROM public.equipos WHERE nombre='Real Avilés B' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Codema CF' LIMIT 1), false),
(31, (SELECT id FROM public.equipos WHERE nombre='Narcea' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Llaranes CF' LIMIT 1), false),
(31, (SELECT id FROM public.equipos WHERE nombre='Asunción A' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Fabril CD' LIMIT 1), false),
(31, (SELECT id FROM public.equipos WHERE nombre='Podes CF' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Candás CF' LIMIT 1), false),
(31, (SELECT id FROM public.equipos WHERE nombre='Triple A Gijón' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Atlético Camocha' LIMIT 1), false),
(31, (SELECT id FROM public.equipos WHERE nombre='Navia CF' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Siderúrgico Llaranes CF' LIMIT 1), false),
(31, (SELECT id FROM public.equipos WHERE nombre='CD Treviense' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Praviano B' LIMIT 1), false),
(31, (SELECT id FROM public.equipos WHERE nombre='Boal CF' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Marítimo RC' LIMIT 1), false),
(31, (SELECT id FROM public.equipos WHERE nombre='Vegadeo Club de Fútbol' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Gozón' LIMIT 1), false);

-- Jornada 32 (03-05-2026)
INSERT INTO public.partidos (jornada, local_id, visitante_id, jugado) VALUES
(32, (SELECT id FROM public.equipos WHERE nombre='Gozón' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Candás CF' LIMIT 1), false),
(32, (SELECT id FROM public.equipos WHERE nombre='Siderúrgico Llaranes CF' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Triple A Gijón' LIMIT 1), false),
(32, (SELECT id FROM public.equipos WHERE nombre='Fabril CD' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='CD Treviense' LIMIT 1), false),
(32, (SELECT id FROM public.equipos WHERE nombre='Llaranes CF' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Vegadeo Club de Fútbol' LIMIT 1), false),
(32, (SELECT id FROM public.equipos WHERE nombre='Codema CF' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Navia CF' LIMIT 1), false),
(32, (SELECT id FROM public.equipos WHERE nombre='Praviano B' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Real Avilés B' LIMIT 1), false),
(32, (SELECT id FROM public.equipos WHERE nombre='Marítimo RC' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Asunción A' LIMIT 1), false),
(32, (SELECT id FROM public.equipos WHERE nombre='Boal CF' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Podes CF' LIMIT 1), false),
(32, (SELECT id FROM public.equipos WHERE nombre='Atlético Camocha' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Narcea' LIMIT 1), false);

-- Jornada 33 (10-05-2026)
INSERT INTO public.partidos (jornada, local_id, visitante_id, jugado) VALUES
(33, (SELECT id FROM public.equipos WHERE nombre='Gozón' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Podes CF' LIMIT 1), false),
(33, (SELECT id FROM public.equipos WHERE nombre='Real Avilés B' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Fabril CD' LIMIT 1), false),
(33, (SELECT id FROM public.equipos WHERE nombre='Asunción A' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Boal CF' LIMIT 1), false),
(33, (SELECT id FROM public.equipos WHERE nombre='Candás CF' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Llaranes CF' LIMIT 1), false),
(33, (SELECT id FROM public.equipos WHERE nombre='Narcea' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Siderúrgico Llaranes CF' LIMIT 1), false),
(33, (SELECT id FROM public.equipos WHERE nombre='Triple A Gijón' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Codema CF' LIMIT 1), false),
(33, (SELECT id FROM public.equipos WHERE nombre='Navia CF' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Praviano B' LIMIT 1), false),
(33, (SELECT id FROM public.equipos WHERE nombre='CD Treviense' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Marítimo RC' LIMIT 1), false),
(33, (SELECT id FROM public.equipos WHERE nombre='Vegadeo Club de Fútbol' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Atlético Camocha' LIMIT 1), false);

-- Jornada 34 (17-05-2026)
INSERT INTO public.partidos (jornada, local_id, visitante_id, jugado) VALUES
(34, (SELECT id FROM public.equipos WHERE nombre='Siderúrgico Llaranes CF' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Vegadeo Club de Fútbol' LIMIT 1), false),
(34, (SELECT id FROM public.equipos WHERE nombre='Fabril CD' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Navia CF' LIMIT 1), false),
(34, (SELECT id FROM public.equipos WHERE nombre='Llaranes CF' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Gozón' LIMIT 1), false),
(34, (SELECT id FROM public.equipos WHERE nombre='Codema CF' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Narcea' LIMIT 1), false),
(34, (SELECT id FROM public.equipos WHERE nombre='Praviano B' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Triple A Gijón' LIMIT 1), false),
(34, (SELECT id FROM public.equipos WHERE nombre='Marítimo RC' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Real Avilés B' LIMIT 1), false),
(34, (SELECT id FROM public.equipos WHERE nombre='Boal CF' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='CD Treviense' LIMIT 1), false),
(34, (SELECT id FROM public.equipos WHERE nombre='Podes CF' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Asunción A' LIMIT 1), false),
(34, (SELECT id FROM public.equipos WHERE nombre='Atlético Camocha' LIMIT 1), (SELECT id FROM public.equipos WHERE nombre='Candás CF' LIMIT 1), false);
