import { createClient } from "@supabase/supabase-js";

// Leemos las variables secretas que guardaste en el .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Creamos y exportamos la conexión única
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
