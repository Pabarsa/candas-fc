"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Perfil = {
  nombre: string | null;
  carnet: string | null;
  rol: string;
};

type VotoHistorial = {
  encuesta: { titulo: string };
  jugadores: { nombre: string } | null;
  created_at: string;
};

export default function PerfilAbonado({
  perfil,
  email,
  usuarioId,
  votos,
}: {
  perfil: Perfil;
  email: string;
  usuarioId: string;
  votos: VotoHistorial[];
}) {
  const supabase = createClient();
  const [paso, setPaso] = useState<"ver" | "password">("ver");
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);

    if (passwordNueva.length < 6) {
      setError("La contraseña nueva debe tener al menos 6 caracteres.");
      return;
    }
    if (passwordNueva !== passwordRepeat) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setGuardando(true);
    const { error: err } = await supabase.auth.updateUser({
      password: passwordNueva,
    });
    setGuardando(false);

    if (err) {
      setError(err.message);
    } else {
      setOk("✅ Contraseña actualizada correctamente.");
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordRepeat("");
      setPaso("ver");
    }
  };

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {/* Datos personales */}
      <div className="card-dark rounded-2xl p-6">
        <h3 className="font-black text-lg mb-4">Tus datos</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-white/30 font-semibold uppercase tracking-wide">Nombre</p>
            <p className="font-bold text-white">{perfil.nombre || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-white/30 font-semibold uppercase tracking-wide">Email</p>
            <p className="font-bold text-white">{email}</p>
          </div>
          {perfil.carnet && perfil.carnet.trim() !== "" && (
            <div>
              <p className="text-xs text-white/30 font-semibold uppercase tracking-wide">Nº carnet</p>
              <p className="font-bold text-white">{perfil.carnet}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-white/30 font-semibold uppercase tracking-wide">Rol</p>
            <span className={`inline-block text-xs font-black px-3 py-1 rounded-full ${
              perfil.rol === "admin"
                ? "bg-candas-rojo text-white"
                : "bg-gray-100 text-gray-700"
            }`}>
              {perfil.rol === "admin" ? "Admin" : "🎫 Abonado"}
            </span>
          </div>
        </div>

        {/*Cambiar contraseña */}
        <div className="mt-5 pt-5 border-t border-white/5">
          {paso === "ver" ? (
            <button
              onClick={() => setPaso("password")}
              className="text-candas-rojo text-sm font-bold hover:underline"
            >
              Cambiar contraseña
            </button>
          ) : (
            <form onSubmit={cambiarPassword} className="space-y-3">
              <p className="text-sm font-black text-gray-800 mb-2">Nueva contraseña</p>
              <input
                type="password"
                placeholder="Contraseña nueva"
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none"
                autoFocus
              />
              <input
                type="password"
                placeholder="Repite la contraseña"
                value={passwordRepeat}
                onChange={(e) => setPasswordRepeat(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none"
              />
              {error && <p className="text-red-600 text-xs">{error}</p>}
              {ok && <p className="text-green-600 text-xs">{ok}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 bg-candas-rojo text-white font-black py-2 rounded-lg text-sm hover:bg-candas-rojoOscuro transition disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={() => { setPaso("ver"); setError(null); }}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Historial de votos */}
      <div className="card-dark rounded-2xl p-6">
        <h3 className="font-black text-lg mb-4">Tus votos anteriores</h3>
        {votos.length === 0 ? (
          <div className="text-center py-8 text-white/20">
            <p className="text-3xl mb-2"></p>
            <p className="text-sm">Aún no has votado en ninguna encuesta.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {votos.map((v, i) => (
              <li key={i} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0">
                <div className="bg-white/5 rounded-lg p-2 flex-shrink-0">
                  <span className="text-sm">⚽</span>
                </div>
                <div>
                  <p className="text-xs text-white/30 font-semibold">
                    {v.encuesta?.titulo}
                  </p>
                  <p className="font-bold text-sm text-white">
                    {v.jugadores?.nombre ?? "—"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}