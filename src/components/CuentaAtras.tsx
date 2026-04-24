"use client";

import { useEffect, useState } from "react";

type Diff = { dias: number; horas: number; minutos: number; segundos: number };

export default function CuentaAtras({ fecha }: { fecha: string }) {
  const [diff, setDiff] = useState<Diff | null>(null);
  const [pasado, setPasado] = useState(false);

  useEffect(() => {
    const calc = () => {
      const ahora = Date.now();
      const objetivo = new Date(fecha).getTime();
      const delta = objetivo - ahora;

      if (delta <= 0) {
        setPasado(true);
        setDiff(null);
        return;
      }

      const dias = Math.floor(delta / 86_400_000);
      const horas = Math.floor((delta % 86_400_000) / 3_600_000);
      const minutos = Math.floor((delta % 3_600_000) / 60_000);
      const segundos = Math.floor((delta % 60_000) / 1_000);
      setDiff({ dias, horas, minutos, segundos });
    };

    calc();
    const t = setInterval(calc, 1_000);
    return () => clearInterval(t);
  }, [fecha]);

  if (pasado) return null;
  if (!diff) return null;

  const bloques = [
    ...(diff.dias > 0 ? [{ val: diff.dias, label: "días" }] : []),
    { val: diff.horas, label: "horas" },
    { val: diff.minutos, label: "min" },
    { val: diff.segundos, label: "seg" },
  ];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-white/50 text-xs font-semibold uppercase tracking-wide mr-1">
        Faltan
      </span>
      {bloques.map(({ val, label }, i) => (
        <span key={label} className="flex items-baseline gap-0.5">
          {i > 0 && <span className="text-white/30 text-xs">:</span>}
          <span className="font-black text-white tabular-nums">
            {String(val).padStart(2, "0")}
          </span>
          <span className="text-white/50 text-[10px] ml-0.5">{label}</span>
        </span>
      ))}
    </div>
  );
}