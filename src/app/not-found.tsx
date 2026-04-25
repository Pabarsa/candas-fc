import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">

      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-candas-rojo/10 animate-ping" />
        <Image src="/630.png" alt="Candás CF" width={80} height={80}
          className="relative drop-shadow-lg opacity-70" />
      </div>

      <div className="relative mb-4">
        <p className="text-[8rem] font-black leading-none text-white/5 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
          404
        </p>
        <p className="text-6xl sm:text-7xl font-poppins font-black text-candas-rojo relative">404</p>
      </div>

      <h1 className="text-2xl sm:text-3xl font-poppins font-black text-white mb-2">
        Fuera de juego
      </h1>
      <p className="text-white/40 mb-1 text-sm">
        Esta página no existe o fue al vestuario antes de tiempo.
      </p>
      <p className="text-white/20 text-sm mb-10">fondosurcanijo.com</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/"
          className="bg-candas-rojo text-white font-bold px-6 py-3 rounded-xl hover:bg-candas-rojoOscuro transition text-sm">
          Volver al inicio
        </Link>
        <Link href="/clasificacion"
          className="border border-white/10 text-white/60 hover:text-white font-bold px-6 py-3 rounded-xl hover:border-white/20 transition text-sm">
          Ver clasificación
        </Link>
      </div>
    </div>
  );
}