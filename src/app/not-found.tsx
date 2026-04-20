import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">

      {/* Escudo con animación */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-candas-rojo/10 animate-ping" />
        <Image
          src="/630.png"
          alt="Candás CF"
          width={100}
          height={100}
          className="relative drop-shadow-lg opacity-80"
        />
      </div>

      {/* Número 404 */}
      <div className="relative mb-2">
        <p className="text-[9rem] font-black leading-none text-candas-rojo/10 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
          404
        </p>
        <p className="text-7xl font-black text-candas-rojo relative">404</p>
      </div>

      {/* Mensaje */}
      <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
        ¡Fuera de juego!
      </h1>
      <p className="text-gray-500 mb-1">
        Esta página no existe o fue al vestuario antes de tiempo.
      </p>
      <p className="text-candas-rojo font-bold mb-8">¡Vamos Canijo! 🔴⚪</p>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="bg-candas-rojo text-white font-bold px-6 py-3 rounded-xl hover:bg-candas-rojoOscuro transition shadow-md"
        >
          🏠 Volver al inicio
        </Link>
        <Link
          href="/clasificacion"
          className="border-2 border-candas-rojo text-candas-rojo font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition"
        >
          📊 Ver clasificación
        </Link>
      </div>
    </div>
  );
}
