// utils/supabase.ts
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uhrjptuvkvajpqznyikd.supabase.co'
const SUPABASE_ANON_KEY = 'https://uhrjptuvkvajpqznyikd.supabase.co'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)