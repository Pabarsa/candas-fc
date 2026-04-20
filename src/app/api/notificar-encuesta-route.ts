import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();

    // Verificar que quien llama es admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data: perfil } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", user.id)
      .single();

    if (perfil?.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { titulo, encuestaId } = await req.json();

    // Obtener todos los emails de abonados
    const { data: perfiles } = await supabase
      .from("profiles")
      .select("id, nombre")
      .in("rol", ["abonado", "admin"]);

    if (!perfiles || perfiles.length === 0) {
      return NextResponse.json({ enviados: 0 });
    }

    // Obtener emails de auth.users para esos ids
    const ids = perfiles.map((p) => p.id);
    const { data: usuarios } = await supabase
      .rpc("get_emails_by_ids", { user_ids: ids });

    const emails = (usuarios ?? []) as { id: string; email: string }[];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fondosurcanijo.com";

    // Enviar emails
    let enviados = 0;
    for (const u of emails) {
      const perfil = perfiles.find((p) => p.id === u.id);
      const nombre = perfil?.nombre ?? "abonado";

      await resend.emails.send({
        from: "Fondo Sur Canijo <noreply@fondosurcanijo.com>",
        to: u.email,
        subject: `🗳️ ${titulo} — ¡Vota ahora!`,
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head><meta charset="UTF-8"></head>
          <body style="font-family: system-ui, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
            <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #c1121f, #8b0a17); padding: 32px 24px; text-align: center;">
                <p style="color: white; font-size: 32px; margin: 0 0 8px;">🔴⚪</p>
                <h1 style="color: white; font-size: 22px; font-weight: 900; margin: 0;">Fondo Sur Canijo</h1>
                <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 6px 0 0;">¡Vamos Canijo!</p>
              </div>

              <!-- Body -->
              <div style="padding: 32px 24px;">
                <p style="color: #666; font-size: 14px; margin: 0 0 16px;">Hola <strong>${nombre}</strong> 👋</p>
                <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 900; margin: 0 0 12px;">${titulo}</h2>
                <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                  ¡Ya puedes votar al mejor jugador del partido! Entra en la zona de abonados y elige tu candidato. Solo tienes 48 horas.
                </p>
                <a href="${siteUrl}/abonados" 
                   style="display: inline-block; background: #c1121f; color: white; font-weight: 900; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none;">
                  🗳️ Votar ahora
                </a>
              </div>

              <!-- Footer -->
              <div style="background: #f9f9f9; padding: 16px 24px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #999; font-size: 11px; margin: 0;">
                  Recibes este email porque eres abonado del Fondo Sur Canijo.<br>
                  <a href="${siteUrl}" style="color: #c1121f;">fondosurcanijo.com</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      enviados++;
    }

    return NextResponse.json({ enviados });
  } catch (error: any) {
    console.error("Error enviando emails:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
