/**
 * Configuración e inicialización del cliente de Supabase.
 * Este archivo actúa como un Singleton, garantizando que solo exista 
 * una única instancia del cliente de Supabase en toda la aplicación.
 */
import { createClient } from '@supabase/supabase-js';

// Obtención de variables de entorno (específico de Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación estricta de las variables requeridas
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 'Faltan variables de entorno críticas. Verifica que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén definidas.';
  console.warn(errorMessage);
  // No lanzamos un Error fatal para permitir que la UI cargue y muestre el problema visualmente
  // en lugar de romper toda la aplicación (útil en primeros pasos de desarrollo).
}

// Creación de la instancia Singleton del cliente
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

export default supabase;
