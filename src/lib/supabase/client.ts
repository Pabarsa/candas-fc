import { createBrowserClient } from "@supabase/ssr";

function createCookieStorage() {
  return {
    getItem(key: string) {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(
        new RegExp(`(?:^|; )${encodeURIComponent(key)}=([^;]*)`)
      );
      return match ? decodeURIComponent(match[1]) : null;
    },
    setItem(key: string, value: string) {
      if (typeof document === "undefined") return;
      document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; sameSite=lax`;
    },
    removeItem(key: string) {
      if (typeof document === "undefined") return;
      document.cookie = `${encodeURIComponent(key)}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    },
  };
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Faltan variables de entorno de Supabase. Crea un archivo .env.local con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: createCookieStorage(),
    },
  });
}
