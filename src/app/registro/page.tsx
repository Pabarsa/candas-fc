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
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setCargando(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nombre: nombre.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setMensaje(
        "¡Registro correcto! Revisa tu correo y confirma la cuenta para entrar."
      );
      setTimeout(() => router.push("/login"), 3000);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Ha ocurrido un error al crear la cuenta."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 md:py-16">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-candas-rojo mb-2">Crear cuenta</h1>
          <p className="text-sm text-gray-600">
            Regístrate para acceder al simulador y a la zona de abonados
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <Field
            label="👤 Nombre completo"
            value={nombre}
            onChange={setNombre}
            placeholder="Juan Pérez García"
            autocomplete="name"
            required
          />
          <Field
            label="📧 Correo electrónico"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="tu.email@ejemplo.com"
            autocomplete="email"
            required
          />
          <Field
            label="🔐 Contraseña"
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="Mínimo 6 caracteres"
            autocomplete="new-password"
            required
            hint="Usa una contraseña segura"
          />

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 rounded p-4 text-sm">
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}
          {mensaje && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 rounded p-4 text-sm">
              <strong>✅ {mensaje}</strong>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-gradient-to-r from-candas-rojo to-candas-rojoOscuro text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {cargando ? "🔄 Creando cuenta..." : "✓ Crear cuenta"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-candas-rojo font-bold hover:underline">
              Entra aquí
            </Link>
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-6">
        ¡Vamos Canijo! 🔴⚪ · Datos protegidos
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autocomplete,
  hint,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autocomplete?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        autoComplete={autocomplete}
        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-candas-rojo focus:ring-1 focus:ring-candas-rojo transition bg-gray-50 hover:bg-white"
      />
      {hint && <p className="text-xs text-gray-500 mt-1">💡 {hint}</p>}
    </div>
  );
}
