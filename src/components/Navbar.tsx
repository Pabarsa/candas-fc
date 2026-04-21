"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const cargar = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error al obtener usuario:", error);
          setUser(null);
          setRol(null);
          return;
        }

        setUser(user);
        if (user) {
          const { data, error: profileError } = await supabase
            .from("profiles")
            .select("rol")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.error("Error al obtener perfil:", profileError);
            setRol(null);
          } else {
            setRol(data?.rol ?? null);
          }
        } else {
          setRol(null);
        }
      } catch (error) {
        console.error("Error en cargar usuario:", error);
        setUser(null);
        setRol(null);
      }
    };

    cargar();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session?.user?.id);
      cargar();
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRol(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Forzar recarga de la página si hay error
      window.location.href = "/";
    }
  };

  const link = (href: string, label: string) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition ${
        pathname === href ? "bg-white/20" : "hover:bg-white/10"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="bg-candas-rojo text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-bold text-xl hover:opacity-90 transition">
          <div className="w-10 h-10 flex-shrink-0">
            <Image
              src="/630.png"
              alt="Candás CF"
              width={40}
              height={40}
              priority
            />
          </div>
          <span className="hidden sm:inline">Fondo Sur Canijo</span>
        </Link>

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
          </svg>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {link("/", "Inicio")}
          {link("/clasificacion", "Clasificación")}
          {link("/fotos", "Fotos")}
          {link("/campo", "El Campo")}
          {link("/equipo", "Equipo")}
          {user && link("/simulador", "Simulador")}
          {user && link("/abonados", "Abonados")}
          {rol === "admin" && link("/admin", "Admin")}
          {user ? (
            <button
              onClick={logout}
              className="ml-2 px-3 py-2 rounded-md text-sm font-medium bg-white text-candas-rojo hover:bg-candas-crema"
            >
              Salir
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-2 px-3 py-2 rounded-md text-sm font-medium bg-white text-candas-rojo hover:bg-candas-crema"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>

      {open && (
        <nav className="md:hidden px-4 pb-3 flex flex-col gap-1">
          {link("/", "Inicio")}
          {link("/clasificacion", "Clasificación")}
          {link("/fotos", "Fotos")}
          {link("/campo", "El Campo")}
          {link("/equipo", "Equipo")}
          {user && link("/simulador", "Simulador")}
          {user && link("/abonados", "Abonados")}
          {rol === "admin" && link("/admin", "Admin")}
          {user ? (
            <button
              onClick={logout}
              className="text-left px-3 py-2 rounded-md text-sm font-medium bg-white text-candas-rojo"
            >
              Salir
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium bg-white text-candas-rojo"
            >
              Entrar
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}