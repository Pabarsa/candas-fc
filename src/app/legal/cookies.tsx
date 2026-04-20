import Link from "next/link";

export const metadata = {
  title: "Política de Cookies — Fondo Sur Canijo",
};

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-candas-rojo text-sm hover:underline">← Volver al inicio</Link>
      </div>

      <h1 className="text-3xl font-black mb-2">Política de Cookies</h1>
      <p className="text-gray-500 text-sm mb-8">Última actualización: abril de 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-gray-700">

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que los sitios web almacenan en tu
            dispositivo cuando los visitas. Permiten que el sitio recuerde tus preferencias
            y que tu sesión se mantenga activa entre visitas.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Cookies que usamos</h2>
          <div className="overflow-x-auto mt-2">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-3 py-2 text-left">Nombre</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Tipo</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Finalidad</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Duración</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Proveedor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-3 py-2 font-mono">sb-*-auth-token</td>
                  <td className="border border-gray-200 px-3 py-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">Técnica</span>
                  </td>
                  <td className="border border-gray-200 px-3 py-2">Mantener la sesión de usuario iniciada</td>
                  <td className="border border-gray-200 px-3 py-2">Sesión / 1 semana</td>
                  <td className="border border-gray-200 px-3 py-2">Supabase</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-3 py-2 font-mono">cookie-consent</td>
                  <td className="border border-gray-200 px-3 py-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">Técnica</span>
                  </td>
                  <td className="border border-gray-200 px-3 py-2">Recordar tu preferencia sobre cookies</td>
                  <td className="border border-gray-200 px-3 py-2">1 año</td>
                  <td className="border border-gray-200 px-3 py-2">Fondo Sur Canijo</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            ℹ️ No usamos cookies de publicidad, rastreo de terceros ni redes sociales.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Cookies técnicas (exentas de consentimiento)</h2>
          <p>
            Las cookies de sesión de Supabase son <strong>estrictamente necesarias</strong>
            para que puedas iniciar sesión y acceder a la zona de abonados. Sin ellas,
            la web no funciona correctamente. Según el artículo 22.2 de la LSSI-CE,
            las cookies técnicas no requieren tu consentimiento previo.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Cómo gestionar o eliminar cookies</h2>
          <p>
            Puedes configurar tu navegador para bloquear o eliminar cookies en cualquier momento.
            Ten en cuenta que si eliminas las cookies de sesión, tendrás que volver a iniciar sesión.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-candas-rojo underline">
                Google Chrome
              </a>
            </li>
            <li>
              <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-candas-rojo underline">
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-candas-rojo underline">
                Safari
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Más información</h2>
          <p>
            Para cualquier consulta sobre el uso de cookies, puedes contactarnos en{" "}
            <strong>pablo.aramendi.sanchez@outlook.com</strong>. También puedes consultar la guía sobre cookies de la{" "}
            <a href="https://www.aepd.es/guias/guia-cookies.pdf" target="_blank" rel="noopener noreferrer" className="text-candas-rojo underline">
              AEPD
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 flex gap-6 text-sm">
        <Link href="/legal/aviso-legal" className="text-candas-rojo hover:underline">Aviso Legal</Link>
        <Link href="/legal/privacidad" className="text-candas-rojo hover:underline">Política de Privacidad</Link>
      </div>
    </div>
  );
}
