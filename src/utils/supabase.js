/**
 * Supabase 客户端 — 手机号+密码登录
 *
 * ⚠️ 使用前需要在 Supabase 后台操作：
 *    Authentication → Settings → 关闭 "Confirm email"
 *    这样注册后不需要验证邮箱，直接就能登录
 */
import { createClient } from '@supabase/supabase-js'

// TODO: 替换为你的 Supabase URL 和 anon key
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// === 用户认证 ===

/** 注册 */
export async function signUp(phone, password) {
  const email = `user${phone}@recipe.app`
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

/** 登录 */
export async function signIn(phone, password) {
  const email = `user${phone}@recipe.app`
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

/** 退出 */
export async function signOut() {
  return supabase.auth.signOut()
}

/** 获取当前用户 */
export async function getUser() {
  const { data } = await supabase.auth.getUser()
  return data?.user || null
}

// === 收藏 ===

export async function getUserFavorites() {
  const { data, error } = await supabase.from('favorites').select('recipe_id')
  if (error) throw error
  return (data || []).map(r => r.recipe_id)
}

export async function addFavToDB(recipeId) {
  await supabase.from('favorites').upsert({ recipe_id: recipeId })
}

export async function removeFavFromDB(recipeId) {
  await supabase.from('favorites').delete().eq('recipe_id', recipeId)
}

// === 美食地图 ===

export async function getUserFoodMap() {
  const { data } = await supabase.from('food_map').select('*').order('created_at', { ascending: false })
  if (!data) return { cities: {} }
  const cities = {}
  data.forEach(item => {
    if (!cities[item.city]) cities[item.city] = []
    cities[item.city].push(item)
  })
  return { cities }
}

export async function addFoodMapToDB(item) {
  return supabase.from('food_map').insert(item)
}

export async function removeFoodMapFromDB(id) {
  return supabase.from('food_map').delete().eq('id', id)
}

export async function toggleFoodMapPublicInDB(id, isPublic) {
  return supabase.from('food_map').update({ is_public: isPublic }).eq('id', id)
}
