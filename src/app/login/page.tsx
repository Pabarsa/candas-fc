"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    // Navegación completa — no llamar setCargando(false) para que quede en "Entrando..."
    window.location.assign("/abonados");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 sm:px-6 py-12 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Bienvenido</p>
          <h1 className="font-poppins font-black text-3xl text-white mb-2">Entrar</h1>
          <p className="text-white/40 text-sm">Acceso gratuito para todos los aficionados</p>
        </div>

        <div className="card-dark rounded-2xl p-8 border border-white/5">
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide">
                  Contraseña
                </label>
                <Link href="/recuperar-contrasena"
                  className="text-xs text-white/30 hover:text-candas-rojo transition-colors">
                  ¿Olvidaste la contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required placeholder="Tu contraseña" autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/20 focus:outline-none focus:border-candas-rojo focus:ring-1 focus:ring-candas-rojo/50 transition"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1"
                  aria-label={showPass ? "Ocultar contraseña" : "Ver contraseña"}>
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={cargando}
              className="w-full bg-candas-rojo hover:bg-candas-rojoOscuro text-white font-bold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 btn-primary text-sm">
              {cargando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-white/30">
              ¿Aún no tienes cuenta?{" "}
              <Link href="/registro" className="text-white font-semibold hover:text-candas-rojo transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>

        <p className="text-xs text-white/20 text-center mt-6">Registro gratuito · Datos protegidos</p>
      </div>
    </div>
  );
}