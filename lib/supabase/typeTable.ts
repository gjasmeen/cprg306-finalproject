export type UserProfile = {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar_url?: string | null
  weight?: number | null
  height?: number | null
  age?: number | null
}
export type UserInsert = {
  email: string,
  first_name: string
  last_name: string
}
export type CardioType = {
  id?: number
  user_id: string
  name: string
  minutes: number
  calories_burned: number
  date: string
}

export type CardioInsert = Omit<CardioType, "id">

export type StrengthType = {
  id?: number
  user_id: string
  name: string
  sets: number
  reps: number
  weight: number
  date: string
}

export type NutritionType = {
  id?: number
  user_id: string
  food_name: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
  date: string
}