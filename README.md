# 🔴⚪ Fondo Sur Canijo — Web de Aficionados del Candás CF

Web no oficial de aficionados del Candás CF. Clasificación en tiempo real, simulador de liga, zona exclusiva de abonados, galería de fotos y chat.

---

## 🛠️ Tecnologías

- **Next.js 14** (App Router) — framework web
- **Supabase** — base de datos, autenticación y almacenamiento de fotos
- **Vercel** — despliegue automático
- **Tailwind CSS** — estilos

---

## 📋 Requisitos previos

- Node.js 18 o superior
- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [Vercel](https://vercel.com) (gratis)
- Cuenta en [GitHub](https://github.com) (gratis)

---

## 🚀 Instalación desde cero

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/candas-fc.git
cd candas-fc
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Entra en [supabase.com](https://supabase.com) y crea un proyecto nuevo
2. Ve a **SQL Editor → New Query**
3. Copia y pega todo el contenido de `supabase/schema.sql` y pulsa **Run**
4. Ve a **Project Settings → API**
5. Copia la **Project URL** y la **anon public key**

### 4. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://XXXXXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### 5. Arrancar en local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 👤 Crear el primer usuario admin

1. Entra en tu web y regístrate en `/registro` con tu cuenta
2. Confirma el email (revisa la bandeja de entrada)
3. Ve a Supabase → **SQL Editor** y ejecuta:

```sql
UPDATE public.profiles
SET rol = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'TU_EMAIL@ejemplo.com'
);
```

A partir de ahí verás la pestaña **Admin** en la navbar.

---

## 📸 Dar acceso admin a la fotógrafa (u otro usuario)

1. La persona se registra normalmente en `/registro`
2. Confirma su email
3. Ejecuta en Supabase → SQL Editor:

```sql
UPDATE public.profiles
SET rol = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'EMAIL_DE_LA_PERSONA@gmail.com'
);
```

---

## ⚽ Gestión de la clasificación

### Actualizar resultados de jornadas

En el panel de **Admin → Resultados** puedes introducir los marcadores directamente desde la web.

Para actualizar el snapshot inicial de la clasificación (cuando ya han jugado todos), ve a Supabase → SQL Editor:

```sql
UPDATE public.equipos SET
  pj_inicial=30, pg_inicial=19, pe_inicial=8, pp_inicial=3
WHERE nombre = 'Real Avilés B';
-- Repite para cada equipo con los datos nuevos
```

### Añadir partidos nuevos de jornadas futuras

Desde **Admin → Crear partido**, selecciona local, visitante, jornada y fecha.

---

## 🖼️ Subir fotos a la galería

1. Entra con una cuenta **admin**
2. Ve a **Admin → 📸 Galería**
3. Sube la foto, añade título, descripción y el **@instagram** de la fotógrafa
4. Los abonados registrados la verán automáticamente en **Abonados → Galería**

---

## 🌐 Despliegue en Vercel

### Primera vez

1. Sube el proyecto a GitHub:
```bash
git add .
git commit -m "primer commit"
git push origin main
```

2. Entra en [vercel.com](https://vercel.com) → **Add New Project**
3. Importa tu repositorio de GitHub
4. En **Environment Variables** añade las mismas variables que en `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Pulsa **Deploy**

### Actualizaciones posteriores

Cada vez que hagas cambios:

```bash
git add .
git commit -m "descripción del cambio"
git push
```

Vercel lo despliega automáticamente en menos de 2 minutos.

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── abonados/        → Zona privada de abonados (chat, viajes, galería)
│   ├── admin/           → Panel de administración
│   ├── auth/callback/   → Callback de autenticación Supabase
│   ├── clasificacion/   → Tabla de clasificación
│   ├── legal/
│   │   ├── aviso-legal/     → Aviso legal
│   │   ├── privacidad/      → Política de privacidad
│   │   └── cookies/         → Política de cookies
│   ├── login/           → Inicio de sesión
│   ├── registro/        → Registro de nuevos usuarios
│   ├── simulador/       → Simulador de jornadas
│   ├── layout.tsx       → Layout global (navbar, footer, banner cookies)
│   └── page.tsx         → Página de inicio
├── components/
│   ├── AdminPanel.tsx       → Panel admin (resultados, partidos, equipos, galería)
│   ├── ChatAbonados.tsx     → Chat en tiempo real para abonados
│   ├── CookieBanner.tsx     → Banner de cookies (RGPD)
│   ├── GaleriaAbonados.tsx  → Galería de fotos para abonados
│   ├── Navbar.tsx           → Barra de navegación
│   ├── ProximosPartidos.tsx → Próximos partidos del Candás
│   ├── Simulador.tsx        → Componente simulador
│   ├── TablaClasificacion.tsx → Tabla de clasificación
│   └── TablonViajes.tsx     → Tablón de viajes compartidos
└── lib/
    ├── supabase/
    │   ├── client.ts    → Cliente Supabase (lado cliente)
    │   ├── server.ts    → Cliente Supabase (lado servidor)
    │   └── middleware.ts
    └── types.ts         → Tipos TypeScript
```

---

## 🗄️ Base de datos (tablas principales)

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Usuarios registrados (nombre, rol: abonado/admin) |
| `equipos` | Equipos de la liga con stats iniciales |
| `partidos` | Partidos con resultado y jornada |
| `mensajes` | Mensajes del chat de abonados |
| `viajes` | Tablón de viajes compartidos |
| `posts` | Publicaciones de la galería de fotos |

---

## ⚖️ Legal

- **Titular:** Pablo Aramendi Sánchez
- **Contacto:** pablo.aramendi.sanchez@outlook.com
- Web no oficial de aficionados, sin relación con el Candás CF ni ninguna federación deportiva
- Consulta `/legal/aviso-legal`, `/legal/privacidad` y `/legal/cookies`

---

## 🆘 Problemas frecuentes

**Error "Database error saving new user" al registrarse**
→ El trigger de Supabase puede haber fallado. Ejecuta en SQL Editor:
```sql
UPDATE public.profiles SET carnet = null WHERE carnet = '';
```

**Las páginas legales dan 404**
→ Asegúrate de que la estructura de carpetas sea `src/app/legal/aviso-legal/page.tsx` (con subcarpeta), no `src/app/legal/aviso-legal.tsx`

**La clasificación no se actualiza**
→ Comprueba que los partidos estén marcados como `jugado = true` desde el panel Admin

**El bucket de fotos no deja subir**
→ Verifica en Supabase → Storage que existe el bucket `galeria` y que las políticas RLS están activas

---

*¡Vamos Canijo! 🔴⚪ — Hecho con ❤️ en Candás*
