# ⚽ Candás CF — Web de aficionados

Web de aficionados del **Candás CF** (Segunda Asturfútbol Grupo 1) con:

- 🏠 **Home** con presentación del equipo.
- 📊 **Clasificación** en tiempo real con los partidos jugados por el admin.
- 🔮 **Simulador**: mete los resultados de las jornadas pendientes y mira en qué puesto acaba el Candás.
- 🔐 **Zona de abonados** (solo logueados con carnet):
  - 💬 Chat en vivo para quedar y hablar.
  - 🚗 Tablón de viajes compartidos al campo.
- 🛠️ **Panel de admin** para meter resultados, crear jornadas y gestionar equipos.

Hecho con **Next.js 14** (App Router) + **Supabase** (auth + DB + Realtime) + **Tailwind**. Despliegue en **Vercel**.

> 📸 **La web arranca con la tabla real tras la jornada 30 (temporada 25/26)**. El SQL incluye los 18 equipos del Grupo 1 con sus estadísticas actuales (PJ, G, E, P, GF, GC). A medida que se jueguen las jornadas 31, 32, 33 y 34, el admin solo tiene que meter los nuevos resultados desde `/admin` y la tabla se actualizará sola. Para simular las jornadas que quedan, mete las parejas pendientes también en `/admin` y úsalas en `/simulador`.

---

## 🚀 Guía rápida de despliegue (paso a paso)

### 1. Prepara tu máquina

Necesitas tener instalado:

- [Node.js 18+](https://nodejs.org)
- [Git](https://git-scm.com)
- Cuenta en [GitHub](https://github.com), [Supabase](https://supabase.com) y [Vercel](https://vercel.com) (todo gratis).

### 2. Descomprime este proyecto

Pon la carpeta `candas-fc/` donde quieras. Abre una terminal dentro:

```bash
cd candas-fc
npm install
```

### 3. Crea el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) → **New Project**.
2. Dale un nombre (por ejemplo `candas-fc`), elige región **West EU (Ireland)** y ponle una contraseña a la base de datos (guárdala).
3. Espera ~2 minutos a que se cree.
4. En el menú izquierdo, entra en **SQL Editor → New query**.
5. **Copia TODO el contenido del archivo `supabase/schema.sql`** de este proyecto y pégalo. Dale a **Run**. Esto crea todas las tablas, políticas de seguridad y precarga los equipos.
6. Ve a **Database → Replication** y activa la publicación `supabase_realtime` para la tabla **`mensajes`** (el SQL ya lo intenta pero conviene confirmarlo para que el chat funcione en vivo).

### 4. Copia tus credenciales de Supabase

1. En Supabase ve a **Project Settings → API**.
2. Copia:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **anon public key**

3. En el proyecto, copia `.env.local.example` como `.env.local`:

```bash
cp .env.local.example .env.local
```

4. Edita `.env.local` y pon tus valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 5. Prueba en local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Todo debería funcionar menos la parte de abonados, que requiere registrarse.

### 6. Regístrate y conviértete en admin

1. En [http://localhost:3000/registro](http://localhost:3000/registro) crea tu cuenta con nombre, número de carnet, email y contraseña.
2. Supabase te envía un email de confirmación. Ábrelo y haz clic.
   - ⚠️ Si no llega: en Supabase ve a **Authentication → Providers → Email** y desactiva "Confirm email" para desarrollo.
3. Para convertirte en **admin**, en Supabase → **SQL Editor** ejecuta:

```sql
update public.profiles set rol = 'admin' where carnet = 'TU_NUMERO_DE_CARNET';
```

4. Cierra sesión y vuelve a entrar. Ya verás el botón **Admin** en la barra.
5. En `/admin` empieza a crear partidos (jornada, local, visitante) y a meter resultados.

### 7. Sube el repo a GitHub

```bash
cd candas-fc
git init
git add .
git commit -m "Primer commit: web del Candás CF"
git branch -M main
```

Crea un nuevo repositorio en [github.com/new](https://github.com/new) (por ejemplo `candas-fc`), **sin README ni .gitignore** (ya los tenemos). Copia la URL que te da y:

```bash
git remote add origin https://github.com/TU_USUARIO/candas-fc.git
git push -u origin main
```

### 8. Despliega en Vercel

1. Entra en [vercel.com](https://vercel.com) y dale a **Add New → Project**.
2. Conecta tu GitHub y selecciona el repo `candas-fc`.
3. Vercel detecta Next.js automáticamente. **No toques la configuración**.
4. En **Environment Variables**, añade las dos variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Deploy**. En ~1 minuto tienes la web publicada en `https://candas-fc.vercel.app` (o similar).

### 9. Configura la URL en Supabase

Muy importante para que los emails y redirecciones funcionen:

1. En Supabase → **Authentication → URL Configuration**.
2. En **Site URL** pon tu URL de Vercel: `https://candas-fc.vercel.app`.
3. En **Redirect URLs** añade: `https://candas-fc.vercel.app/auth/callback`.

¡Listo! 🎉

---

## 📁 Estructura del proyecto

```
candas-fc/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Home
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── clasificacion/page.tsx
│   │   ├── simulador/page.tsx
│   │   ├── abonados/page.tsx        # Chat + viajes
│   │   ├── admin/page.tsx
│   │   ├── login/page.tsx
│   │   ├── registro/page.tsx
│   │   └── auth/callback/route.ts
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── TablaClasificacion.tsx
│   │   ├── Simulador.tsx
│   │   ├── ChatAbonados.tsx
│   │   ├── TablonViajes.tsx
│   │   └── AdminPanel.tsx
│   └── lib/
│       ├── supabase/{client,server,middleware}.ts
│       └── types.ts                 # Tipos + lógica de clasificación
├── supabase/
│   └── schema.sql                   # ⚠️ Ejecutar en Supabase
├── middleware.ts                    # Protege /abonados y /admin
├── .env.local.example
├── package.json
└── README.md
```

---

## 📊 Datos iniciales cargados (Segunda Asturfútbol Grupo 1 · 25/26)

El esquema SQL viene con el **snapshot de la Jornada 30** precargado. Al abrir la web verás directamente la tabla con el Candás **6º con 53 puntos**.

Cómo funciona internamente:
- Cada equipo tiene unas **estadísticas iniciales** (PJ, G, E, P, GF, GC) guardadas en la base de datos.
- La clasificación mostrada = estadísticas iniciales **+** los partidos que vaya metiendo el admin.
- Por tanto, **el admin solo debe meter partidos de la Jornada 31 en adelante** para que la tabla evolucione correctamente (si mete resultados de J1-J30 se sumarían por segunda vez).

Si quieres empezar desde cero (tabla vacía, sin el snapshot), edita `supabase/schema.sql` y pon todas las estadísticas iniciales a 0.

---

## 🎨 Personalización rápida

- **Colores**: `tailwind.config.ts` → sección `candas`.
- **Criterios de clasificación** (cuántos suben, play-off, descienden): `src/components/TablaClasificacion.tsx`, props `ascensoDirecto`, `playoff`, `descienden`. Valor por defecto ajustado a 25/26: **1 directo, 5 play-off, 3 descienden**.
- **Equipos de la liga**: desde `/admin` o editando el SQL inicial.
- **Nombre del club**: buscar `Candás CF` en el proyecto.

---

## 🔒 Sobre la seguridad

Las **Row Level Security (RLS)** de Supabase están configuradas así:

- Cualquiera puede **ver** la clasificación, equipos y partidos.
- Solo los usuarios con rol `admin` pueden **modificar** partidos y equipos.
- Solo los usuarios con rol `abonado` o `admin` (y que tengan `carnet`) pueden entrar al chat y al tablón de viajes.
- Cada usuario solo puede **borrar/editar sus propios** mensajes y viajes.

Aunque un usuario intente saltarse el middleware, la base de datos rechaza la operación. 👍

---

## ❓ Problemas comunes

**"No recibo el email de confirmación"**
→ Supabase → Authentication → Providers → Email → desactiva "Confirm email" para desarrollo. En producción puedes conectar un SMTP propio.

**"El chat no se actualiza en vivo"**
→ Asegúrate de haber añadido la tabla `mensajes` a la publicación realtime (paso 3.6 del tutorial, o ejecuta `alter publication supabase_realtime add table public.mensajes;`).

**"La clasificación aparece vacía"**
→ El admin aún no ha metido resultados en `/admin`. Mete al menos un resultado y refresca.

**"Me redirige fuera de /admin"**
→ Tu usuario no tiene rol `admin`. Ejecuta en SQL: `update public.profiles set rol = 'admin' where carnet = 'TU_CARNET';` y vuelve a hacer login.

---

## 📝 Licencia

Proyecto personal para la afición. Úsalo libremente.

¡Hala Candás! 🔴⚪
