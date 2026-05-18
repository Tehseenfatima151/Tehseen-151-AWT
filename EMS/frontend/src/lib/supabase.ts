import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('[VoteSphere] Missing Supabase environment variables. Check your .env.local file.');
}

/**
 * Typed Supabase client — the single source of truth for all DB/Auth/Storage calls.
 * Never create another client instance; import this everywhere instead.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

// ── Typed shorthand helpers ───────────────────────────────────────────────────
export const db = supabase.from.bind(supabase);
export const auth = supabase.auth;
export const storage = supabase.storage;
export const realtime = supabase.channel.bind(supabase);

/**
 * Get current authenticated user session safely.
 * Returns null when unauthenticated — never throws.
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Get the current authenticated user's ID.
 * Returns null when unauthenticated.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

/**
 * Utility: throw a standardised error from Supabase responses.
 */
export function handleSupabaseError(error: { message: string } | null, context?: string): never {
  const msg = error?.message ?? 'An unexpected database error occurred.';
  console.error(`[Supabase${context ? `:${context}` : ''}]`, msg);
  throw new Error(msg);
}
