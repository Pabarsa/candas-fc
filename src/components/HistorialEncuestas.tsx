type GanadorEncuesta = {
  encuestaId: number;
  titulo: string;
  ganadorNombre: string;
  votos: number;
  totalVotos: number;
  fecha: string;
};

export default function HistorialEncuestas({
  historial,
}: {
  historial: GanadorEncuesta[];
}) {
  if (historial.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-2xl font-black">🏅 Historial de votaciones</h2>
        <span className="text-sm text-gray-500 font-normal">
          Mejores jugadores anteriores
        </span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {historial.map((item) => {
          const pct =
            item.totalVotos > 0
              ? Math.round((item.votos / item.totalVotos) * 100)
              : 0;

          return (
            <div
              key={item.encuestaId}
              className="card-dark rounded-xl p-4 flex gap-3 items-start"
            >
              {/* Trofeo */}
              <div className="bg-white/5 rounded-lg p-2 flex-shrink-0">
                <span className="text-xl"></span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-white/30 font-semibold uppercase tracking-wide mb-0.5 truncate">
                  {item.titulo}
                </p>
                <p className="font-black text-white text-sm truncate">
                  {item.ganadorNombre}
                </p>

                {/* Barra de votos */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                    <span>{item.votos} votos</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-candas-rojo rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}