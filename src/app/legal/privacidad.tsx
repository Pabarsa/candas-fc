import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad — Fondo Sur Canijo",
};

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-candas-rojo text-sm hover:underline">← Volver al inicio</Link>
      </div>

      <h1 className="text-3xl font-black mb-2">Política de Privacidad</h1>
      <p className="text-gray-500 text-sm mb-8">Última actualización: abril de 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-gray-700">

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">1. Responsable del tratamiento</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Responsable:</strong> Pablo Aramendi Sánchez</li>
            <li><strong>Correo de contacto:</strong> pablo.aramendi.sanchez@outlook.com</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">2. Datos que recogemos</h2>
          <p>Al registrarte en Fondo Sur Canijo, recogemos:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Nombre completo</strong> — para identificarte en el chat y la zona de abonados.</li>
            <li><strong>Correo electrónico</strong> — para el inicio de sesión y comunicaciones relacionadas con la cuenta.</li>
            <li><strong>Contraseña</strong> — almacenada de forma segura y encriptada (nunca en texto plano).</li>
          </ul>
          <p className="mt-2">
            No recogemos datos de pago, tarjetas de crédito ni información sensible adicional.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">3. Finalidad y base jurídica</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs mt-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-3 py-2 text-left">Finalidad</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Base jurídica (RGPD)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-3 py-2">Gestión de la cuenta de usuario</td>
                  <td className="border border-gray-200 px-3 py-2">Ejecución de contrato (art. 6.1.b)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-3 py-2">Acceso a la zona de abonados y galería</td>
                  <td className="border border-gray-200 px-3 py-2">Ejecución de contrato (art. 6.1.b)</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-3 py-2">Envío de email de confirmación</td>
                  <td className="border border-gray-200 px-3 py-2">Interés legítimo (art. 6.1.f)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">4. Encargados del tratamiento (terceros)</h2>
          <p>Utilizamos los siguientes servicios de terceros que pueden procesar tus datos:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Supabase Inc.</strong> (EE.UU.) — base de datos y autenticación. Datos almacenados
              en servidores de AWS en Europa (eu-west-1, Irlanda). Cumple con el RGPD mediante
              cláusulas contractuales estándar (SCCs).
            </li>
            <li>
              <strong>Vercel Inc.</strong> (EE.UU.) — alojamiento web. Cumple con el RGPD mediante SCCs.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">5. Conservación de datos</h2>
          <p>
            Tus datos se conservan mientras mantengas la cuenta activa. Si solicitas la baja,
            eliminamos tu cuenta y todos tus datos personales en un plazo máximo de 30 días,
            salvo que exista obligación legal de conservarlos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">6. Tus derechos</h2>
          <p>En virtud del RGPD y la LOPDGDD tienes derecho a:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Acceso</strong> — saber qué datos tenemos sobre ti.</li>
            <li><strong>Rectificación</strong> — corregir datos incorrectos.</li>
            <li><strong>Supresión</strong> ("derecho al olvido") — solicitar el borrado de tu cuenta.</li>
            <li><strong>Portabilidad</strong> — recibir tus datos en formato legible.</li>
            <li><strong>Oposición y limitación</strong> — oponerte a determinados tratamientos.</li>
          </ul>
          <p className="mt-2">
            Puedes ejercer estos derechos enviando un email a{" "}
            <strong>pablo.aramendi.sanchez@outlook.com</strong> con el asunto "Protección de datos".
            También puedes reclamar ante la{" "}
            <a
              href="https://www.aepd.es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-candas-rojo underline"
            >
              Agencia Española de Protección de Datos (AEPD)
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">7. Menores de edad</h2>
          <p>
            Esta web no está dirigida a menores de 14 años. Si eres menor de 14 años,
            necesitas el consentimiento de tu padre, madre o tutor legal para registrarte.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">8. Cambios en esta política</h2>
          <p>
            Nos reservamos el derecho a actualizar esta política. Te notificaremos cambios
            relevantes por email. La fecha de la última actualización siempre estará visible
            en la cabecera de este documento.
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 flex gap-6 text-sm">
        <Link href="/legal/aviso-legal" className="text-candas-rojo hover:underline">Aviso Legal</Link>
        <Link href="/legal/cookies" className="text-candas-rojo hover:underline">Política de Cookies</Link>
      </div>
    </div>
  );
}
