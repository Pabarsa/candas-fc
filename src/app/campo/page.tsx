import Image from "next/image";
import Link from "next/link";
import GaleriaPublica from "@/components/GaleriaPublica";

export const metadata = {
  title: "El Campo — Fondo Sur Canijo",
  description: "Campo de La Mata, estadio del Candás CF. Conoce las instalaciones del equipo rojiblanco.",
};

const FOTOS_CAMPO = [
  { id: 1, titulo: "Panorámica desde la tribuna", descripcion: null, foto_url: "/campo/foto5.jpg", instagram_fotografa: null, created_at: "" },
  { id: 2, titulo: "Tribuna principal", descripcion: null, foto_url: "/campo/foto1.jpg", instagram_fotografa: null, created_at: "" },
  { id: 3, titulo: "Vista desde la tribuna", descripcion: null, foto_url: "/campo/foto3.jpg", instagram_fotografa: null, created_at: "" },
  { id: 4, titulo: "Gradería lateral", descripcion: null, foto_url: "/campo/foto4.jpg", instagram_fotografa: null, created_at: "" },
  { id: 5, titulo: "El césped", descripcion: null, foto_url: "/campo/foto2.jpg", instagram_fotografa: null, created_at: "" },
  { id: 6, titulo: "Atardecer en La Mata", descripcion: null, foto_url: "/campo/foto6.jpg", instagram_fotografa: null, created_at: "" },
  { id: 7, titulo: "Día de partido", descripcion: null, foto_url: "/campo/foto7.jpg", instagram_fotografa: null, created_at: "" },
  { id: 8, titulo: "La tribuna", descripcion: null, foto_url: "/campo/foto8.jpg", instagram_fotografa: null, created_at: "" },
  { id: 9, titulo: "Esquina del campo", descripcion: null, foto_url: "/campo/foto9.jpg", instagram_fotografa: null, created_at: "" },
];

export default function CampoPage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative h-[50vh] min-h-[340px] overflow-hidden">
        <img
          src="/campo/foto5.jpg"
          alt="Campo de La Mata"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 py-8 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-lg">
            Campo de La Mata
          </h1>
          <p className="text-white/80 text-lg">
            La casa del Candás CF desde 1948
          </p>
        </div>
      </section>

      {/* DATOS */}
      <section className="bg-candas-negro text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { label: "Fundación", valor: "1948" },
              { label: "Localización", valor: "Candás, Asturias" },
              { label: "Superficie", valor: "Hierba natural" },
              { label: "Competición", valor: "2ª Asturfútbol" },
            ].map((d) => (
              <div key={d.label}>
                <p className="text-2xl font-black text-white">{d.valor}</p>
                <p className="text-white/50 text-xs mt-0.5">{d.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* TEXTO */}
        <section className="mb-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-black mb-3">Nuestro estadio</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              El campo de <strong>La Mata</strong> es el hogar del Candás CF, equipo fundado en 1948
              en el concejo de Carreño, Asturias. Con tribuna cubierta, instalaciones renovadas
              y un césped natural en perfectas condiciones, es uno de los campos más cuidados
              de la Segunda Asturfútbol.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Cada jornada, la afición rojiblanca llena las gradas para apoyar al equipo en
              su camino hacia el playoff de ascenso. El Fondo Sur Canijo, desde detrás de
              la portería, siempre al lado del equipo.
            </p>
            <Link
              href="/clasificacion"
              className="inline-block bg-candas-rojo text-white font-bold px-6 py-2.5 rounded-xl hover:bg-candas-rojoOscuro transition text-sm"
            >
              📊 Ver clasificación
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-video">
            <img
              src="/campo/foto1.jpg"
              alt="Tribuna de La Mata"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* CÓMO LLEGAR */}
        <section className="mb-10 bg-candas-crema rounded-2xl p-6 border border-red-100">
          <h2 className="text-xl font-black mb-3">📍 Cómo llegar</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-bold mb-1">🚗 En coche</p>
              <p className="text-gray-600">Desde Gijón por la AS-19 dirección Avilés, salida Candás. El campo está señalizado desde el centro.</p>
            </div>
            <div>
              <p className="font-bold mb-1">🚌 En autobús</p>
              <p className="text-gray-600">ALSA conecta Gijón y Avilés con Candás. Parada en el centro, 10 minutos a pie hasta La Mata.</p>
            </div>
            <div>
              <p className="font-bold mb-1">📌 Dirección</p>
              <p className="text-gray-600">Campo de La Mata, Candás, Carreño, Asturias.</p>
              <a
                href="https://maps.google.com/?q=Campo+La+Mata+Candas+Asturias"
                target="_blank"
                rel="noopener noreferrer"
                className="text-candas-rojo font-bold hover:underline mt-1 inline-block"
              >
                Ver en Google Maps →
              </a>
            </div>
          </div>
        </section>

        {/* GALERÍA */}
        <section>
          <h2 className="text-2xl font-black mb-2">Galería de instalaciones</h2>
          <GaleriaPublica fotos={FOTOS_CAMPO} titulo={true} />
        </section>
      </div>
    </div>
  );
}