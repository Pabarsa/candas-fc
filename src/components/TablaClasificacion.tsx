import { FilaClasificacion } from "@/lib/types";

type Props = {
  filas: FilaClasificacion[];
  destacarEquipo?: string;
  ascensoDirecto?: number;
  playoff?: number;
  descienden?: number;
};

export default function TablaClasificacion({
  filas,
  destacarEquipo = "Candás CF",
  ascensoDirecto = 1,
  playoff = 4,
  descienden = 3,
}: Props) {
  const total = filas.length;

  const getZona = (pos: number) => {
    if (pos <= ascensoDirecto) return "directo";
    if (pos <= ascensoDirecto + playoff) return "playoff";
    if (pos > total - descienden) return "descenso";
    return "normal";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-white/5">
            <th className="px-4 py-3 text-left text-xs text-white/20 font-medium w-10">#</th>
            <th className="px-4 py-3 text-left text-xs text-white/20 font-medium">Equipo</th>
            <th className="px-3 py-3 text-center text-xs text-white/20 font-medium">PJ</th>
            <th className="px-3 py-3 text-center text-xs text-white/20 font-medium">G</th>
            <th className="px-3 py-3 text-center text-xs text-white/20 font-medium">E</th>
            <th className="px-3 py-3 text-center text-xs text-white/20 font-medium">P</th>
            <th className="px-3 py-3 text-center text-xs text-white/20 font-medium hidden sm:table-cell">GF</th>
            <th className="px-3 py-3 text-center text-xs text-white/20 font-medium hidden sm:table-cell">GC</th>
            <th className="px-3 py-3 text-center text-xs text-white/20 font-medium">DIF</th>
            <th className="px-4 py-3 text-center text-xs text-white/20 font-medium">PTS</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => {
            const pos = i + 1;
            const zona = getZona(pos);
            const esCandas = f.equipo.nombre === destacarEquipo;

            return (
              <tr
                key={f.equipo.id}
                className={`border-b border-white/5 last:border-0 transition-colors duration-150 ${
                  esCandas ? "bg-candas-rojo/[0.08]" : "hover:bg-white/[0.02]"
                }`}
              >
                {/* Celda con indicador de zona */}
                <td className="px-4 py-3 w-10">
                  <div className="flex items-center gap-2">
                    {zona === "directo"  && <span className="w-1 h-5 rounded-full bg-green-500 flex-shrink-0" />}
                    {zona === "playoff"  && <span className="w-1 h-5 rounded-full bg-blue-400 flex-shrink-0" />}
                    {zona === "descenso" && <span className="w-1 h-5 rounded-full bg-red-500 flex-shrink-0" />}
                    {zona === "normal"   && <span className="w-1 h-5 rounded-full bg-transparent flex-shrink-0" />}
                    <span className="text-white/30 text-xs">{pos}</span>
                  </div>
                </td>
                <td className={`px-4 py-3 font-medium ${esCandas ? "text-white" : "text-white/60"}`}>
                  {f.equipo.nombre}
                  {esCandas && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-candas-rojo inline-block align-middle" />}
                </td>
                <td className="px-3 py-3 text-center text-white/40 text-xs">{f.pj}</td>
                <td className="px-3 py-3 text-center text-white/40 text-xs">{f.g}</td>
                <td className="px-3 py-3 text-center text-white/40 text-xs">{f.e}</td>
                <td className="px-3 py-3 text-center text-white/40 text-xs">{f.p}</td>
                <td className="px-3 py-3 text-center text-white/30 text-xs hidden sm:table-cell">{f.gf}</td>
                <td className="px-3 py-3 text-center text-white/30 text-xs hidden sm:table-cell">{f.gc}</td>
                <td className="px-3 py-3 text-center text-white/40 text-xs">
                  {f.dif > 0 ? `+${f.dif}` : f.dif}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold text-sm ${esCandas ? "text-white" : "text-white/70"}`}>
                    {f.pts}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Leyenda */}
      <div className="px-4 py-3 border-t border-white/5 flex flex-wrap gap-5 text-xs text-white/20">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
          Ascenso directo
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
          Play-off
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          Descenso
        </span>
      </div>
    </div>
  );
}