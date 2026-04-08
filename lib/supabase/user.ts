// lib/supabase/user.ts
import { supabase } from "@/app/utils/supabase"
import { UserProfile } from "./typeTable"

type supabaseAuthUser = {
  id: string
  email: string
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
}

export async function ensureUser(user: supabaseAuthUser): Promise<UserProfile | null> {
  if (!user) return null

  const fullName: string = user.user_metadata?.name || ""
  const [first_name, ...last] = fullName.split(" ")
  const last_name = last.join(" ")

  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email,
      first_name,
      last_name,
      avatar_url: user.user_metadata?.avatar_url || null,
      weight: null,
      height: null,
      age: null,
    })
    .select('*')
    .single()

  if (error) {
    console.error("Error upserting user:", error)
    return null
  }

  return data as UserProfile
}