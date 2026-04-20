"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const aceptar = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const rechazar = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 text-sm leading-relaxed">
          <p className="font-bold mb-1">🍪 Usamos cookies</p>
          <p className="text-white/70">
            Esta web usa cookies técnicas necesarias para el inicio de sesión y cookies de análisis anónimo.
            Consulta nuestra{" "}
            <Link href="/legal/cookies" className="underline text-white hover:text-candas-crema">
              Política de Cookies
            </Link>{" "}
            y{" "}
            <Link href="/legal/privacidad" className="underline text-white hover:text-candas-crema">
              Privacidad
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={rechazar}
            className="px-4 py-2 rounded-lg border border-white/30 text-sm font-medium hover:bg-white/10 transition"
          >
            Solo necesarias
          </button>
          <button
            onClick={aceptar}
            className="px-4 py-2 rounded-lg bg-candas-rojo text-white text-sm font-bold hover:bg-candas-rojoOscuro transition"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
