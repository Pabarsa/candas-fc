import Link from "next/link";
import Image from "next/image";
import ProximosPartidos from "@/components/ProximosPartidos";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-candas-rojo to-candas-rojoOscuro text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-40">
              <Image
                src="/630.png"
                alt="Escudo Candás CF"
                width={128}
                height={160}
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4">Candás CF</h1>
          <p className="text-xl md:text-2xl opacity-90 mb-2">
            Segunda Asturfútbol · Grupo 1
          </p>
          <p className="text-base opacity-80 max-w-xl mx-auto mb-2">
            La web hecha por aficionados, para aficionados. Sigue la clasificación,
            simula el final de liga y queda con otros abonados para ir juntos al campo.
          </p>
          <p className="text-lg font-black opacity-90 mb-8 tracking-wide">
            ¡Vamos Canijo! 🔴⚪
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/clasificacion"
              className="bg-white text-candas-rojo font-bold px-6 py-3 rounded-lg hover:bg-candas-crema transition"
            >
              Ver clasificación
            </Link>
            {user ? (
              <>
                <Link
                  href="/simulador"
                  className="bg-candas-negro text-white font-bold px-6 py-3 rounded-lg hover:bg-black transition"
                >
                  Simular liga
                </Link>
                <Link
                  href="/abonados"
                  className="border-2 border-white font-bold px-6 py-3 rounded-lg hover:bg-white hover:text-candas-rojo transition"
                >
                  Zona socios
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-candas-negro text-white font-bold px-6 py-3 rounded-lg hover:bg-black transition"
              >
                Entrar como socio
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-black text-center mb-10">
          Todo lo que puedes hacer aquí
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card
            title="📊 Clasificación en directo"
            desc="La tabla de Segunda Asturfútbol Grupo 1 actualizada. Marcados los puestos de ascenso directo, play-off y descenso."
            href="/clasificacion"
          />
          {user ? (
            <>
              <Card
                title="🔮 Simulador"
                desc="Mete los resultados de las jornadas que faltan y ve en qué puesto termina el Candás. Puntos, diferencia de goles y ordenación igual que la oficial."
                href="/simulador"
              />
              <Card
                title="🚗 Coche compartido"
                desc="Chat en vivo y un tablón para organizar desplazamientos entre abonados. ¡Que no falte nadie en La Mata!"
                href="/abonados"
              />
            </>
          ) : (
            <>
              <LockedCard
                title="🔮 Simulador"
                desc="Mete los resultados de las jornadas que faltan y ve en qué puesto termina el Candás."
              />
              <LockedCard
                title="🚗 Coche compartido"
                desc="Chat en vivo y tablón para organizar desplazamientos entre abonados."
              />
            </>
          )}
        </div>
        {!user && (
          <p className="text-center text-sm text-gray-500 mt-6">
            🔒 El simulador y la zona de abonados requieren{" "}
            <Link href="/login" className="text-candas-rojo font-semibold hover:underline">
              iniciar sesión
            </Link>
            . ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-candas-rojo font-semibold hover:underline">
              Regístrate gratis
            </Link>
            .
          </p>
        )}
      </section>

      {/* PRÓXIMOS PARTIDOS */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <ProximosPartidos />
      </section>

      {/* HISTORIA */}
      <section className="bg-candas-crema">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-black mb-4">Desde 1948</h2>
          <p className="text-lg text-gray-700">
            El Candás Club de Fútbol se fundó en 1948 y juega sus partidos en el
            campo de <strong>La Mata</strong>, con capacidad para unos 3.000
            espectadores. Esta web es una iniciativa de la afición, sin ánimo de
            lucro, para seguir de cerca la temporada del equipo rojiblanco.
          </p>
        </div>
      </section>
    </div>
  );
}

function Card({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-xl p-6 shadow hover:shadow-xl hover:-translate-y-1 transition border border-gray-100"
    >
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </Link>
  );
}

function LockedCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Link
      href="/login"
      className="block bg-white rounded-xl p-6 shadow hover:shadow-xl hover:-translate-y-1 transition border border-gray-100 opacity-75"
    >
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 mb-3">{desc}</p>
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-candas-rojo bg-red-50 px-2 py-1 rounded-full">
        🔒 Inicia sesión para acceder
      </span>
    </Link>
  );
}
