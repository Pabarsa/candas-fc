import { FilaClasificacion } from "@/lib/types";

type Props = {
  filas: FilaClasificacion[];
  destacarEquipo?: string;
  /**
   * Cuántos equipos suben directos, hacen play-off y descienden.
   * Segunda Asturfútbol Grupo 1 2025/26: 1 directo, 4 play-off, 3 descienden.
   */
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

  const zonaDe = (pos: number) => {
    if (pos <= ascensoDirecto) return "directo";
    if (pos <= ascensoDirecto + playoff) return "playoff";
    if (pos > total - descienden) return "descenso";
    return "normal";
  };

  const color = {
    directo: "bg-green-100 border-l-4 border-green-600",
    playoff: "bg-blue-50 border-l-4 border-blue-500",
    descenso: "bg-red-50 border-l-4 border-red-500",
    normal: "",
  } as const;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-candas-negro text-white text-left">
            <th className="px-3 py-2 w-10">#</th>
            <th className="px-3 py-2">Equipo</th>
            <th className="px-2 py-2 text-center">PJ</th>
            <th className="px-2 py-2 text-center">G</th>
            <th className="px-2 py-2 text-center">E</th>
            <th className="px-2 py-2 text-center">P</th>
            <th className="px-2 py-2 text-center hidden sm:table-cell">GF</th>
            <th className="px-2 py-2 text-center hidden sm:table-cell">GC</th>
            <th className="px-2 py-2 text-center">DIF</th>
            <th className="px-3 py-2 text-center font-black">PTS</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => {
            const pos = i + 1;
            const zona = zonaDe(pos);
            const esCandas = f.equipo.nombre === destacarEquipo;
            return (
              <tr
                key={f.equipo.id}
                className={`${color[zona]} ${esCandas ? "font-bold" : ""} border-b border-gray-100`}
              >
                <td className="px-3 py-2">{pos}</td>
                <td className={`px-3 py-2 ${esCandas ? "text-candas-rojo" : ""}`}>
                  {f.equipo.nombre}
                </td>
                <td className="px-2 py-2 text-center">{f.pj}</td>
                <td className="px-2 py-2 text-center">{f.g}</td>
                <td className="px-2 py-2 text-center">{f.e}</td>
                <td className="px-2 py-2 text-center">{f.p}</td>
                <td className="px-2 py-2 text-center hidden sm:table-cell">{f.gf}</td>
                <td className="px-2 py-2 text-center hidden sm:table-cell">{f.gc}</td>
                <td className="px-2 py-2 text-center">
                  {f.dif > 0 ? `+${f.dif}` : f.dif}
                </td>
                <td className="px-3 py-2 text-center font-black">{f.pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-600 rounded" /> Ascenso directo
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded" /> Play-off de ascenso
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded" /> Descenso
        </span>
      </div>
    </div>
  );
}
