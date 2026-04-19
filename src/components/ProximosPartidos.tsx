"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Partido } from "@/lib/types";
import Link from "next/link";

export default function ProximosPartidos() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const supabase = createClient();
        const { data: equipos, error: eqError } = await supabase
          .from("equipos")
          .select("*")
          .limit(1);
        
        if (eqError) {
          console.error("Error equipos:", eqError);
          setError("Error cargando equipos");
          setCargando(false);
          return;
        }

        const { data, error: pError } = await supabase
          .from("partidos")
          .select(
            "*, local:equipos!partidos_local_id_fkey(*), visitante:equipos!partidos_visitante_id_fkey(*)"
          )
          .eq("jugado", false)
          .order("jornada", { ascending: true })
          .limit(5);

        if (pError) {
          console.error("Error partidos:", pError);
          setError("Error cargando partidos");
        } else {
          const pts = (data ?? []) as Partido[];
          const candas = equipos?.find((e) => e.nombre === "Candás CF");
          
          // Filtrar solo partidos del Candás
          if (candas) {
            const filtered = pts.filter(
              (p) =>
                p.local_id === candas.id || p.visitante_id === candas.id
            );
            setPartidos(filtered.slice(0, 5));
          } else {
            setPartidos(pts);
          }
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Error inesperado");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
        Cargando partidos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (partidos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
        No hay partidos pendientes del Candás
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="bg-candas-negro text-white px-6 py-4 font-bold text-lg">
        ⚽ Próximos partidos del Candás
      </div>
      <div className="divide-y">
        {partidos.map((p) => {
          const esLocal = p.local?.nombre === "Candás CF";
          return (
            <div key={p.id} className="px-6 py-4 hover:bg-gray-50 transition">
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs text-gray-500 font-semibold">
                  J{p.jornada}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-bold ${
                        esLocal ? "text-candas-rojo" : "text-gray-700"
                      }`}
                    >
                      {p.local?.nombre}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${
                        !esLocal ? "text-candas-rojo" : "text-gray-700"
                      }`}
                    >
                      {p.visitante?.nombre}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {esLocal ? "📍 Localía" : "✈️ Fuera"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-gray-50 px-6 py-4 text-center">
        <Link
          href="/simulador"
          className="text-candas-rojo font-bold hover:underline text-sm"
        >
          Ver todos los partidos en el simulador →
        </Link>
      </div>
    </div>
  );
}
