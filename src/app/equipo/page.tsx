import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "La Plantilla — Fondo Sur Canijo",
  description: "Conoce a los jugadores del Candás CF. Plantilla completa temporada 2025/26.",
};

export const dynamic = "force-dynamic";

type Jugador = {
  id: number;
  nombre: string;
  dorsal: number | null;
  posicion: string | null;
  foto_url: string | null;
};

const ORDEN_POSICION = ["Portero", "Defensa", "Centrocampista", "Delantero"];

const COLOR_POSICION: Record<string, string> = {
  Portero: "bg-yellow-100 text-yellow-800",
  Defensa: "bg-blue-100 text-blue-800",
  Centrocampista: "bg-green-100 text-green-800",
  Delantero: "bg-red-100 text-red-800",
};

export default async function EquipoPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("jugadores")
    .select("id, nombre, dorsal, posicion, foto_url")
    .eq("activo", true)
    .order("dorsal", { ascending: true, nullsFirst: false });

  const jugadores = (data as Jugador[]) ?? [];

  // Agrupar por posición
  const grupos = ORDEN_POSICION.map((pos) => ({
    posicion: pos,
    jugadores: jugadores.filter((j) => j.posicion === pos),
  })).filter((g) => g.jugadores.length > 0);

  // Los sin posición al final
  const sinPosicion = jugadores.filter((j) => !j.posicion);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Cabecera */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black mb-1">👟 La Plantilla</h1>
        <p className="text-gray-500">
          Candás CF · Temporada 2025/26 · {jugadores.length} jugadores
        </p>
      </div>

      {/* Grupos por posición */}
      <div className="space-y-10">
        {grupos.map(({ posicion, jugadores: grupo }) => (
          <section key={posicion}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-black">{posicion}s</h2>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${COLOR_POSICION[posicion]}`}>
                {grupo.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {grupo.map((j) => (
                <TarjetaJugador key={j.id} jugador={j} />
              ))}
            </div>
          </section>
        ))}

        {sinPosicion.length > 0 && (
          <section>
            <h2 className="text-xl font-black mb-4">Otros</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sinPosicion.map((j) => (
                <TarjetaJugador key={j.id} jugador={j} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TarjetaJugador({ jugador }: { jugador: Jugador }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition group">
      {/* Foto */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {jugador.foto_url ? (
          <img
            src={jugador.foto_url}
            alt={jugador.nombre}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-candas-rojo to-candas-rojoOscuro">
            <span className="text-white text-4xl font-black opacity-30">
              {jugador.dorsal ?? "?"}
            </span>
          </div>
        )}
        {/* Dorsal badge */}
        {jugador.dorsal && (
          <div className="absolute top-2 left-2 bg-candas-rojo text-white text-xs font-black w-7 h-7 rounded-lg flex items-center justify-center shadow">
            {jugador.dorsal}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-black text-sm leading-tight text-gray-900">
          {jugador.nombre}
        </p>
        {jugador.posicion && (
          <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${COLOR_POSICION[jugador.posicion] ?? "bg-gray-100 text-gray-600"}`}>
            {jugador.posicion}
          </span>
        )}
      </div>
    </div>
  );
}