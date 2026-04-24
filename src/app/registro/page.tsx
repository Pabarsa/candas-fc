"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistroPage() {
  const supabase = createClient();
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setMensaje(null);
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    setCargando(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: { data: { nombre: nombre.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (signUpError) { setError(signUpError.message); return; }
      setMensaje("Registro correcto. Revisa tu correo y confirma la cuenta para entrar.");
      setTimeout(() => router.push("/login"), 3000);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ha ocurrido un error al crear la cuenta.");
    } finally { setCargando(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 sm:px-6 py-12 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Registro gratuito</p>
          <h1 className="font-poppins font-black text-3xl text-white mb-2">Crear cuenta</h1>
          <p className="text-white/40 text-sm">Accede al simulador, el chat, los viajes y las encuestas</p>
        </div>

        <div className="card-dark rounded-2xl p-8 border border-white/5">
          <form onSubmit={onSubmit} className="space-y-5">
            <Field label="Nombre completo" value={nombre} onChange={setNombre} placeholder="Pablo García" autocomplete="name" required />
            <Field label="Correo electrónico" value={email} onChange={setEmail} type="email" placeholder="tu@email.com" autocomplete="email" required />
            {/* Contraseña con ojo */}
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required placeholder="Mínimo 6 caracteres" autoComplete="new-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/20 focus:outline-none focus:border-candas-rojo focus:ring-1 focus:ring-candas-rojo/50 transition"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1"
                  aria-label={showPass ? "Ocultar" : "Ver contraseña"}>
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
              <p className="text-xs text-white/20 mt-1">Usa una contraseña segura</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">
                {error}
              </div>
            )}
            {mensaje && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-4 text-sm">
                {mensaje}
              </div>
            )}

            <button
              type="submit" disabled={cargando}
              className="w-full bg-candas-rojo hover:bg-candas-rojoOscuro text-white font-bold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 btn-primary"
            >
              {cargando ? "Creando cuenta..." : "Crear cuenta gratis"}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-white/30">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-white font-semibold hover:text-candas-rojo transition-colors">
                Entra aquí
              </Link>
            </p>
          </div>
        </div>

        <p className="text-xs text-white/20 text-center mt-6">Registro gratuito · Datos protegidos</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, autocomplete, hint, required }:
  { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; autocomplete?: string; hint?: string; required?: boolean; }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        required={required} placeholder={placeholder} autoComplete={autocomplete}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-candas-rojo focus:ring-1 focus:ring-candas-rojo/50 transition"
      />
      {hint && <p className="text-xs text-white/20 mt-1">{hint}</p>}
    </div>
  );
}