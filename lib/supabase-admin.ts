import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function createSupabaseAdmin(): SupabaseClient {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
        throw new Error('Supabase URL ou clé manquante')
    }
    return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    })
}
