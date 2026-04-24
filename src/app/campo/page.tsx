import Link from "next/link";
import GaleriaPublica from "@/components/GaleriaPublica";

export const metadata = {
  title: "El Campo — Fondo Sur Canijo",
  description: "Campo de La Mata, estadio del Candás CF desde 1948.",
};

const FOTOS_CAMPO = [
  { id: 1, titulo: "Panorámica desde la tribuna",  descripcion: null, foto_url: "/campo/foto5.jpg", instagram_fotografa: null, created_at: "" },
  { id: 2, titulo: "Tribuna principal",             descripcion: null, foto_url: "/campo/foto1.jpg", instagram_fotografa: null, created_at: "" },
  { id: 3, titulo: "Vista desde la tribuna",        descripcion: null, foto_url: "/campo/foto3.jpg", instagram_fotografa: null, created_at: "" },
  { id: 4, titulo: "Gradería lateral",              descripcion: null, foto_url: "/campo/foto4.jpg", instagram_fotografa: null, created_at: "" },
  { id: 5, titulo: "El césped",                     descripcion: null, foto_url: "/campo/foto2.jpg", instagram_fotografa: null, created_at: "" },
  { id: 6, titulo: "Atardecer en La Mata",          descripcion: null, foto_url: "/campo/foto6.jpg", instagram_fotografa: null, created_at: "" },
  { id: 7, titulo: "Día de partido",                descripcion: null, foto_url: "/campo/foto7.jpg", instagram_fotografa: null, created_at: "" },
  { id: 8, titulo: "La tribuna",                    descripcion: null, foto_url: "/campo/foto8.jpg", instagram_fotografa: null, created_at: "" },
  { id: 9, titulo: "Esquina del campo",             descripcion: null, foto_url: "/campo/foto9.jpg", instagram_fotografa: null, created_at: "" },
];

export default function CampoPage() {
  return (
    <div className="bg-site">

      {/* HERO */}
      <section className="relative h-[55vh] min-h-[360px] overflow-hidden">
        <img src="/campo/foto5.jpg" alt="Campo de La Mata" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-site" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 max-w-6xl mx-auto">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Estadio</p>
          <h1 className="font-poppins font-black text-4xl md:text-5xl text-white mb-1">Campo de La Mata</h1>
          <p className="text-white/50 text-base">La casa del Candás CF desde 1948</p>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { label: "Fundación",    valor: "1948" },
              { label: "Localización", valor: "Candás, Asturias" },
              { label: "Superficie",   valor: "Hierba natural" },
              { label: "Competición",  valor: "2ª Asturfútbol" },
            ].map((d) => (
              <div key={d.label}>
                <p className="font-poppins font-black text-xl md:text-2xl text-white">{d.valor}</p>
                <p className="text-white/30 text-xs mt-1 uppercase tracking-wide">{d.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-10 sm:py-14">

        {/* TEXTO + FOTO */}
        <section className="mb-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-4">Nuestro estadio</p>
            <p className="text-white/60 leading-relaxed mb-4">
              El campo de <strong className="text-white">La Mata</strong> es el hogar del Candás CF, equipo fundado en 1948
              en el concejo de Carreño, Asturias. Con tribuna cubierta, instalaciones renovadas
              y un césped natural en perfectas condiciones, es uno de los campos más cuidados
              de la Segunda Asturfútbol.
            </p>
            <p className="text-white/60 leading-relaxed mb-8">
              Cada jornada, la afición rojiblanca llena las gradas para apoyar al equipo en
              su camino hacia el playoff de ascenso. El Fondo Sur Canijo, desde detrás de
              la portería, siempre al lado del equipo.
            </p>
            <Link
              href="/clasificacion"
              className="btn-primary inline-block bg-candas-rojo text-white font-bold px-6 py-3 rounded-xl hover:bg-candas-rojoOscuro transition text-sm"
            >
              Ver clasificación
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden aspect-video border border-white/5">
            <img src="/campo/foto1.jpg" alt="Tribuna de La Mata" className="w-full h-full object-cover" />
          </div>
        </section>

        {/* CÓMO LLEGAR */}
        <section className="mb-14">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-6">Cómo llegar</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                title: "En coche",
                text: "Desde Gijón por la AS-19 dirección Avilés, salida Candás. El campo está señalizado desde el centro.",
              },
              {
                title: "En autobús",
                text: "ALSA conecta Gijón y Avilés con Candás. Parada en el centro, 10 minutos a pie hasta La Mata.",
              },
              {
                title: "Dirección",
                text: "Campo de La Mata, Candás, Carreño, Asturias.",
                link: { href: "https://maps.google.com/?q=Campo+La+Mata+Candas+Asturias", label: "Ver en Google Maps →" },
              },
            ].map((item) => (
              <div key={item.title} className="card-dark rounded-2xl p-5">
                <p className="font-semibold text-white text-sm mb-2">{item.title}</p>
                <p className="text-white/40 text-sm leading-relaxed">{item.text}</p>
                {item.link && (
                  <a href={item.link.href} target="_blank" rel="noopener noreferrer"
                    className="text-candas-rojo text-sm font-semibold hover:text-white transition-colors mt-2 inline-block">
                    {item.link.label}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* GALERÍA */}
        <section>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-6">Galería de instalaciones</p>
          <GaleriaPublica fotos={FOTOS_CAMPO} titulo={true} />
        </section>
      </div>
    </div>
  );
}