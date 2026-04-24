"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function RecuperarContrasenaPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/actualizar-contrasena`,
      });
      if (error) { setError("No se pudo enviar el correo. Comprueba el email."); return; }
      setEnviado(true);
    } catch {
      setError("Ha ocurrido un error. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 sm:px-6 py-12 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Acceso</p>
          <h1 className="font-poppins font-black text-3xl text-white mb-2">Recuperar contraseña</h1>
          <p className="text-white/40 text-sm">Te mandamos un enlace a tu correo para cambiarla</p>
        </div>

        <div className="card-dark rounded-2xl p-8 border border-white/5">
          {enviado ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-green-400">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <p className="font-poppins font-bold text-white text-lg mb-2">Correo enviado</p>
              <p className="text-white/40 text-sm mb-6">
                Revisa tu bandeja de entrada en <span className="text-white">{email}</span> y sigue el enlace para cambiar la contraseña.
              </p>
              <Link href="/login" className="text-candas-rojo font-semibold text-sm hover:text-white transition-colors">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required placeholder="tu@email.com" autoComplete="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-candas-rojo focus:ring-1 focus:ring-candas-rojo/50 transition"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={cargando}
                className="w-full bg-candas-rojo hover:bg-candas-rojoOscuro text-white font-bold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 text-sm btn-primary">
                {cargando ? "Enviando..." : "Enviar enlace de recuperación"}
              </button>
            </form>
          )}

          {!enviado && (
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <Link href="/login" className="text-sm text-white/30 hover:text-white transition-colors">
                Volver al inicio de sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}