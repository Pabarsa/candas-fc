export type Equipo = {
  id: number;
  nombre: string;
  escudo?: string | null;
  pj_inicial?: number | null;
  pg_inicial?: number | null;
  pe_inicial?: number | null;
  pp_inicial?: number | null;
  gf_inicial?: number | null;
  gc_inicial?: number | null;
};

export type Partido = {
  id: number;
  jornada: number;
  fecha: string | null;
  local_id: number;
  visitante_id: number;
  goles_local: number | null;
  goles_visitante: number | null;
  jugado: boolean;
  local?: Equipo;
  visitante?: Equipo;
};

export type FilaClasificacion = {
  equipo: Equipo;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dif: number;
  pts: number;
};

export type Perfil = {
  id: string;
  nombre: string | null;
  carnet: string | null;
  rol: "abonado" | "admin";
};

export type Mensaje = {
  id: number;
  usuario_id: string;
  contenido: string;
  created_at: string;
  profiles?: { nombre: string | null; carnet: string | null };
};

export type Viaje = {
  id: number;
  usuario_id: string;
  partido_id: number;
  punto_salida: string;
  hora_salida: string;
  plazas: number;
  notas: string | null;
  created_at: string;
  partidos?: Partido;
  profiles?: { nombre: string | null; carnet: string | null };
};

export function calcularClasificacion(
  equipos: Equipo[],
  partidos: Partido[]
): FilaClasificacion[] {
  const tabla = new Map<number, FilaClasificacion>();

  // Partimos desde las estadísticas iniciales (snapshot, por defecto 0)
  equipos.forEach((eq) => {
    const g = eq.pg_inicial ?? 0;
    const e = eq.pe_inicial ?? 0;
    const p = eq.pp_inicial ?? 0;
    tabla.set(eq.id, {
      equipo: eq,
      pj: eq.pj_inicial ?? 0,
      g,
      e,
      p,
      gf: eq.gf_inicial ?? 0,
      gc: eq.gc_inicial ?? 0,
      dif: 0,
      pts: 3 * g + e,
    });
  });

  // Y sumamos los partidos que ha ido introduciendo el admin
  partidos.forEach((p) => {
    if (!p.jugado || p.goles_local == null || p.goles_visitante == null) return;

    const local = tabla.get(p.local_id);
    const visitante = tabla.get(p.visitante_id);
    if (!local || !visitante) return;

    local.pj++; visitante.pj++;
    local.gf += p.goles_local; local.gc += p.goles_visitante;
    visitante.gf += p.goles_visitante; visitante.gc += p.goles_local;

    if (p.goles_local > p.goles_visitante) {
      local.g++; local.pts += 3;
      visitante.p++;
    } else if (p.goles_local < p.goles_visitante) {
      visitante.g++; visitante.pts += 3;
      local.p++;
    } else {
      local.e++; local.pts++;
      visitante.e++; visitante.pts++;
    }
  });

  const filas = Array.from(tabla.values());
  filas.forEach((f) => (f.dif = f.gf - f.gc));

  // Orden: pts → dif → gf → nombre
  filas.sort((a, b) =>
    b.pts - a.pts ||
    b.dif - a.dif ||
    b.gf - a.gf ||
    a.equipo.nombre.localeCompare(b.equipo.nombre)
  );

  return filas;
}
