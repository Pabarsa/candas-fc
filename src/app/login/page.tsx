"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-16 text-center text-gray-500">
          Cargando...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/simulador";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message || "Email o contraseña incorrectos.");
        return;
      }

      // Esperar un poco para que la sesión se establezca
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verificar que la sesión se creó correctamente
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("No se pudo establecer la sesión. Inténtalo de nuevo.");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Ha ocurrido un error al iniciar sesión."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 md:py-16">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-candas-rojo mb-2">Entrar</h1>
          <p className="text-sm text-gray-600">
            Acceso a la zona exclusiva de socios
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">📧 Correo</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.email@ejemplo.com"
              autoComplete="email"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-candas-rojo focus:ring-1 focus:ring-candas-rojo transition bg-gray-50 hover:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">🔐 Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-candas-rojo focus:ring-1 focus:ring-candas-rojo transition bg-gray-50 hover:bg-white"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 rounded p-4 text-sm">
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-gradient-to-r from-candas-rojo to-candas-rojoOscuro text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {cargando ? "🔄 Entrando..." : "✓ Entrar"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            ¿Aún no eres socio?{" "}
            <Link href="/registro" className="text-candas-rojo font-bold hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-6">
        Solo socios con carnet | Datos protegidos
      </p>
    </div>
  );
}
