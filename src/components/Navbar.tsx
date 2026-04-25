"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";

const supabase = createClient();

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Obtener sesión inicial desde cookies (sin red)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase.from("profiles").select("rol").eq("id", session.user.id).single()
          .then(({ data }) => setRol(data?.rol ?? null));
      }
    });

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase.from("profiles").select("rol").eq("id", session.user.id).single()
          .then(({ data }) => setRol(data?.rol ?? null));
      } else {
        setRol(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const links = [
    { href: "/",              label: "Inicio" },
    { href: "/clasificacion", label: "Clasificación" },
    { href: "/fotos",         label: "Fotos" },
    { href: "/directo",       label: "Directo" },
    { href: "/campo",         label: "El Campo" },
    { href: "/equipo",        label: "Equipo" },
    ...(user ? [
      { href: "/simulador", label: "Simulador" },
      { href: "/abonados",  label: "Mi zona" },
    ] : []),
    ...(rol === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "bg-black/95 backdrop-blur-md border-b border-white/5"
          : "bg-gradient-to-b from-black/70 to-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 h-14 sm:h-16 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-200 group-hover:scale-105">
              <Image src="/630.png" alt="Candás CF" width={32} height={32} priority />
            </div>
            <span className="font-poppins font-bold text-white text-sm tracking-tight hidden sm:inline">
              Fondo Sur Canijo
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {links.map(({ href, label }) => (
              <Link key={href} href={href}
                className={`text-sm font-medium transition-colors duration-200 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)] ${
                  pathname === href ? "text-white" : "text-white/80 hover:text-white"
                }`}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={logout}
                className="hidden md:block text-sm font-medium text-white/80 hover:text-white transition-colors duration-200 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
                Salir
              </button>
            ) : (
              <Link href="/login"
                className="hidden md:block text-sm font-medium px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all duration-200 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
                Entrar
              </Link>
            )}

            <button
              className="md:hidden flex items-center justify-center w-9 h-9 text-white/70 hover:text-white transition-colors"
              onClick={() => setOpen(!open)} aria-label="Menú">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {open
                  ? <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
                  : <><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></>
                }
              </svg>
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/98 backdrop-blur-md flex flex-col pt-14">
          <nav className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-1">
            {links.map(({ href, label }) => (
              <Link key={href} href={href}
                className={`py-3.5 text-lg font-semibold border-b border-white/5 transition-colors duration-200 ${
                  pathname === href ? "text-white" : "text-white/40"
                }`}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="px-6 py-8 border-t border-white/5">
            {user ? (
              <button onClick={logout}
                className="w-full py-3.5 text-sm text-white/30 hover:text-white transition-colors text-left">
                Cerrar sesión
              </button>
            ) : (
              <Link href="/login"
                className="block w-full py-3.5 text-center bg-candas-rojo text-white font-bold rounded-xl text-sm">
                Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}