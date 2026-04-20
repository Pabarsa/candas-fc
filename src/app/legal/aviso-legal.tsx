import Link from "next/link";

export const metadata = {
  title: "Aviso Legal — La Peña Canijo",
};

export default function AvisoLegalPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-candas-rojo text-sm hover:underline">← Volver al inicio</Link>
      </div>

      <h1 className="text-3xl font-black mb-2">Aviso Legal</h1>
      <p className="text-gray-500 text-sm mb-8">Última actualización: abril de 2026</p>

      <div className="prose prose-gray max-w-none space-y-6 text-sm leading-relaxed text-gray-700">

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">1. Identificación del titular</h2>
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
            Sociedad de la Información y Comercio Electrónico (LSSI-CE), se informa:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Titular:</strong> Pablo Aramendi Sánchez</li>
            <li><strong>Domicilio:</strong> Candás, Carreño, Asturias</li>
            <li><strong>Correo electrónico:</strong> pablo.aramendi.sanchez@outlook.com</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">2. Objeto y naturaleza del sitio</h2>
          <p>
            <strong>La Peña Canijo</strong> es una web de aficionados no oficial del Candás CF,
            creada con fines informativos y de comunidad para los seguidores del equipo.
            No tiene relación oficial con el Candás CF ni con ninguna federación deportiva.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">3. Propiedad intelectual</h2>
          <p>
            Los contenidos de esta web (textos, imágenes, logotipos) son propiedad de sus
            respectivos autores. Las fotografías publicadas en la Galería pertenecen a sus
            autoras, quienes ceden su uso con fines no comerciales a esta web. Queda prohibida
            su reproducción comercial sin autorización expresa.
          </p>
          <p className="mt-2">
            El escudo y nombre del Candás CF son marcas registradas de dicho club.
            Su uso en esta web es meramente referencial y sin ánimo de lucro.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">4. Responsabilidad</h2>
          <p>
            El titular no se responsabiliza de los contenidos publicados por los usuarios
            en el chat de abonados ni en el tablón de viajes. Cada usuario es responsable
            de sus propias publicaciones.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">5. Ley aplicable y jurisdicción</h2>
          <p>
            Este aviso legal se rige por la legislación española. Para cualquier controversia
            derivada del uso de este sitio web, las partes se someten a los Juzgados y
            Tribunales de Gijón (Asturias), renunciando a cualquier otro fuero que pudiera
            corresponderles.
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 flex gap-6 text-sm">
        <Link href="/legal/privacidad" className="text-candas-rojo hover:underline">Política de Privacidad</Link>
        <Link href="/legal/cookies" className="text-candas-rojo hover:underline">Política de Cookies</Link>
      </div>
    </div>
  );
}
